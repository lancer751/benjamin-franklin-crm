import { z } from "zod";
import { ProductPricingStatusSchema, ProductSchema } from "shared";
import { productPriceFormSchema } from "./productPriceForm.schema";

const sharedCommercialFields = ProductSchema.pick({
  edition_id: true,
  category_id: true,
  name: true,
  installments_min_number: true,
  installments_max_number: true,
});

export const productCommercialFormSchema = sharedCommercialFields
  .extend({
    discount_price: z.number().min(0, "El precio promocional no puede ser negativo").nullable(),
    discount_expires_at: z.string().nullable(),
    installments_min_number: z.number().int().min(1, "El mínimo de cuotas es 1"),
    installments_max_number: z.number().int().min(1, "El máximo de cuotas es 1"),
    prices: z.array(productPriceFormSchema).min(1, "Configura al menos un precio"),
    pricing_status: ProductPricingStatusSchema,
  })
  .superRefine((data, context) => {
    if (data.installments_max_number < data.installments_min_number) {
      context.addIssue({
        code: "custom",
        path: ["installments_max_number"],
        message: "El máximo de cuotas no puede ser menor al mínimo",
      });
    }
  });

export type ProductCommercialFormValues = z.input<typeof productCommercialFormSchema>;
