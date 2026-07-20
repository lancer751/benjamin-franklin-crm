import { z } from "zod";
import { ProductSchema } from "shared";

const sharedProductPriceSchema = ProductSchema.shape.prices.element;

const inputAmount = z.union([z.string(), z.number()]).refine(
  (value) => value !== "" && Number.isFinite(Number(value)) && Number(value) >= 0,
  "Ingresa un monto válido mayor o igual a 0",
);

export const productPriceFormSchema = z
  .object({
    attendance_mode: sharedProductPriceSchema.shape.attendance_mode,
    cash_price: inputAmount,
    installment_price: inputAmount,
    enrollment_fee: inputAmount,
  })
  .superRefine((price, context) => {
    const backendPrice = {
      attendance_mode: price.attendance_mode,
      cash_price: Number(price.cash_price),
      installment_price: Number(price.installment_price),
      enrollment_fee: Number(price.enrollment_fee),
    };

    const result = sharedProductPriceSchema.safeParse(backendPrice);
    if (!result.success) {
      context.addIssue({
        code: "custom",
        path: ["installment_price"],
        message: "El precio en cuotas debe ser mayor o igual al precio al contado",
      });
    }
  });

export type ProductPriceFormValues = z.input<typeof productPriceFormSchema>;
