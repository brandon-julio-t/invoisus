"use client";

import type { UseTipTapEditorParams } from "@/components/tip-tap-editor";
import { TipTapEditor, useTipTapEditor } from "@/components/tip-tap-editor";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Controller, type UseFormReturn } from "react-hook-form";
import type { AnalysisConfigurationFormSchemaType } from "../schemas";

export function DataExtraction({
  form,
}: {
  form: UseFormReturn<AnalysisConfigurationFormSchemaType>;
}) {
  return (
    <Controller
      control={form.control}
      name="dataExtractionPrompt"
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>Data Extraction Prompt</FieldLabel>

          <DataExtractionField
            value={field.value}
            onValueChange={(v) => {
              const markdown = v.editor.getMarkdown();
              field.onChange(markdown);
            }}
          />

          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

function DataExtractionField({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: UseTipTapEditorParams["onUpdate"];
}) {
  const editor = useTipTapEditor({
    content: value,
    contentType: "markdown",
    onUpdate: onValueChange,
  });

  return <TipTapEditor editor={editor} />;
}
