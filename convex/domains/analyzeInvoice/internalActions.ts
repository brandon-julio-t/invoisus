import { openai, OpenAIResponsesProviderOptions } from "@ai-sdk/openai";
import { generateText, stepCountIs } from "ai";
import { v } from "convex/values";
import { internalAction } from "../../_generated/server";
import { r2 } from "../../r2";

export const analyzeInvoiceWithAi = internalAction({
  args: {
    fileName: v.string(),
    fileSize: v.number(),
    fileType: v.string(),
    fileKey: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("args", args);

    const fileUrl = await r2.getUrl(args.fileKey);
    console.log("fileUrl", fileUrl);

    const result = await generateText({
      model: openai("gpt-5-mini"),

      providerOptions: {
        openai: {
          reasoningEffort: "minimal",
        } satisfies OpenAIResponsesProviderOptions,
      },

      stopWhen: stepCountIs(20),

      prompt: [
        {
          role: "user",
          content: [
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

    console.log("result", result);

    return result.text;
  },
});
