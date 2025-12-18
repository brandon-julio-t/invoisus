"use client";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { ItemGroup } from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { useMutation } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { ConvexError } from "convex/values";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

export default function SettingsPage() {
  const analysisConfiguration = useQuery(
    api.domains.analysisConfigurations.queries.getAnalysisConfiguration,
  );

  return (
    <ItemGroup className="container">
      {analysisConfiguration === undefined ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia>
              <Spinner />
            </EmptyMedia>
            <EmptyTitle>Loading analysis configuration...</EmptyTitle>
            <EmptyDescription>
              Please wait while we load the analysis configuration...
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <SettingsPageBody analysisConfiguration={analysisConfiguration} />
      )}
    </ItemGroup>
  );
}

type AnalysisConfiguration = FunctionReturnType<
  typeof api.domains.analysisConfigurations.queries.getAnalysisConfiguration
>;

function SettingsPageBody({
  analysisConfiguration,
}: {
  analysisConfiguration: AnalysisConfiguration;
}) {
  const upsertAnalysisConfiguration = useMutation(
    api.domains.analysisConfigurations.mutations.upsertAnalysisConfiguration,
  );

  const form = useForm({
    mode: "onTouched",
    resolver: zodResolver(
      z.object({
        pdfAnalysisPrompt: z.string().trim().nonempty(),
        dataExtractionPrompt: z.string().trim().nonempty(),
        googleSheetConfigurationByVendor: z.record(
          z.string().trim().nonempty(),
          z.object({
            spreadsheetId: z.string().trim().nonempty(),
            sheetName: z.string().trim().nonempty(),
          }),
        ),
      }),
    ),
    values: {
      pdfAnalysisPrompt: analysisConfiguration?.pdfAnalysisPrompt ?? "",
      dataExtractionPrompt: analysisConfiguration?.dataExtractionPrompt ?? "",
      googleSheetConfigurationByVendor:
        analysisConfiguration?.googleSheetConfigurationByVendor ??
        ({} as Record<string, { spreadsheetId: string; sheetName: string }>),
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    await toast
      .promise(
        upsertAnalysisConfiguration({
          id: analysisConfiguration?._id,
          data,
        }),
        {
          loading: "Saving changes...",
          success: "Changes saved successfully",
          error: (err) =>
            err instanceof ConvexError ? err.data : "Failed to save changes",
        },
      )
      .unwrap();
  });

  return (
    <form onSubmit={onSubmit}>
      <Tabs defaultValue="pdfAnalysis">
        <FieldGroup>
          <TabsList>
            <TabsTrigger value="pdfAnalysis">1. PDF Analysis</TabsTrigger>
            <TabsTrigger value="dataExtraction">2. Data Extraction</TabsTrigger>
          </TabsList>

          <TabsContent value="pdfAnalysis">
            <Controller
              control={form.control}
              name="pdfAnalysisPrompt"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    PDF Analysis Prompt
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </TabsContent>

          <TabsContent value="dataExtraction">
            <Controller
              control={form.control}
              name="dataExtractionPrompt"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Data Extraction Prompt
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </TabsContent>

          <Field orientation="horizontal" className="justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Spinner />}
              Save Changes
            </Button>
          </Field>
        </FieldGroup>
      </Tabs>
    </form>
  );
}
