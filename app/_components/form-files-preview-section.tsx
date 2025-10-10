"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Spinner } from "@/components/ui/spinner";
import { formatFileSize } from "@/lib/strings";
import { CheckIcon, XIcon } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { FileUploadForm } from "../form";

export const FormFilesPreviewSection = ({
  form,
  files,
}: {
  form: UseFormReturn<FileUploadForm>;
  files: FileUploadForm["files"];
}) => {
  if (files.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">File Preview</h2>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1">{/* status */}</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="w-1">{/* actions */}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file, index) => (
            <TableRowFile key={index} form={form} file={file} index={index} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

function TableRowFile({
  form,
  file: fileItem,
  index,
}: {
  form: UseFormReturn<FileUploadForm>;
  file: FileUploadForm["files"][number];
  index: number;
}) {
  const file = fileItem.rawFile;

  return (
    <TableRow>
      <TableCell className="w-1">
        {fileItem.status === "success" ? (
          <CheckIcon className="text-success size-(--text-sm)" />
        ) : fileItem.status === "error" ? (
          <XIcon className="text-destructive size-(--text-sm)" />
        ) : fileItem.status === "uploading" ? (
          <Spinner className="size-(--text-sm)" />
        ) : null}
      </TableCell>
      <TableCell className="font-medium">{file.name}</TableCell>
      <TableCell>{formatFileSize(file.size)}</TableCell>
      <TableCell>{file.type || "Unknown"}</TableCell>
      <TableCell className="w-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => {
                const newFiles = form.getValues("files");
                newFiles.splice(index, 1);
                form.setValue("files", newFiles);

                toast.success(`File "${file.name}" removed successfully`);
              }}
            >
              <XIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Remove file</TooltipContent>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}
