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
import { formatFileSize } from "@/lib/strings";
import { CheckIcon, Loader2Icon, XIcon } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { FileUploadForm } from "../form";

export const FormFilesPreviewSection = ({
  form,
}: {
  form: UseFormReturn<FileUploadForm>;
}) => {
  const files = form.watch("files");

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
            <TableRowFile key={index} form={form} index={index} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

function TableRowFile({
  form,
  index,
}: {
  form: UseFormReturn<FileUploadForm>;
  index: number;
}) {
  const fileItem = form.watch(`files.${index}`);
  const file = fileItem.rawFile;

  return (
    <TableRow>
      <TableCell className="w-1">
        {fileItem.status === "success" ? (
          <CheckIcon className="text-success size-(--text-sm)" />
        ) : fileItem.status === "error" ? (
          <XIcon className="text-destructive size-(--text-sm)" />
        ) : fileItem.status === "uploading" ? (
          <Loader2Icon className="size-(--text-sm) animate-spin" />
        ) : null}
      </TableCell>
      <TableCell className="font-medium">{file.name}</TableCell>
      <TableCell>{formatFileSize(file.size)}</TableCell>
      <TableCell>{file.type || "Unknown"}</TableCell>
      <TableCell className="w-1">
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
      </TableCell>
    </TableRow>
  );
}
