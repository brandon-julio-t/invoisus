"use client";

import { api } from "@/convex/_generated/api";
import { formatCamelCaseToHuman, formatFileSize } from "@/lib/strings";
import { FunctionReturnType } from "convex/server";
import { format } from "date-fns";
import * as XLSX from "xlsx";

export const exportWorkflowDetailsToExcel = ({
  workflowData,
}: {
  workflowData: FunctionReturnType<
    typeof api.domains.analyzeInvoice.queries.getAnalysisWorkflowDetail
  >;
}) => {
  const { header, details } = workflowData;

  // Collect all unique data extraction keys across all details
  const allDataExtractionKeys = new Set<string>();
  details.forEach((detail) => {
    if (detail.dataExtractionResult) {
      Object.keys(detail.dataExtractionResult).forEach((key) => {
        allDataExtractionKeys.add(key);
      });
    }
  });

  // Convert to sorted array for consistent column ordering
  const sortedDataExtractionKeys = Array.from(allDataExtractionKeys).toSorted(
    (a, b) => {
      // Invoice Date
      if (a === "invoiceDate") return -1;
      if (b === "invoiceDate") return 1;

      // Customer Number
      if (a === "customerNumber") return -1;
      if (b === "customerNumber") return 1;

      // Customer Name
      if (a === "customerName") return -1;
      if (b === "customerName") return 1;

      // Customer Group
      if (a === "customerGroup") return -1;
      if (b === "customerGroup") return 1;

      // Invoice Number
      if (a === "invoiceNumber") return -1;
      if (b === "invoiceNumber") return 1;

      // Issue Category
      if (a === "issueCategory") return -1;
      if (b === "issueCategory") return 1;

      // Customer Type
      if (a === "customerType") return -1;
      if (b === "customerType") return 1;

      // Customer Problem Type
      if (a === "customerProblemType") return -1;
      if (b === "customerProblemType") return 1;

      // Problem Existance Type
      if (a === "problemExistanceType") return -1;
      if (b === "problemExistanceType") return 1;

      return a.localeCompare(b);
    },
  );

  // Prepare data for Excel export
  const excelData = details.map((detail, index) => {
    // Add dynamic columns for data extraction results
    const dataExtractionColumns: Record<string, string> = {};
    sortedDataExtractionKeys.forEach((key) => {
      dataExtractionColumns[formatCamelCaseToHuman(key)] =
        detail.dataExtractionResult?.[key] || "";
    });

    const baseData = {
      "Row #": index + 1,
      "File Name": detail.fileName,
      ...dataExtractionColumns,
      "File Type": detail.fileType,
      "File Size": formatFileSize(detail.fileSize),
      Status: detail.status,
      "Problem Existence Type": detail.problemExistanceType || "",
      "Analysis Result": detail.analysisResult || "",
      "Error Message": detail.errorMessage || "",
      "Workflow ID": detail.workflowId,
      "File Key": detail.fileKey,
      "Created At": format(detail._creationTime, "yyyy-MM-dd HH:mm:ss"),
    };

    return baseData;
  });

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet);

  // Generate filename with workflow ID and date
  const formattedDate = format(header._creationTime, "yyyy-MM-dd");
  const filename = `workflow-details-${header._id}-${formattedDate}.xlsx`;

  // Write file
  XLSX.writeFile(workbook, filename);
};
