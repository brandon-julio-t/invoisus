import { Migrations } from "@convex-dev/migrations";
import { components } from "./_generated/api.js";
import { DataModel } from "./_generated/dataModel.js";

export const migrations = new Migrations<DataModel>(components.migrations);
export const run = migrations.runner();

export const differentiatePdfAnalysisAndDataExtractionModelPreset =
  migrations.define({
    table: "analysisWorkflowHeaders",
    migrateOne: async (ctx, doc) => {
      let modelPreset = doc.modelPreset ?? "gpt-5-medium";
      if (modelPreset.includes("/")) {
        // remove the openrouter prefix like "openai/gpt-5-medium" into "gpt-5-medium"
        modelPreset = modelPreset.split("/")[1];
      }

      if (doc.pdfAnalysisModelPreset === undefined) {
        await ctx.db.patch(doc._id, {
          pdfAnalysisModelPreset: modelPreset,
        });
      }

      if (doc.dataExtractionModelPreset === undefined) {
        await ctx.db.patch(doc._id, {
          dataExtractionModelPreset: modelPreset,
        });
      }

      await ctx.db.patch(doc._id, {
        modelPreset: undefined,
      });
    },
  });
