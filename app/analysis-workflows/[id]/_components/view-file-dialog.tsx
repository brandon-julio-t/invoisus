import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { DownloadIcon } from "lucide-react";
import { DownloadFileButton } from "./download-file-button";

export const ViewFileDialog = ({
  fileKey,
  filename,
  children,
}: ViewFileDialogContentProps & {
  children: React.ReactNode;
}) => {
  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>{children}</DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>View file</TooltipContent>
      </Tooltip>

      <DialogContent className="h-svh w-full max-w-none sm:max-w-none">
        <ViewFileDialogContent fileKey={fileKey} filename={filename} />
      </DialogContent>
    </Dialog>
  );
};

interface ViewFileDialogContentProps {
  fileKey: string;
  filename: string;
}

const ViewFileDialogContent = ({
  fileKey,
  filename,
}: ViewFileDialogContentProps) => {
  const downloadUrl = useQuery(api.r2.queryDownloadUrl, { key: fileKey });

  const isLoading = downloadUrl === undefined;

  return (
    <>
      <div className="flex size-full flex-1 flex-col gap-6">
        <DialogHeader>
          <DialogTitle>View File</DialogTitle>
          <DialogDescription>Viewing &quot;{filename}&quot;</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="bg-muted grid size-full flex-1 animate-pulse place-items-center overflow-hidden rounded-xl border">
            <Spinner className="size-8" />
          </div>
        ) : (
          <iframe
            src={downloadUrl}
            className="bg-muted size-full flex-1 overflow-hidden rounded-xl border"
            tabIndex={-1}
            title={`Preview of ${filename}`}
          />
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>

          <DownloadFileButton
            fileKey={fileKey}
            filename={filename}
            variant="outline"
          >
            {({ isDownloading }) => (
              <>
                {isDownloading ? <Spinner /> : <DownloadIcon />}
                Download
              </>
            )}
          </DownloadFileButton>
        </DialogFooter>
      </div>
    </>
  );
};
