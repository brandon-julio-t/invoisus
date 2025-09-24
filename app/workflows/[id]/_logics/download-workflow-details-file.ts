"use client";

import { api } from "@/convex/_generated/api";
import { triggerBrowserDownloadFileFromBlob } from "@/lib/file-download";
import { FunctionReturnType } from "convex/server";
import JSZip from "jszip";
import { toast } from "sonner";

export const downloadWorkflowDetailsFile = async ({
  workflowData,
}: {
  workflowData: FunctionReturnType<
    typeof api.domains.analyzeInvoice.queries.getAnalysisWorkflowDetail
  >;
}) => {
  const { header, details } = workflowData;

  // Group details by problem existence type
  const groupedDetails = details.reduce(
    (groups, detail) => {
      const folderName = detail.problemExistanceType || "Uncategorized";
      if (!groups[folderName]) {
        groups[folderName] = [];
      }
      groups[folderName].push(detail);
      return groups;
    },
    {} as Record<string, typeof details>,
  );

  // Create ZIP file
  const zip = new JSZip();

  // Process all folders in parallel
  await Promise.all(
    Object.entries(groupedDetails).map(async ([folderName, folderDetails]) => {
      const folder = zip.folder(folderName);

      if (!folder) {
        const msg = `[! Should not happen !]: Failed to create folder: ${folderName}`;
        console.error(msg);
        toast.error(msg);
        return;
      }

      // Download all files in this folder in parallel
      await Promise.all(
        folderDetails.map(async (detail) => {
          try {
            const response = await fetch(detail.fileDownloadUrl);
            if (!response.ok) {
              const msg = `Failed to download file: ${detail.fileName}`;
              console.error(msg);
              toast.error(msg);
              return;
            }

            const blob = await response.blob();
            folder.file(detail.fileName, blob);
          } catch (error) {
            console.error(`Error downloading ${detail.fileName}:`, error);
            toast.error(`Error downloading ${detail.fileName}:`, {
              description:
                error instanceof Error ? error.message : String(error),
            });
          }
        }),
      );
    }),
  );

  // Generate and download the ZIP file
  try {
    const zipBlob = await zip.generateAsync({ type: "blob" });

    // Create download link
    triggerBrowserDownloadFileFromBlob({
      blob: zipBlob,
      filename: `workflow-details-${header._id}.zip`,
    });
  } catch (error) {
    console.error("Error generating ZIP file:", error);
    throw new Error("Failed to generate ZIP file");
  }
};
