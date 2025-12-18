import z from "zod";

export const analysisConfigurationFormSchema = z.object({
  pdfAnalysisPrompt: z.string().trim().nonempty(),
  dataExtractionPrompt: z.string().trim().nonempty(),

  googleSheetConfigurationByVendorArray: z
    .array(
      z.object({
        vendor: z.string().trim().nonempty(),
        spreadsheetId: z.string().trim().nonempty(),
        sheetName: z.string().trim().nonempty(),
      }),
    )
    .superRefine((data, ctx) => {
      const uniqueVendors = new Set<string>();

      for (let index = 0; index < data.length; index++) {
        const item = data[index];

        const isAdded = uniqueVendors.has(item.vendor);

        console.log({ item, uniqueVendors, isAdded });

        if (isAdded) {
          ctx.addIssue({
            code: "custom",
            message: "Vendor names must be unique",
            path: [index, "vendor"],
          });
        } else {
          uniqueVendors.add(item.vendor);
        }
      }
    }),
});

export type AnalysisConfigurationFormSchemaType = z.infer<
  typeof analysisConfigurationFormSchema
>;
