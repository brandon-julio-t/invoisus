"use node";

import { auth, sheets } from "@googleapis/sheets";
import { v } from "convex/values";
import { internalAction } from "../../../_generated/server";

export const internalActionFn = internalAction({
  args: {
    // {
    //   customerGroup: "永旺",
    //   customerName: "永旺將軍澳",
    //   customerNumber: "100314",
    //   customerProblemType: "A",
    //   invoiceDate: "2025-04-03",
    //   invoiceNumber: "2025-16641",
    //   issueCategory:
    //     "Store code不一致, Invoice與PO總金額不符, 數量問題",
    //   item: "美國爵士蘋果6x16",
    //   problemExistanceType: "certainly has problem",
    // }
    aiDataExtractionResult: v.record(v.string(), v.string()),
  },
  handler: async (_ctx, args) => {
    console.log("args", args);

    // https://docs.google.com/spreadsheets/d/1sN6qJ97qcBnMj2znGmqHrSQK4BYX6TqgNtkIMC0ohuY/edit?gid=1997610999#gid=1997610999
    const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;

    const SPREADSHEET_SHEET_NAME = process.env.GOOGLE_SHEETS_SHEET_NAME!;

    console.log("SPREADSHEET_ID", SPREADSHEET_ID);
    console.log("SPREADSHEET_SHEET_NAME", SPREADSHEET_SHEET_NAME);

    const authInstance = new auth.GoogleAuth({
      credentials: {
        private_key: process.env.GOOGLE_AUTH_PRIVATE_KEY!,
        client_email: process.env.GOOGLE_AUTH_CLIENT_EMAIL!,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheetsInstance = sheets({ version: "v4", auth: authInstance });

    const result = await sheetsInstance.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SPREADSHEET_SHEET_NAME}!A1`, // The sheet you want to append to
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [
          [
            args.aiDataExtractionResult.invoiceDate || "N/A", // `(${Date.now()}) 2025-04-28`,
            args.aiDataExtractionResult.customerNumber || "N/A", // "100314",
            args.aiDataExtractionResult.customerName || "N/A", // "永旺將軍澳",
            args.aiDataExtractionResult.customerGroup || "N/A", // "永旺",
            args.aiDataExtractionResult.invoiceNumber || "N/A", // "2025-22311",
            "N/A", // "$970.00",
            "",
            args.aiDataExtractionResult.issueCategory || "N/A", // "數量問題",
            args.aiDataExtractionResult.issueCategory || "N/A", // "數量問題",
            "",
            args.aiDataExtractionResult.item || "N/A", // "2090330",
            "",
            "N/A", // "39",
            "N/A", // "39.5",
            "",
            "N/A", // "$20.00",
            "N/A", // "$20.00",
            "",
            "N/A", // "想請教一下為什麼會出現invoice同PO重量不一樣的情況？\n" +
            //   "\n" +
            //   "Wing 20250925 : \n" +
            //   "某d item 按重量收費 (example 大樹菠蘿), 貨品到舖後收貨人員都會即場再磅一下重量, 當中就會出現variance",
            "N/A", // "Got it",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "N/A", // "Ting",
            "N/A", // "2025-05-05",
            "",
            "",
            "N/A", // "Rebecca",
            "N/A", // "Y",
            "N/A", // "重量已改系統",
            "",
            "",
            "",
            "N/A", // "2025-08-27",
            "N/A", // "2025-05-21",
            "N/A", // "Y",
            "N/A", // "0.00",
            "N/A", // "Settled",
          ],
        ], // Array of values for the row
      },
    });

    console.log(`cells appended`, result.data);
  },
});
