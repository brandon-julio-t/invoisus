"use client";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldGroup } from "@/components/ui/field";
import { ItemGroup } from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { useMutation } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { ConvexError } from "convex/values";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { GoogleSheetOutputByVendor } from "./_components/google-sheet-output-by-vendor";
import { analysisConfigurationFormSchema } from "./schemas";

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

const formTabs = [
  // "PDF Analysis",
  // "Data Extraction",
  "Google Sheet Output By Vendor",
] as const;

function SettingsPageBody({
  analysisConfiguration,
}: {
  analysisConfiguration: FunctionReturnType<
    typeof api.domains.analysisConfigurations.queries.getAnalysisConfiguration
  >;
}) {
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsStringLiteral(formTabs).withDefault("Google Sheet Output By Vendor"),
  );

  const upsertAnalysisConfiguration = useMutation(
    api.domains.analysisConfigurations.mutations.upsertAnalysisConfiguration,
  );

  const googleSheetConfigurationByVendorArray = Object.entries(
    analysisConfiguration?.googleSheetConfigurationByVendor ?? {},
  ).map(([vendor, config]) => ({
    vendor,
    spreadsheetId: config.spreadsheetId,
    sheetName: config.sheetName,
  }));

  const form = useForm({
    mode: "onTouched",
    resolver: zodResolver(analysisConfigurationFormSchema),
    values: {
      pdfAnalysisPrompt: analysisConfiguration?.pdfAnalysisPrompt ?? "",
      dataExtractionPrompt: analysisConfiguration?.dataExtractionPrompt ?? "",
      googleSheetConfigurationByVendorArray,
    },
  });

  const onSubmit = form.handleSubmit(
    async (data) => {
      const googleSheetConfigurationByVendor =
        data.googleSheetConfigurationByVendorArray.reduce(
          (acc, curr) => {
            acc[curr.vendor] = {
              spreadsheetId: curr.spreadsheetId,
              sheetName: curr.sheetName,
            };
            return acc;
          },
          {} as Record<string, { spreadsheetId: string; sheetName: string }>,
        );

      await toast
        .promise(
          upsertAnalysisConfiguration({
            id: analysisConfiguration?._id,
            data: {
              dataExtractionPrompt: data.dataExtractionPrompt,
              pdfAnalysisPrompt: data.pdfAnalysisPrompt,
              googleSheetConfigurationByVendor:
                googleSheetConfigurationByVendor,
            },
          }),
          {
            loading: "Saving changes...",
            success: "Changes saved successfully",
            error: (err) =>
              err instanceof ConvexError ? err.data : "Failed to save changes",
          },
        )
        .unwrap();
    },
    (error) => {
      console.error(error);
      toast.error("Failed to save changes", {
        description: "Please check the form and try again",
      });
    },
  );

  return (
    <form onSubmit={onSubmit}>
      <Tabs value={tab} onValueChange={(value) => setTab(value as typeof tab)}>
        <FieldGroup>
          {/* <ScrollArea>
            <ScrollBar orientation="horizontal" />

            <TabsList>
              {formTabs.map((tab, index) => (
                <TabsTrigger key={tab} value={tab} className="capitalize">
                  {index + 1}. {tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea> */}

          <TabsContent value="PDF Analysis">
            {/* <PdfAnalysis form={form} /> */}
            <GoogleSheetOutputByVendor form={form} />
          </TabsContent>

          <TabsContent value="Data Extraction">
            {/* <DataExtraction form={form} /> */}
            <GoogleSheetOutputByVendor form={form} />
          </TabsContent>

          <TabsContent value="Google Sheet Output By Vendor">
            <GoogleSheetOutputByVendor form={form} />
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
