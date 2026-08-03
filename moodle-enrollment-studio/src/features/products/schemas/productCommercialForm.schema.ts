import { z } from "zod";
import { ProductPricingStatusSchema, ProductSchema } from "shared";
import { productAmountFormSchema, productPriceFormSchema } from "./productPriceForm.schema";

const sharedCommercialFields = ProductSchema.pick({
  edition_id: true,
  category_id: true,
  name: true,
  enrollment_fee: true,
  installments_min_number: true,
  installments_max_number: true,
});

export const productCommercialFormSchema = sharedCommercialFields
  .extend({
    enrollment_fee: productAmountFormSchema,
    discount_price: z.number()
      .min(0, "El precio promocional no puede ser negativo")
      .multipleOf(0.01, "El precio promocional admite máximo 2 decimales")
      .nullable(),
    discount_expires_at: z.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Ingresa una fecha de vencimiento válida")
      .nullable(),
    installments_min_number: z.number().int().min(1, "El mínimo de cuotas es 1"),
    installments_max_number: z.number().int().min(1, "El máximo de cuotas es 1").max(24, "El máximo de cuotas es 24"),
    prices: z.array(productPriceFormSchema)
      .min(1, "Configura al menos un precio")
      .max(2, "Solo se permiten precios Presencial y Virtual"),
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

    if (data.discount_price != null && data.discount_price > 0 && !data.discount_expires_at) {
      context.addIssue({
        code: "custom",
        path: ["discount_expires_at"],
        message: "Indica la fecha de vencimiento de la promoción",
      });
    }

    const priceModes = new Set(data.prices.map((price) => price.attendance_mode));
    const validModes = data.prices.length === 1
      ? priceModes.has("HEREDADO")
      : data.prices.length === 2 &&
        priceModes.has("PRESENCIAL") &&
        priceModes.has("VIRTUAL");

    if (!validModes) {
      context.addIssue({
        code: "custom",
        path: ["prices"],
        message: data.prices.length === 1
          ? "La modalidad simple debe usar el precio heredado"
          : "La modalidad híbrida requiere precios Presencial y Virtual",
      });
    }
  });

export type ProductCommercialFormValues = z.input<typeof productCommercialFormSchema>;
