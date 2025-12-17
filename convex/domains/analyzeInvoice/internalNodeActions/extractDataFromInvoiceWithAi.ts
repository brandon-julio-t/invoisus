"use node";

import { vWorkflowId } from "@convex-dev/workflow";
import { generateObject } from "ai";
import { v } from "convex/values";
import { z } from "zod";
import { internal } from "../../../_generated/api";
import { internalAction } from "../../../_generated/server";
import { createModel } from "../aiModelFactory";
import { vModelPreset } from "../validators";

const outputSchema = z.object({
  data: z.array(
    z.object({
      key: z.string(),
      value: z.string(),
    }),
  ),
});

export const internalActionFn = internalAction({
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
