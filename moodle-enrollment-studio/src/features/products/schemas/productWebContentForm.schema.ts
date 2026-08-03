import { z } from "zod";
import { ProductSchema, SalesStatusSchema } from "shared";

export const productWebContentFormSchema = z
  .object({
    slug: ProductSchema.shape.slug.unwrap().unwrap(),
    short_description: z.string().max(160, "La descripción corta admite hasta 160 caracteres").nullable().optional(),
    description: z.string().max(2000, "La descripción admite hasta 2000 caracteres").nullable().optional(),
    sales_status: SalesStatusSchema,
  })
  .superRefine((data, context) => {
    if (data.sales_status === "PUBLISHED" || data.sales_status === "ON_SALE") {
      if (!data.short_description?.trim()) {
        context.addIssue({ code: "custom", path: ["short_description"], message: "La descripción corta es obligatoria para publicar" });
      }
      if (!data.description?.trim()) {
        context.addIssue({ code: "custom", path: ["description"], message: "La descripción detallada es obligatoria para publicar" });
      }
    }
  });

export type ProductWebContentFormValues = z.input<typeof productWebContentFormSchema>;
