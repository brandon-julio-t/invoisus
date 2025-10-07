"use node";

import { vWorkflowId } from "@convex-dev/workflow";
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
  },
  handler: async (ctx, args) => {
    console.log("args", args);

    const fileUrl = await r2.getUrl(args.fileKey);
    console.log("fileUrl", fileUrl);

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
          content: [
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
            {
              type: "file",
              data: fileUrl,
              mediaType: args.fileType,
              filename: args.fileName,
            },
          ],
        },
      ],
    });

    console.log("analysisResult", analysisResult);

    await phClient.shutdown();

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
  handler: async (ctx, args) => {
    console.log("args", args);

    const fileUrl = await r2.getUrl(args.fileKey);
    console.log("fileUrl", fileUrl);

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

<file_type>
${args.fileType}
</file_type>
`.trim(),
              },
              {
                type: "file",
                data: fileUrl,
                mediaType: args.fileType,
                filename: args.fileName,
              },
            ],
          },
        ],
      });

      console.log("dataExtractionResult", dataExtractionResult);

      await phClient.shutdown();

      const object = dataExtractionResult.object as z.infer<
        typeof outputSchema
      >;
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
        return result;
      }
    }
  },
});
