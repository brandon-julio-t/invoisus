"use client";

import { cn } from "@/lib/utils";
import React from "react";

export function Data({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="data"
      className={cn("grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export const DataItem = React.Fragment;

export function DataItemLabel({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="data-item-label"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function DataItemValue({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="data-item-value"
      className={cn("text-sm", className)}
      {...props}
    >
      {children}
    </div>
  );
}
