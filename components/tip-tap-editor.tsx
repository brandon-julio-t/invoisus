"use client";

import { cn } from "@/lib/utils";
import { Markdown } from "@tiptap/markdown";
import type { EditorContentProps, UseEditorOptions } from "@tiptap/react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export type UseTipTapEditorParams = UseEditorOptions;

export function useTipTapEditor({ ...options }: UseEditorOptions) {
  return useEditor({
    // Don't render immediately on the server to avoid SSR issues
    immediatelyRender: false,
    extensions: [StarterKit, Markdown],
    content: "<p>Hello World! 🌎️</p>",
    ...options,
  });
}

export type TipTapEditorProps = EditorContentProps;

export function TipTapEditor({
  className,
  editor,
  ...props
}: EditorContentProps) {
  return <EditorContent editor={editor} className={cn(className)} {...props} />;
}
