"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FileUploadForm, allModelPresets } from "../form";
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

// Group models by their base model for better organization
const groupModelsByBase = (models: string[]) => {
  const groups: { [key: string]: string[] } = {};

  models.forEach((model) => {
    const base =
      model.split("-")[0] +
      (model.includes("mini")
        ? "-mini"
        : model.includes("nano")
          ? "-nano"
          : "");
    if (!groups[base]) {
      groups[base] = [];
    }
    groups[base].push(model);
  });

  return groups;
};

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
              {Object.entries(groupModelsByBase(allModelPresets)).map(
                ([group, models], groupIndex, groups) => (
                  <React.Fragment key={group}>
                    {models.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                    {groupIndex < groups.length - 1 && <SelectSeparator />}
                  </React.Fragment>
                ),
              )}
            </SelectContent>
          </Select>

          <FormMessage />
        </FormItem>
      )}
    />
  );
};
