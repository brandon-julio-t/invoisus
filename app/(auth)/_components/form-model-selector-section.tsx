"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { allModelPresets } from "@/convex/libs/ai";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";
import React from "react";
import type { ControllerRenderProps } from "react-hook-form";
import type { FileUploadForm } from "../form";

export const FormModelSelectorCombobox = ({
  children,
  value,
  onChange,
  align,
}: {
  children: React.ReactNode;
} & ControllerRenderProps<
  FileUploadForm,
  "pdfAnalysisModelPreset" | "dataExtractionModelPreset"
> &
  Pick<React.ComponentProps<typeof PopoverContent>, "align">) => {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <Command>
          <CommandInput />
          <CommandList>
            <CommandEmpty />
            <CommandGroup>
              {Object.entries(groupModelsByBase(allModelPresets)).map(
                ([group, models], groupIndex, groups) => (
                  <React.Fragment key={group}>
                    {models.map((model) => (
                      <CommandItem
                        key={model}
                        value={model}
                        onSelect={() => onChange(model)}
                      >
                        <span>{model}</span>
                        <CheckIcon
                          className={cn(
                            "ml-auto",
                            value === model ? "visible" : "invisible",
                          )}
                        />
                      </CommandItem>
                    ))}
                    {groupIndex < groups.length - 1 && <CommandSeparator />}
                  </React.Fragment>
                ),
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

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
