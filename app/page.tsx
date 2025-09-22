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
import { useForm, UseFormReturn } from "react-hook-form";
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
                      form.reset({
                        files,
                        fileUrls: [],
                      });
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
              </FormItem>
            )}
          />

          <DropzoneCustomContent form={form} />
        </form>
      </Form>
    </main>
  );
};

function DropzoneCustomContent({
  form,
}: {
  form: UseFormReturn<FileUploadForm>;
}) {
  const files = form.watch("files");

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
              key={`${file.name}-${index}`}
              form={form}
              file={file}
              index={index}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function TableRowFile({
  form,
  file,
  index,
}: {
  form: UseFormReturn<FileUploadForm>;
  file: File;
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
    if (isLoading || uploadStatus !== "pending") {
      return;
    }

    startTransition(async () => {
      // TODO: change this when Cloudflare R2 is ready
      const promise =
        new Promise<string>((resolve) => {
          setTimeout(() => {
            resolve("https://www.google.com");
          }, 1000);
        }) ?? uploadFile(file);

      await toast
        .promise(promise, {
          loading: `Uploading file "${file.name}"...`,

          success: (uploadedFileUrl) => {
            setUploadStatus("success");

            form.setValue("fileUrls", [
              ...form.getValues("fileUrls"),
              uploadedFileUrl,
            ]);

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
  }, [file, form, isLoading, uploadFile, uploadStatus]);

  return (
    <TableRow>
      <TableCell className="w-1">
        {isLoading ? (
          <Loader2Icon className="size-(--text-sm) animate-spin" />
        ) : (
          <>
            {uploadStatus === "success" ? (
              <CheckIcon className="size-(--text-sm) text-success" />
            ) : uploadStatus === "error" ? (
              <XIcon className="size-(--text-sm) text-destructive" />
            ) : uploadStatus === "pending" ? (
              <HourglassIcon className="size-(--text-sm) text-warning" />
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

export default HomePage;
