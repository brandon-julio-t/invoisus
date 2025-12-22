"use client";

import { cn } from "@/lib/utils";
import DragHandle from "@tiptap/extension-drag-handle-react";
import { Placeholder } from "@tiptap/extensions";
import { Markdown } from "@tiptap/markdown";
import type { EditorContentProps, UseEditorOptions } from "@tiptap/react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import {
  BoldIcon,
  CheckIcon,
  ChevronDownIcon,
  GripVertical,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ListIcon,
  ListOrderedIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import { ButtonGroup } from "./ui/button-group";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  TooltipContent,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from "./ui/tooltip";

/**
 * @docs - quickstart: https://tiptap.dev/docs/editor/getting-started/install/nextjs
 * @docs - bubble menu: https://tiptap.dev/docs/editor/extensions/functionality/bubble-menu
 * @docs - drag handle: https://tiptap.dev/docs/editor/extensions/functionality/drag-handle
 * @docs - placeholder: https://tiptap.dev/docs/editor/extensions/functionality/placeholder
 */
export function TipTapEditor({
  className,
  editorOptions,
  ...props
}: Omit<EditorContentProps, "editor"> & {
  editorOptions: UseEditorOptions;
}) {
  const editor = useEditor({
    // Don't render immediately on the server to avoid SSR issues
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Markdown,
      Placeholder.configure({
        placeholder: "Start typing...",
      }),
    ],
    content: "<p>Hello World! 🌎️</p>",
    ...editorOptions,
  });

  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      // Block states
      isParagraph: ctx.editor?.isActive("paragraph"),
      isOrderedList: ctx.editor?.isActive("orderedList"),
      isBulletList: ctx.editor?.isActive("bulletList"),
      isHeading1: ctx.editor?.isActive("heading", { level: 1 }),
      isHeading2: ctx.editor?.isActive("heading", { level: 2 }),
      isHeading3: ctx.editor?.isActive("heading", { level: 3 }),
      // Text formatting
      isBold: ctx.editor?.isActive("bold"),
    }),
  });

  let activeBlockStateLabel = "Turn into";
  if (editorState.isParagraph) {
    activeBlockStateLabel = "Text";
  } else if (editorState.isOrderedList) {
    activeBlockStateLabel = "Ordered List";
  } else if (editorState.isBulletList) {
    activeBlockStateLabel = "Bullet List";
  } else if (editorState.isHeading1) {
    activeBlockStateLabel = "Heading 1";
  } else if (editorState.isHeading2) {
    activeBlockStateLabel = "Heading 2";
  } else if (editorState.isHeading3) {
    activeBlockStateLabel = "Heading 3";
  }

  return (
    <>
      {editor && (
        <BubbleMenu
          editor={editor}
          data-slot="tip-tap-editor-bubble-menu"
          className="bg-popover text-popover-foreground z-50 flex flex-row flex-wrap gap-1 rounded-md border p-1 shadow-md outline-hidden"
          options={{
            placement: "bottom-start",
          }}
        >
          <TooltipProvider>
            <Popover>
              <PopoverTrigger asChild>
                <TooltipRoot>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      type="button"
                      size="sm"
                      className="group"
                    >
                      <span>{activeBlockStateLabel}</span>
                      <ChevronDownIcon className="ml-auto transition-transform group-data-[state=open]:rotate-180" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>Change the block state</span>
                  </TooltipContent>
                </TooltipRoot>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Command>
                  <CommandInput placeholder="Turn into.." />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        onSelect={() =>
                          editor.chain().focus().setParagraph().run()
                        }
                      >
                        <Heading1Icon />
                        <span>Text</span>
                        <CheckIcon
                          className={cn(
                            "ml-auto",
                            editorState.isParagraph ? "visible" : "invisible",
                          )}
                        />
                      </CommandItem>
                      <CommandItem
                        onSelect={() =>
                          editor
                            .chain()
                            .focus()
                            .toggleHeading({ level: 1 })
                            .run()
                        }
                      >
                        <Heading1Icon />
                        <span>Heading 1</span>
                        <CheckIcon
                          className={cn(
                            "ml-auto",
                            editorState.isHeading1 ? "visible" : "invisible",
                          )}
                        />
                      </CommandItem>
                      <CommandItem
                        onSelect={() =>
                          editor
                            .chain()
                            .focus()
                            .toggleHeading({ level: 2 })
                            .run()
                        }
                      >
                        <Heading2Icon />
                        <span>Heading 2</span>
                        <CheckIcon
                          className={cn(
                            "ml-auto",
                            editorState.isHeading2 ? "visible" : "invisible",
                          )}
                        />
                      </CommandItem>
                      <CommandItem
                        onSelect={() =>
                          editor
                            .chain()
                            .focus()
                            .toggleHeading({ level: 3 })
                            .run()
                        }
                      >
                        <Heading3Icon />
                        <span>Heading 3</span>
                        <CheckIcon
                          className={cn(
                            "ml-auto",
                            editorState.isHeading3 ? "visible" : "invisible",
                          )}
                        />
                      </CommandItem>

                      <CommandSeparator />

                      <CommandItem
                        onSelect={() =>
                          editor.chain().focus().toggleOrderedList().run()
                        }
                      >
                        <ListOrderedIcon />
                        <span>Ordered List</span>
                        <CheckIcon
                          className={cn(
                            "ml-auto",
                            editorState.isOrderedList ? "visible" : "invisible",
                          )}
                        />
                      </CommandItem>
                      <CommandItem
                        onSelect={() =>
                          editor.chain().focus().toggleBulletList().run()
                        }
                      >
                        <ListIcon />
                        <span>Bullet List</span>
                        <CheckIcon
                          className={cn(
                            "ml-auto",
                            editorState.isBulletList ? "visible" : "invisible",
                          )}
                        />
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <ButtonGroup>
              <TooltipRoot>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    variant={editorState.isBold ? "outline" : "ghost"}
                    type="button"
                    size="icon-sm"
                  >
                    <BoldIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle bold</TooltipContent>
              </TooltipRoot>
            </ButtonGroup>
          </TooltipProvider>
        </BubbleMenu>
      )}

      <DragHandle editor={editor}>
        <div className="pr-1">
          <Button type="button" variant="ghost" size="icon-sm">
            <GripVertical />
          </Button>
        </div>
      </DragHandle>

      <EditorContent
        editor={editor}
        data-slot="tip-tap-editor-content"
        className={cn(
          // container styles
          "[&_.tiptap]:flex [&_.tiptap]:flex-col [&_.tiptap]:gap-4",

          // heading styles
          "[&_h1]:text-2xl [&_h1]:font-bold",
          "[&_h2]:text-xl [&_h2]:font-semibold",
          "[&_h3]:text-lg [&_h3]:font-medium",

          // ordered list styles
          "[&_ul]:ml-6 [&_ul]:list-outside [&_ul]:list-disc [&_ul_p]:inline",
          // bullet list styles
          "[&_ol]:ml-6 [&_ol]:list-outside [&_ol]:list-decimal [&_ol_p]:inline",

          className,
        )}
        {...props}
      />
    </>
  );
}
