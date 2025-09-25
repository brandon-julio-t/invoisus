"use node";

import { openai, OpenAIResponsesProviderOptions } from "@ai-sdk/openai";
import { vWorkflowId } from "@convex-dev/workflow";
import { withTracing } from "@posthog/ai";
import { generateObject, generateText } from "ai";
import { v } from "convex/values";
import { z } from "zod";
import { internalAction } from "../../_generated/server";
import { createPosthogClient } from "../../libs/posthog";
import { r2 } from "../../r2";

const systemPrompt = `
You are a professional invoice audit expert. And your mission includes:
**First, you recognize 客戶號碼（總是1開頭，並不是2開頭的），然後categorize the customer into different types based on the knowledge base provided. Please use 客戶號碼到knowledge base內進行搜索，不要用客戶名稱，同時提取客戶號碼對應的客戶名稱

*** Second, 識別發票號碼，start with 2025（不是PO number/PO 號碼/P.O. No）

**Third, Please carefully analyze the invoice image uploaded by the user and detect whether there are problems，problems including traces of alteration, crossing-out,  modification in the following contents or missing stamp on the invoice

Item name and description
Quantity field
Unit price and amount fields

Look for the following signs of modification:
Cross-out deletion (priority focus)
Inconsistent fonts
handwriten numbers

** Forth, you try to categorize the problem of that based on the reminders below:

** Fifth, check if there is a stamp/seal on the invoice.

Output:
1. 發票日期(格式為yyyy-mm-dd、客戶號碼、客户名称、發票號碼

2. 如果你見到有劃單痕跡，找出是價錢/數量/貨號。並確定是什麼貨號。
2.1 如果價錢旁邊有寫上新的價錢，那就是"價錢問題"；
2.2 如果數量旁邊寫上了新的數量，那就是“數量問題”；
2.3 如果在貨號旁邊寫上了新的貨號，那就是貨號問題。
然後輸出是“數量問題”/“價錢問題”/”貨號或貨品名稱問題“ 到問題-1 類別Issue-1 Category列
2.4. 如果你發現invoice上沒有任何蓋章痕跡，那麼就輸出“不符合回單簽收要求”到問題-1 類別Issue-1 Category列
如果你沒有找到問題，就輸出“不確定”

3. give me the customer type, and then
   - if not sure, output 不確定 (增加不確定的權重)
   - If there are problems then output 有問題
final output format：客戶類型（檢測結果），例如：Type A（有問題）、Type C（不確定）

Reminder: 
*** 首先排除chop，在chop（蓋章）上的內容，不需要關注，千萬不要識別為有問題
***checkmarks are completely acceptable and do not constitute an issue. At the same time, be careful not to misidentify stamp areas as cross-out deletions.
***Review the invoice，PO as a 輔助，需要的時候可以幫助分析
***Overlap between numbers and a long straight line is not an issue, as this may be a line of the table.
*** there will be hand-write signature, which may lead to confusion, be careful
*** 最後命名pdf的name, 要例如Type A (有問題), Type B (不確定), 絕對不要放入客戶名字或者號碼。
*** 最終上傳原本的完整pdf，不要只取裡面一頁
*** 客戶號碼，不是客戶鋪號
*** 不要將“有問題”或者“不確定”輸出到excel中。只需要輸出“數量問題”或者“價錢問題”或“不符合回單簽收要求”到google sheet中的H列
*** 問題類型只能夠輸出一種問題類型，不要多種
*** 如果在Knowledge Base裡找不到對應的類型，統一默認為Type A
*** 最終輸出的文件名，問題只有兩大類，有問題/不確定，沒有無問題
*** PO number不是發票號碼

Please use computer technology to open and analyze the image file, and provide a detailed detection report.
`.trim();

const createModel = ({
  userId,
  traceId,
  metadata,
}: {
  userId: string | undefined;
  traceId: string | undefined;
  metadata: Record<string, string> & {
    functionName: string;
  };
}) => {
  const phClient = createPosthogClient();

  const baseModel = openai("gpt-5");

  return {
    model: withTracing(baseModel, phClient, {
      posthogDistinctId: userId,
      posthogTraceId: traceId,
      posthogProperties: metadata,
      posthogGroups: metadata,
    }),

    phClient,
  };
};

const providerOptions = {
  openai: {
    // reasoningEffort: "minimal", // can uncomment for maximum speed
  } satisfies OpenAIResponsesProviderOptions,
};

export const analyzeInvoiceWithAi = internalAction({
  args: {
    userId: v.id("users"),
    workflowId: vWorkflowId,
    fileName: v.string(),
    fileSize: v.number(),
    fileType: v.string(),
    fileKey: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("args", args);

    const fileUrl = await r2.getUrl(args.fileKey);
    console.log("fileUrl", fileUrl);

    const { model, phClient } = createModel({
      userId: args.userId,
      traceId: args.workflowId,
      metadata: {
        functionName: "analyzeInvoiceWithAi",
      },
    });

    const analysisResult = await generateText({
      model,

      providerOptions,

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

    return analysisResult.text;
  },
});

export const extractDataFromInvoiceWithAi = internalAction({
  args: {
    userId: v.id("users"),
    workflowId: vWorkflowId,
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

    const { model, phClient } = createModel({
      userId: args.userId,
      traceId: args.workflowId,
      metadata: {
        functionName: "extractDataFromInvoiceWithAi",
      },
    });

    const dataExtractionResult = await generateObject({
      model,

      providerOptions,

      schema: z.object({
        invoiceDate: z.iso.date(),
        customerNumber: z.string(),
        customerName: z.string().describe(
          `
不要寫入成記欄有限公司，寫入從knowledge base中找到的客戶名稱
`.trim(),
        ),
        invoiceNumber: z.string(),
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

    return dataExtractionResult.object;
  },
});
