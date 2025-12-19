"use node";

import { vWorkflowId } from "@convex-dev/workflow";
import { openrouter } from "@openrouter/ai-sdk-provider";
import { withTracing } from "@posthog/ai";
import type { UserContent } from "ai";
import { generateText, hasToolCall, stepCountIs, tool } from "ai";
import { v } from "convex/values";
import { z } from "zod";
import { internal } from "../../../_generated/api";
import { internalAction } from "../../../_generated/server";
import { createPosthogClient } from "../../../libs/posthog";
import { r2 } from "../../../r2";
import { queryCustomerDataByCustomerNumber } from "../aiTools";
import { vModelPreset } from "../validators";

export const internalActionFn = internalAction({
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

    const fileUrl = await r2.getUrl(args.fileKey);

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

    const phClient = createPosthogClient();

    const metadata = {
      functionName: "analyzeInvoiceWithAi",
      fileName: args.fileName,
      fileSize: args.fileSize,
      fileType: args.fileType,
      fileKey: args.fileKey,
    };

    const posthogProperties = {
      posthogDistinctId: args.userId,
      posthogTraceId: args.workflowId,
      posthogProperties: metadata,
      posthogGroups: metadata,
    };

    const model = withTracing(
      openrouter("openai/gpt-5.2"),
      phClient,
      posthogProperties,
    );

    console.log("model", model);

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

    console.log("userContent", userContent);

    const analysisResult = await generateText({
      model,

      stopWhen: [stepCountIs(100), hasToolCall("submitFinalReport")],

      tools: {
        queryDataFromInvoice: tool({
          description: "Query data from the invoice.",
          inputSchema: z.object({
            query: z
              .string()
              .describe(
                "The question or inquiry you want to ask to query data from the invoice.",
              ),
          }),
          execute: async (toolArgs) => {
            const span = "queryDataFromInvoice";

            console.log(span, "toolArgs", toolArgs);

            const model = withTracing(
              openrouter("openai/gpt-5.2"),
              phClient,
              posthogProperties,
            );

            console.log(span, "model", model);

            const fileAsBase64 = await fetch(fileUrl).then(async (response) => {
              const arrayBuffer = await response.arrayBuffer();
              return Buffer.from(arrayBuffer).toString("base64");
            });

            const userContent: UserContent = [
              {
                type: "text",
                text: toolArgs.query,
              },
              {
                type: "file",
                data: fileAsBase64,
                mediaType: args.fileType,
                filename: args.fileName,
              },
            ];

            console.log(span, "userContent", userContent);

            const result = await generateText({
              model,

              stopWhen: [stepCountIs(100)],

              system:
                "Answer the user's question or inquiry based on the given invoice file. The answer should be in a concise and clear format.",

              prompt: [
                {
                  role: "user",
                  content: userContent,
                },
              ],
            });

            console.log(span, "result.text", result.text);

            return {
              text: result.text,
            };
          },
        }),

        queryCustomerDataByCustomerNumber:
          queryCustomerDataByCustomerNumber(ctx),

        submitFinalReport: tool({
          description: "Submit the final report of your analysis.",
          inputSchema: z.object({
            finalReport: z
              .string()
              .describe("The final report of your analysis."),
          }),
          execute: async (args) => {
            console.log("submitFinalReport", args);
            return {
              text: "Final report submitted",
            };
          },
        }),
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
