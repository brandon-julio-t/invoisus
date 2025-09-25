"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FileUploadForm } from "../form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectItem,
  SelectContent,
  SelectSeparator,
} from "@/components/ui/select";

export const FormModelSelectorSection = ({
  form,
}: {
  form: UseFormReturn<FileUploadForm>;
}) => {
  return (
    <FormField
      control={form.control}
      name="modelPreset"
      render={({ field }) => (
        <FormItem className="justify-end">
          <FormLabel>Model Preset</FormLabel>

          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a model preset" />
              </SelectTrigger>
            </FormControl>

            <SelectContent>
              <SelectItem value="gpt-5-minimal">GPT-5 Minimal</SelectItem>
              <SelectItem value="gpt-5-low">GPT-5 Low</SelectItem>
              <SelectItem value="gpt-5-medium">GPT-5 Medium</SelectItem>
              <SelectItem value="gpt-5-high">GPT-5 High</SelectItem>

              <SelectSeparator />

              <SelectItem value="gpt-5-mini-minimal">
                GPT-5 Mini Minimal
              </SelectItem>
              <SelectItem value="gpt-5-mini-low">GPT-5 Mini Low</SelectItem>
              <SelectItem value="gpt-5-mini-medium">
                GPT-5 Mini Medium
              </SelectItem>
              <SelectItem value="gpt-5-mini-high">GPT-5 Mini High</SelectItem>

              <SelectSeparator />

              <SelectItem value="gpt-5-nano-minimal">
                GPT-5 Nano Minimal
              </SelectItem>
              <SelectItem value="gpt-5-nano-low">GPT-5 Nano Low</SelectItem>
              <SelectItem value="gpt-5-nano-medium">
                GPT-5 Nano Medium
              </SelectItem>
              <SelectItem value="gpt-5-nano-high">GPT-5 Nano High</SelectItem>
            </SelectContent>
          </Select>

          <FormMessage />
        </FormItem>
      )}
    />
  );
};
