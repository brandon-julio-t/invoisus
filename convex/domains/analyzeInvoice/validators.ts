import { v } from "convex/values";
import { allModelPresets } from "../../libs/ai";

export const vModelPreset = v.union(
  ...allModelPresets.map((modelPreset) => v.literal(modelPreset)),
);
