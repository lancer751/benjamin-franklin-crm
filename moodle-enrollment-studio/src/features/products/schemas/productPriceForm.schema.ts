import { z } from "zod";
import { ProductSchema } from "shared";

const sharedProductPriceSchema = ProductSchema.shape.prices.element;

export const productAmountFormSchema = z.union([z.string(), z.number()]).refine(
  (value) => {
    const normalized = String(value).trim();
    return (
      normalized !== "" &&
      /^(?:\d+|\d*\.\d{1,2})$/.test(normalized) &&
      Number.isFinite(Number(normalized)) &&
      Number(normalized) >= 0
    );
  },
  "Ingresa un monto válido con máximo 2 decimales",
);

export const productPriceFormSchema = z
  .object({
    attendance_mode: sharedProductPriceSchema.shape.attendance_mode,
    cash_price: productAmountFormSchema,
    installment_price: productAmountFormSchema,
  })
  .superRefine((price, context) => {
    if (Number(price.installment_price) <= Number(price.cash_price)) {
      context.addIssue({
        code: "custom",
        path: ["installment_price"],
        message: "El precio en cuotas debe ser mayor al precio al contado",
      });
    }
  });

export type ProductPriceFormValues = z.input<typeof productPriceFormSchema>;
