"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
} from "@/components/ui/item";
import { ExternalLinkIcon, PlusIcon, XIcon } from "lucide-react";
import { Controller, useFieldArray, type UseFormReturn } from "react-hook-form";
import type { AnalysisConfigurationFormSchemaType } from "../schemas";

export function GoogleSheetOutputByVendor({
  form,
}: {
  form: UseFormReturn<AnalysisConfigurationFormSchemaType>;
}) {
  const fieldArray = useFieldArray({
    control: form.control,
    name: "googleSheetConfigurationByVendorArray",
  });

  return (
    <ItemGroup className="gap-6">
      {fieldArray.fields.map((field, index) => (
        <Item key={field.id} variant="outline">
          <ItemContent>
            <FieldGroup>
              <Controller
                control={form.control}
                name={`googleSheetConfigurationByVendorArray.${index}.vendor`}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Vendor Name</FieldLabel>
                    <Input {...field} aria-invalid={fieldState.invalid} />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name={`googleSheetConfigurationByVendorArray.${index}.spreadsheetId`}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Spreadsheet ID</FieldLabel>
                    <Input {...field} aria-invalid={fieldState.invalid} />
                    <FieldDescription>
                      Test it out:{" "}
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`https://docs.google.com/spreadsheets/d/${field.value}/edit`}
                        className="truncate break-all"
                      >
                        <span className="underline">here</span>
                        <ExternalLinkIcon className="ml-1 inline-block size-(--text-sm)" />
                      </a>
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name={`googleSheetConfigurationByVendorArray.${index}.sheetName`}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Sheet Name</FieldLabel>
                    <Input {...field} aria-invalid={fieldState.invalid} />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </ItemContent>

          <ItemActions className="mb-auto">
            <Button
              type="button"
              variant="ghost"
              onClick={() => fieldArray.remove(index)}
            >
              <XIcon />
            </Button>
          </ItemActions>
        </Item>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() =>
          fieldArray.append({ vendor: "", spreadsheetId: "", sheetName: "" })
        }
      >
        <PlusIcon />
        Add Vendor
      </Button>

      <Controller
        control={form.control}
        name="googleSheetConfigurationByVendorArray"
        render={({ fieldState }) => (
          <>
            {fieldState.invalid && (
              <Field data-invalid={fieldState.invalid}>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          </>
        )}
      />
    </ItemGroup>
  );
}
