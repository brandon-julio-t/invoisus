import { v } from "convex/values";

export const vModelPreset = v.union(
  v.literal("gpt-5-minimal"),
  v.literal("gpt-5-low"),
  v.literal("gpt-5-medium"),
  v.literal("gpt-5-high"),

  v.literal("gpt-5-mini-minimal"),
  v.literal("gpt-5-mini-low"),
  v.literal("gpt-5-mini-medium"),
  v.literal("gpt-5-mini-high"),

  v.literal("gpt-5-nano-minimal"),
  v.literal("gpt-5-nano-low"),
  v.literal("gpt-5-nano-medium"),
  v.literal("gpt-5-nano-high"),

  v.literal("o3"),
  v.literal("o3-deep-research"),
  v.literal("o3-mini"),
  v.literal("o3-pro"),
  v.literal("o4-mini"),
  v.literal("o4-deep-research"),
  v.literal("gpt-4.1"),
  v.literal("gpt-4.1-mini"),
  v.literal("gpt-4.1-nano"),
  v.literal("o1-pro"),
  v.literal("gpt-4o"),
  v.literal("gpt-4o-mini"),
);
