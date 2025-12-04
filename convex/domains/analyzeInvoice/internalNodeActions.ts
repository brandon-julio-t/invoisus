"use node";

import { vWorkflowId } from "@convex-dev/workflow";
import type { UserContent } from "ai";
import { generateObject, generateText, stepCountIs } from "ai";
import { v } from "convex/values";
import { z } from "zod";
import { internal } from "../../_generated/api";
import { internalAction } from "../../_generated/server";
import { r2 } from "../../r2";
import { createModel } from "./aiModelFactory";
import { getCustomerByNumber } from "./aiTools";
import { vModelPreset } from "./validators";

export const analyzeInvoiceWithAi = internalAction({
  args: {
    userId: v.id("users"),
    workflowId: vWorkflowId,
    modelPreset: vModelPreset,
    fileName: v.string(),
    fileSize: v.number(),
    fileType: v.string(),
    fileKey: v.string(),
    imageFileKeys: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    console.log("args", args);

    const fileUrl = await r2.getUrl(args.fileKey).then(async (url) => {
      /**
       * @see https://github.com/vercel/ai/issues/10349
       */
      const isModelNeedBase64 = args.modelPreset === "gemini-3-pro-preview";
      console.log("isModelNeedBase64", isModelNeedBase64);
      if (!isModelNeedBase64) {
        console.log("url", url);
        return url;
      }

      console.log("fetching url", url);
      const response = await fetch(url);
      console.log("response", response);

      console.log("making array buffer...");
      const arrayBuffer = await response.arrayBuffer();
      console.log("arrayBuffer done");

      console.log("converting to base64...");
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      console.log("base64 done");

      return base64;
    });

    const imageFileUrls = await Promise.all(
      args.imageFileKeys.map(
        async (imageFileKey) => await r2.getUrl(imageFileKey),
      ),
    );
    console.log("imageFileUrls", imageFileUrls);

    const analysisConfiguration = await ctx.runQuery(
      internal.domains.analysisConfigurations.internalQueries
        .getAnalysisConfiguration,
    );
    console.log("analysisConfiguration", analysisConfiguration);
    if (!analysisConfiguration) {
      throw new Error("Analysis configuration not found");
    }

    const pdfAnalysisPrompt: string = analysisConfiguration.pdfAnalysisPrompt;
    const dataExtractionPrompt: string =
      analysisConfiguration.dataExtractionPrompt;

    const { phClient, model } = createModel({
      modelPreset: args.modelPreset,
      userId: args.userId,
      traceId: args.workflowId,
      metadata: {
        functionName: "analyzeInvoiceWithAi",
        fileName: args.fileName,
        fileSize: args.fileSize,
        fileType: args.fileType,
        fileKey: args.fileKey,
      },
    });

    const userContent: UserContent = [
      {
        type: "text",
        text: `
<mandatory_fields_to_be_analyzed>
${dataExtractionPrompt}
</mandatory_fields_to_be_analyzed>

<file_name>
${args.fileName}
</file_name>

<file_type>
${args.fileType}
</file_type>
`.trim(),
      },
    ];

    if (imageFileUrls.length <= 0) {
      userContent.push({
        type: "file",
        data: fileUrl,
        mediaType: args.fileType,
        filename: args.fileName,
      });
    } else {
      imageFileUrls.forEach((imageFileUrl) => {
        userContent.push({
          type: "image",
          image: imageFileUrl,
          mediaType: "image/png",
        });
      });
    }

    console.log("userContent", userContent);

    const analysisResult = await generateText({
      model,

      stopWhen: stepCountIs(20),

      tools: {
        getCustomerByNumber: getCustomerByNumber(ctx),
      },

      system: pdfAnalysisPrompt,

      prompt: [
        {
          role: "user",
          content: userContent,
        },
      ],
    })
      .catch((error) => {
        console.error("error", error);
        throw error;
      })
      .finally(async () => {
        await phClient.shutdown();
      });

    console.log("analysisResult", analysisResult);

    const result = {
      text: analysisResult.text,
    };

    console.log("result", result);

    return result;
  },
});

const outputSchema = z.object({
  data: z.array(
    z.object({
      key: z.string(),
      value: z.string(),
    }),
  ),
});

export const extractDataFromInvoiceWithAi = internalAction({
  args: {
    userId: v.id("users"),
    workflowId: vWorkflowId,
    modelPreset: vModelPreset,
    supplementaryAnalysisResult: v.string(),
    fileName: v.string(),
    fileSize: v.number(),
    fileType: v.string(),
    fileKey: v.string(),
  },
  handler: async (ctx, args): Promise<Record<string, string>> => {
    console.log("args", args);

    const analysisConfiguration = await ctx.runQuery(
      internal.domains.analysisConfigurations.internalQueries
        .getAnalysisConfiguration,
    );
    console.log("analysisConfiguration", analysisConfiguration);
    if (!analysisConfiguration) {
      throw new Error("Analysis configuration not found");
    }

    const { phClient, model } = createModel({
      modelPreset: args.modelPreset,
      userId: args.userId,
      traceId: args.workflowId,
      metadata: {
        functionName: "extractDataFromInvoiceWithAi",
        fileName: args.fileName,
        fileSize: args.fileSize,
        fileType: args.fileType,
        fileKey: args.fileKey,
      },
    });

    const maxAttempts = 3;
    let attempt = 0;

    let result = {} as Record<string, string>;
    let errors = [] as string[];

    while (true) {
      attempt++;

      console.log("attempt", attempt);

      const dataExtractionResult = await generateObject({
        model,

        schema: outputSchema,

        system: analysisConfiguration.dataExtractionPrompt,

        prompt: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `
<max_attempts>
${maxAttempts}
</max_attempts>

<attempts>
${attempt}
</attempts>

<previous_output>
${result ? JSON.stringify(result) : "`null`"}
</previous_output>

<errors>
${errors.map((error, i) => `${i + 1}. ${error}`).join("\n")}
</errors>

<supplementary_analysis_result>
${args.supplementaryAnalysisResult}
</supplementary_analysis_result>

<file_name>
${args.fileName}
</file_name>
`.trim(),
              },
            ],
          },
        ],
      })
        .catch((error) => {
          console.error("error", error);
          throw error;
        })
        .finally(async () => {
          await phClient.shutdown();
        });

      console.log("dataExtractionResult", dataExtractionResult);

      const object = dataExtractionResult.object;
      console.log("object", object);

      result = object.data.reduce(
        (acc, { key, value }) => {
          acc[key] = value;
          return acc;
        },
        {} as Record<string, string>,
      );
      console.log("result", result);

      errors = [];
      Object.entries(result).forEach(([field, value]) => {
        if (!value) {
          errors.push(
            `The field \`${field}\` is required and cannot be empty. You gave: \`${value}\``,
          );
        }
      });

      console.log("errors", errors);

      const shouldReturn = errors.length <= 0 || attempt >= maxAttempts;
      console.log("shouldReturn", shouldReturn);
      if (shouldReturn) {
        if (result.customerNumber) {
          const foundCustomerByNumber = await ctx.runQuery(
            internal.domains.customers.internalQueries.getCustomerByNumber,
            { number: result.customerNumber },
          );

          console.log("foundCustomerByNumber", foundCustomerByNumber);

          if (foundCustomerByNumber) {
            return {
              ...result,
              customerName: foundCustomerByNumber.name,
              customerGroup: foundCustomerByNumber.group,
              customerProblemType: foundCustomerByNumber.problemType,
            };
          }
        }

        if (result.customerName) {
          const foundCustomerByName = await ctx.runQuery(
            internal.domains.customers.internalQueries.searchCustomerByName,
            { name: result.customerName },
          );

          console.log("foundCustomerByName", foundCustomerByName);

          if (foundCustomerByName) {
            return {
              ...result,
              customerName: foundCustomerByName.name,
              customerGroup: foundCustomerByName.group,
              customerProblemType: foundCustomerByName.problemType,
            };
          }
        }

        if (result.customerGroup) {
          const foundCustomerByGroup = await ctx.runQuery(
            internal.domains.customers.internalQueries.searchCustomerByGroup,
            { group: result.customerGroup },
          );

          console.log("foundCustomerByGroup", foundCustomerByGroup);

          if (foundCustomerByGroup) {
            return {
              ...result,
              customerName: foundCustomerByGroup.name,
              customerGroup: foundCustomerByGroup.group,
              customerProblemType: foundCustomerByGroup.problemType,
            };
          }
        }

        return result;
      }
    }
  },
});
