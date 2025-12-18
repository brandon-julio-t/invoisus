import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { triggerBrowserDownloadFileFromUrl } from "@/lib/file-download";
import { useMutation } from "convex/react";
import React from "react";
import { toast } from "sonner";

export const DownloadFileButton = ({
  fileKey,
  filename,
  children,
  ...buttonProps
}: {
  fileKey: string;
  filename: string;
  children:
    | React.ReactNode
    | ((args: { isDownloading: boolean }) => React.ReactNode);
} & Pick<React.ComponentProps<typeof Button>, "variant" | "size">) => {
  const generateDownloadUrl = useMutation(api.r2.generateDownloadUrl);

  const [isDownloading, startDownloading] = React.useTransition();
  const onDownloadFile = async () => {
    startDownloading(async () => {
      const fileDownloadUrl = await toast
        .promise(generateDownloadUrl({ key: fileKey }), {
          loading: `Generating download URL for file...`,
          success: `Download URL generated for file.`,
          error: `Failed to generate download URL for file.`,
        })
        .unwrap();

      await toast
        .promise(
          triggerBrowserDownloadFileFromUrl({
            url: fileDownloadUrl,
            filename: filename,
          }),
          {
            loading: `Downloading file ${filename}...`,
            success: `File ${filename} downloaded successfully`,
            error: `Failed to download file ${filename}`,
          },
        )
        .unwrap();
    });
  };

  return (
    <Button {...buttonProps} onClick={onDownloadFile} disabled={isDownloading}>
      {typeof children === "function" ? children({ isDownloading }) : children}
    </Button>
  );
};
