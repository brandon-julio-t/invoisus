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
import { CheckIcon, Loader2Icon, SendIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const fileUploadSchema = z.object({
  files: z.array(
    z.object({
      rawFile: z.instanceof(File),
      status: z.enum(["pending", "uploading", "success", "error"]),
    }),
  ),
});

type FileUploadForm = z.infer<typeof fileUploadSchema>;

const HomePage = () => {
  const router = useRouter();

  const form = useForm<FileUploadForm>({
    resolver: zodResolver(fileUploadSchema),
    defaultValues: {
      files: [],
    },
  });

  const uploadFile = useUploadFile(api.r2);

  const handleEnqueueAiInvoiceAnalysis = useMutation(
    api.domains.analyzeInvoice.mutations.handleEnqueueAiInvoiceAnalysis,
  );

  const onSubmit = form.handleSubmit(async (data) => {
    console.log(data);

    if (data.files.length <= 0) {
      toast.error("No files uploaded", {
        description: "Please upload at least one file",
      });
      return;
    }

    const uploadedFiles: Array<{
      name: string;
      size: number;
      type: string;
      fileKey: string;
    }> = [];

    await Promise.all(
      data.files.map(async (fileItem, index) => {
        const file = fileItem.rawFile;

        try {
          form.setValue(`files.${index}.status`, "uploading");

          const uploadedFileKey = await toast
            .promise(uploadFile(file), {
              loading: `Uploading "${file.name}"...`,
              success: `"${file.name}" uploaded successfully`,
              error: `Failed to upload "${file.name}"`,
            })
            .unwrap();

          uploadedFiles.push({
            name: file.name,
            size: file.size,
            type: file.type,
            fileKey: uploadedFileKey,
          });

          form.setValue(`files.${index}.status`, "success");
        } catch (error) {
          console.error(error);
          form.setValue(`files.${index}.status`, "error");
        }
      }),
    );

    const analysisWorkflowHeaderId = await toast
      .promise(
        handleEnqueueAiInvoiceAnalysis({
          files: uploadedFiles,
        }),
        {
          loading: "Submitting invoice analysis request...",
          success: "Invoice analysis request submitted successfully",
          error: "Failed to submit invoice analysis request",
        },
      )
      .unwrap();

    router.push(`/workflows/${analysisWorkflowHeaderId}`);
  });

  return (
    <main className="container py-8 space-y-6">
      <section>
        <Button variant="outline" asChild>
          <Link href="/workflows">View Workflows</Link>
        </Button>
      </section>

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
                        files: files.map((file) => ({
                          rawFile: file,
                          status: "pending",
                        })),
                      });
                    }}
                    onError={(err) => {
                      console.error(err);

                      toast.error("File input error", {
                        description: err.message,
                      });
                    }}
                    src={
                      field.value.length
                        ? field.value.map((f) => f.rawFile)
                        : undefined
                    }
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

          <section className="flex justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <SendIcon />
              )}
              {form.formState.isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </section>
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
}

function TableRowFile({
  form,
  index,
}: {
  form: UseFormReturn<FileUploadForm>;
  index: number;
}) {
  const fileItem = form.watch(`files.${index}`);
  const file = fileItem.rawFile;

  // Format file size in human readable format
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number(
        (bytes / Math.pow(k, i)).toLocaleString(undefined, {
          maximumFractionDigits: 2,
        }),
      ) +
      " " +
      sizes[i]
    );
  };

  return (
    <TableRow>
      <TableCell className="w-1">
        {fileItem.status === "success" ? (
          <CheckIcon className="text-success size-(--text-sm)" />
        ) : fileItem.status === "error" ? (
          <XIcon className="text-destructive size-(--text-sm)" />
        ) : fileItem.status === "uploading" ? (
          <Loader2Icon className="animate-spin size-(--text-sm)" />
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

export default HomePage;
