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
import { allModelPresets } from "@/convex/libs/ai";

// Group models by their LLM model family for better organization
const groupModelsByBase = (models: string[]) => {
  const groups: { [key: string]: string[] } = {};

  models.forEach((model) => {
    // Extract model family (e.g., "gpt-5", "gpt-4.1", "gpt-4")
    let base = model;
    if (model.startsWith("gpt-")) {
      // For GPT models, extract the family like gpt-5, gpt-4.1, etc.
      const parts = model.split("-");
      if (parts.length >= 2) {
        const versionPart = parts[1];
        // Check if version has a dot (like 4.1) or is just a number
        if (versionPart.includes(".")) {
          // Extract major.minor version
          const versionMatch = versionPart.match(/^(\d+\.\d+)/);
          if (versionMatch) {
            base = `gpt-${versionMatch[1]}`;
          } else {
            base = `gpt-${versionPart.split(".")[0]}`;
          }
        } else {
          // Extract just the major version number
          const versionMatch = versionPart.match(/^(\d+)/);
          if (versionMatch) {
            base = `gpt-${versionMatch[1]}`;
          } else {
            base = parts[0];
          }
        }
      }
    } else {
      // For non-GPT models, use the first part
      base = model.split("-")[0];
    }

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
