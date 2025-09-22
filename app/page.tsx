"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/kibo-ui/dropzone";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/convex/_generated/api";
import { useUploadFile } from "@convex-dev/r2/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { format } from "date-fns";
import { CheckIcon, HourglassIcon, Loader2Icon, XIcon } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const fileUploadSchema = z.object({
  files: z.array(z.instanceof(File)),
  fileUrls: z.array(z.string()),
});

type FileUploadForm = z.infer<typeof fileUploadSchema>;

const HomePage = () => {
  const form = useForm<FileUploadForm>({
    resolver: zodResolver(fileUploadSchema),
    defaultValues: {
      files: [],
      fileUrls: [],
    },
  });

  const handleEnqueueAiInvoiceAnalysis = useMutation(
    api.myFunctions.handleEnqueueAiInvoiceAnalysis,
  );

  const onSubmit = form.handleSubmit(async (data) => {
    console.log(data);

    if (data.fileUrls.length <= 0) {
      toast.error("No files uploaded", {
        description: "Please upload at least one file",
      });
      return;
    }

    await toast
      .promise(
        handleEnqueueAiInvoiceAnalysis({
          fileUrls: data.fileUrls,
        }),
        {
          loading: "Submitting invoice analysis request...",
          success: "Invoice analysis request submitted successfully",
          error: "Failed to submit invoice analysis request",
        },
      )
      .unwrap();
  });

  return (
    <main className="container mx-auto py-16">
      <Form {...form}>
        <form className="flex flex-col gap-6" onSubmit={onSubmit}>
          <FormField
            control={form.control}
            name="files"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Upload Files</FormLabel>

                <FormControl>
                  <Dropzone
                    maxFiles={1_000}
                    accept={{ "application/pdf": [] }}
                    onDrop={(files: File[]) => {
                      console.log(files);
                      field.onChange(files);
                    }}
                    onError={(err) => {
                      console.error(err);

                      toast.error("File input error", {
                        description: err.message,
                      });
                    }}
                    src={field.value.length ? field.value : undefined}
                  >
                    <DropzoneEmptyState />
                    <DropzoneContent />
                  </Dropzone>
                </FormControl>

                <FormMessage />

                <DropzoneCustomContent
                  files={field.value}
                  onChange={field.onChange}
                />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </main>
  );
};

function DropzoneCustomContent({
  files,
  onChange,
}: {
  files: File[];
  onChange: (files: File[]) => void;
}) {
  if (files.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">File Preview</h2>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1">{/* upload status */}</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Last Modified</TableHead>
            <TableHead className="w-1">{/* actions */}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file, index) => (
            <TableRowFile
              key={index}
              file={file}
              onChange={onChange}
              files={files}
              index={index}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function TableRowFile({
  file,
  onChange,
  files,
  index,
}: {
  file: File;
  onChange: (files: File[]) => void;
  files: File[];
  index: number;
}) {
  const uploadFile = useUploadFile(api.r2);

  // Format file size in human readable format
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const [uploadStatus, setUploadStatus] = React.useState<
    "pending" | "success" | "error"
  >("pending");

  const [isLoading, startTransition] = React.useTransition();

  React.useEffect(() => {
    if (isLoading) return;
    startTransition(async () => {
      await toast
        .promise(uploadFile(file), {
          loading: `Uploading file "${file.name}"...`,
          success: () => {
            setUploadStatus("success");
            return `File "${file.name}" uploaded successfully`;
          },
          error: (error) => {
            console.error(error);
            setUploadStatus("error");
            return `Failed to upload file "${file.name}"`;
          },
        })
        .unwrap();
    });
  }, [file, isLoading, uploadFile]);

  return (
    <TableRow>
      <TableCell className="w-1">
        {isLoading ? (
          <Loader2Icon className="animate-spin" />
        ) : (
          <>
            {uploadStatus === "success" ? (
              <CheckIcon />
            ) : uploadStatus === "error" ? (
              <XIcon />
            ) : uploadStatus === "pending" ? (
              <HourglassIcon />
            ) : null}
          </>
        )}
      </TableCell>
      <TableCell className="font-medium">{file.name}</TableCell>
      <TableCell>{formatFileSize(file.size)}</TableCell>
      <TableCell>{file.type || "Unknown"}</TableCell>
      <TableCell>{format(file.lastModified, "PPPp")}</TableCell>
      <TableCell className="w-1">
        <Button
          size="icon"
          onClick={() => {
            const newFiles = [...files];
            newFiles.splice(index, 1);
            onChange(newFiles);

            toast.success(`File "${file.name}" removed successfully`);
          }}
        >
          <XIcon />
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default HomePage;
