"use client";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Controller, type UseFormReturn } from "react-hook-form";
import type { AnalysisConfigurationFormSchemaType } from "../schemas";

export function PdfAnalysis({
  form,
}: {
  form: UseFormReturn<AnalysisConfigurationFormSchemaType>;
}) {
  return (
    <Controller
      control={form.control}
      name="pdfAnalysisPrompt"
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>PDF Analysis Prompt</FieldLabel>

          <Textarea
            {...field}
            id={field.name}
            aria-invalid={fieldState.invalid}
          />

          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
