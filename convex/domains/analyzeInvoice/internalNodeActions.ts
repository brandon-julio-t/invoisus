"use node";

import { OpenAIResponsesProviderOptions } from "@ai-sdk/openai";
import { vWorkflowId } from "@convex-dev/workflow";
import { generateObject, generateText, stepCountIs } from "ai";
import { v } from "convex/values";
import { z } from "zod";
import { internalAction } from "../../_generated/server";
import { r2 } from "../../r2";
import { createModel } from "./aiModelFactory";
import { getCustomerByNumber } from "./aiTools";
import { vModelPreset } from "./validators";

const systemPrompt = `
- Goal: 
You are a professional invoice audit expert. You have to utilize your vision/document processing capability, and your mission includes:
1, recognizing 客戶號碼（總是1開頭，並不是2開頭的），然後categorize the customer into different types based on the knowledge base provided（eg.Type A, Type F). Please use 客戶號碼到knowledge base內進行搜索，不要用客戶名稱，同時提取客戶號碼對應的客戶名稱以及群組
2, 識別發票號碼，start with 2025（不是PO number/PO 號碼/P.O. No）
3. 識別invoice上的明細，識別貨號，貨品名稱，數量，單價，金額（不是PO上的）

4. 根據所識別到的客戶具體type，檢查不同的內容，必須嚴格遵循此規則：
4.1 如果是A或者B
4.1.1 如果invoice上價錢有劃掉的痕跡，或者旁邊有寫上新的價錢，那就是"價錢問題"；
4.1.2 如果發現invoice上數量有劃掉的痕跡，或者旁邊寫上了新的數量，那就是“數量問題”；
4.1.3 如果你發現invoice上沒有任何蓋章痕跡，那麼就屬於“不符合回單簽收要求”的問題
4.1.4 如果Invoice上以及PO上的貨號並不一致，那麼就是貨號或貨品名稱問題
4.1.5 如果發現invoice上有item的單價或者金額為0或者空（即沒有具體值），那屬於金額問題（文件上沒有就是沒有，不要捏造）
4.1.6 !!!如果你沒有找到問題，就輸出“不確定”

4.2 如果是F, 上面第2點中的內容，除了不需要關注4.1.1: 價錢問題，其他項目都要檢查，同時，檢查是否有stamp/seal on the invoice，如果有，沒有問題；如果沒有，就是“不符合回單簽收要求”問題

4.3 如果是C或D或E
check if there is a stamp/seal on the invoice；如果沒有，就是“不符合回單簽收要求”問題

Output process:
1. 輸出根據customer number找到的Type
2. 發票日期(格式為yyyy-mm-dd、客戶號碼、客户名称、客戶群組、發票號碼
3. Invoice上以及PO上的貨號（沒有找到值的話，就輸出空）
4. 輸出invoice上的明細，識別貨號，貨品名稱，數量，單價，金額
5. 輸出問題類型
輸出例如“數量問題”/“價錢問題”/”貨號或貨品名稱問題“/“不符合回單簽收要求”的問題
6. give me the customer type, and then
    - if not sure, output 不確定 (增加不確定的權重)
    - If there are problems then output 有問題
    final output format：客戶類型（檢測結果），例如：Type A（有問題）、Type C（不確定）

Reminder:
* 首先排除chop，在chop（蓋章）上的內容，不需要關注，千萬不要識別為有問題
* checkmarks are completely acceptable and do not constitute an issue. At the same time, be careful not to misidentify stamp areas as cross-out deletions.
* Overlap between numbers and a long straight line is not an issue, as this may be a line of the table.
there will be hand-write signature, which may lead to confusion, be careful
* 客戶號碼，不是客戶鋪號
* 問題類型只能夠輸出一種問題類型，不要多種
* PO number不是發票號碼
* 為空的內容沒有就是沒有，不要推理輸出不正確的東西
* 如果單價或者金額為空，那輸出金額問題，不要輸出貨號或貨品名稱問題
* 注意，一開始搞清楚是哪個type最重要，根據這個去判斷要識別哪些問題
`.trim();

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

    const { phClient, model, providerOptions } = createModel({
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

      providerOptions: {
        ...providerOptions,
        openai: {
          ...providerOptions.openai,
          textVerbosity: "high", // invoice analyst should be "talkative"
        } satisfies OpenAIResponsesProviderOptions,
      },

      stopWhen: stepCountIs(20),

      tools: {
        getCustomerByNumber: getCustomerByNumber(ctx),
      },

      system: systemPrompt,

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

    console.log("analysisResult", analysisResult);

    await phClient.shutdown();

    const result = {
      text: analysisResult.text,
      previousResponseId: analysisResult.response.id,
    };

    console.log("result", result);

    return result;
  },
});

export const extractDataFromInvoiceWithAi = internalAction({
  args: {
    userId: v.id("users"),
    workflowId: vWorkflowId,
    modelPreset: vModelPreset,
    supplementaryAnalysisResult: v.string(),
    previousResponseId: v.string(),
    fileName: v.string(),
    fileSize: v.number(),
    fileType: v.string(),
    fileKey: v.string(),
  },
  handler: async (_ctx, args) => {
    console.log("args", args);

    const fileUrl = await r2.getUrl(args.fileKey);
    console.log("fileUrl", fileUrl);

    const { phClient, model, providerOptions } = createModel({
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

    const dataExtractionResult = await generateObject({
      model,

      providerOptions: {
        ...providerOptions,
        openai: {
          ...providerOptions.openai,
          previousResponseId: args.previousResponseId,
        } satisfies OpenAIResponsesProviderOptions,
      },

      schema: z.object({
        invoiceDate: z.iso.date(),
        customerNumber: z.string(),
        customerName: z.string(),
        customerGroup: z.string(),
        customerProblemType: z.string(),

        invoiceNumber: z.string().describe(
          `
The invoice number as the identifier of the invoice.
the format is generally like YYYY-XXXXX, for example: 1970-12345.
But do not take it for granted, as the last few digits may vary, so please read the labels carefully.
This data is required, so please read the invoice and labels carefully.
`.trim(),
        ),
        issueCategory: z.string().describe(
          `
分類為“數量問題”或者“價錢問題”或者“貨號或貨品名稱問題“/“不符合回單簽收要求”，不要寫入劃單/無劃單
`.trim(),
        ),
        problemExistanceType: z.enum(["certainly has problem", "not certain"]),
      }),

      system: systemPrompt,

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
            {
              type: "text",
              text: `
<supplementary_analysis_result>${args.supplementaryAnalysisResult}</supplementary_analysis_result>
              `.trim(),
            },
          ],
        },
      ],
    });

    console.log("dataExtractionResult", dataExtractionResult);

    await phClient.shutdown();

    const result = dataExtractionResult.object;

    console.log("result", result);

    return result;
  },
});
