"use client";

import {
  Data,
  DataItem,
  DataItemLabel,
  DataItemValue,
} from "@/components/data";
import { useRouter } from "@/components/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
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
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useUploadFile } from "@convex-dev/r2/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { ChevronsUpDownIcon, IterationCcwIcon, SendIcon } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormFilesPreviewSection } from "./_components/form-files-preview-section";
import { FormModelSelectorCombobox } from "./_components/form-model-selector-section";
import { FileUploadForm, fileUploadSchema } from "./form";

const HomePage = () => {
  const router = useRouter();

  const form = useForm<FileUploadForm>({
    resolver: zodResolver(fileUploadSchema),
    defaultValues: {
      files: [],
      pdfAnalysisModelPreset: "gemini-2.5-pro",
      dataExtractionModelPreset: "gpt-5-mini-medium",
    },
  });

  const uploadFile = useUploadFile(api.r2);

  const handleEnqueueAiInvoiceAnalysis = useMutation(
    api.domains.analyzeInvoice.mutations.handleEnqueueAiInvoiceAnalysis,
  );

  const [openConfirm, setOpenConfirm] = React.useState(false);

  const onSubmit = form.handleSubmit(
    async (data) => {
      setOpenConfirm(false);

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

      let hasError = false;

      await Promise.all(
        data.files.map(async (fileItem, index) => {
          const file = fileItem.rawFile;

          if (fileItem.status === "uploading") {
            console.log(`File is already uploading, skipping ${file.name}`);
            return;
          }

          if (fileItem.status === "success") {
            console.log(`File is already uploaded, skipping ${file.name}`);
            return;
          }

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
            hasError = true;
          }
        }),
      );

      if (hasError) {
        toast.error("Failed to upload some files", {
          description: "Please check the files and try to submit again",
        });
        return;
      }

      const analysisWorkflowHeaderId = await toast
        .promise(
          handleEnqueueAiInvoiceAnalysis({
            files: uploadedFiles,
            pdfAnalysisModelPreset: data.pdfAnalysisModelPreset,
            dataExtractionModelPreset: data.dataExtractionModelPreset,
          }),
          {
            loading: "Submitting invoice analysis request...",
            success: "Invoice analysis request submitted successfully",
            error: "Failed to submit invoice analysis request",
          },
        )
        .unwrap();

      router.push(`/analysis-workflows/${analysisWorkflowHeaderId}`);
    },
    (err) => {
      setOpenConfirm(false);

      console.error(err);

      toast.error("Failed to submit form", {
        description: "Please check the form and try again",
      });
    },
  );

  return (
    <main className="container flex flex-col gap-6">
      <Form {...form}>
        <form onSubmit={onSubmit}>
          <FieldSet>
            <FieldLegend>Analyze Invoice</FieldLegend>

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
                        const newFiles = files.map((file) => ({
                          rawFile: file,
                          status: "pending",
                        }));

                        field.onChange([...field.value, ...newFiles]);
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

            <FieldGroup>
              <Field orientation="horizontal" className="justify-end">
                <Button
                  type="button"
                  variant="outline"
                  disabled={form.formState.isSubmitting}
                  onClick={() => form.reset()}
                >
                  <IterationCcwIcon />
                  Reset
                </Button>

                <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      disabled={form.formState.isSubmitting}
                    >
                      {form.formState.isSubmitting ? <Spinner /> : <SendIcon />}
                      {form.formState.isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Submit Invoice Analysis
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to submit with the following
                        settings?
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <Data>
                      {[
                        { label: "Files", value: form.watch("files").length },
                      ].map(({ label, value }) => (
                        <DataItem key={label}>
                          <DataItemLabel>{label}</DataItemLabel>
                          <DataItemValue>{value}</DataItemValue>
                        </DataItem>
                      ))}
                    </Data>

                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={onSubmit}>
                        Submit
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </Field>
            </FieldGroup>

            <FormField
              control={form.control}
              name="files"
              render={({ field }) => {
                const pendingCount = field.value.filter(
                  (f) => f.status === "pending",
                ).length;
                const successCount = field.value.filter(
                  (f) => f.status === "success",
                ).length;
                const errorCount = field.value.filter(
                  (f) => f.status === "error",
                ).length;

                if (pendingCount + successCount + errorCount === 0) {
                  return <></>;
                }

                return (
                  <FieldGroup>
                    <Field>
                      {pendingCount > 0 && (
                        <FieldDescription>
                          Upload pending: {pendingCount}
                        </FieldDescription>
                      )}
                      {successCount > 0 && (
                        <FieldLabel>Upload success: {successCount}</FieldLabel>
                      )}
                      {errorCount > 0 && (
                        <FieldError>Upload failed: {errorCount}</FieldError>
                      )}
                    </Field>

                    <FormFilesPreviewSection files={field.value} form={form} />
                  </FieldGroup>
                );
              }}
            />

            <FormField
              control={form.control}
              name="pdfAnalysisModelPreset"
              render={({ field }) => (
                <FormItem
                  className={cn(
                    process.env.NODE_ENV === "production" && "hidden",
                  )}
                >
                  <FormLabel>PDF Analysis Model</FormLabel>
                  <FormModelSelectorCombobox {...field} align="start">
                    <FormControl>
                      <Button variant="outline" className="w-fit">
                        <span>{field.value}</span>
                        <ChevronsUpDownIcon />
                      </Button>
                    </FormControl>
                  </FormModelSelectorCombobox>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dataExtractionModelPreset"
              render={({ field }) => (
                <FormItem
                  className={cn(
                    process.env.NODE_ENV === "production" && "hidden",
                  )}
                >
                  <FormLabel>Data Extraction Model</FormLabel>
                  <FormModelSelectorCombobox {...field} align="start">
                    <FormControl>
                      <Button variant="outline" className="w-fit">
                        <span>{field.value}</span>
                        <ChevronsUpDownIcon />
                      </Button>
                    </FormControl>
                  </FormModelSelectorCombobox>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FieldSet>
        </form>
      </Form>
    </main>
  );
};

export default HomePage;
