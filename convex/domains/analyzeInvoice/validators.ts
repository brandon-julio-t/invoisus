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
);
