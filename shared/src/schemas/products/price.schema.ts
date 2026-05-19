import z from "zod";
import { DecimalField, UUIDField } from "../helpers";

export const AttendanceModeSchema = z.enum([
  "VIRTUAL",
  "PRESENCIAL",
  "HEREDADO",
]);

export const ProductPriceSchema = z.object({
  id: UUIDField,
  product_id: UUIDField,
  attendance_mode: AttendanceModeSchema,
  cash_price: DecimalField,
  installment_price: DecimalField,
  enrollment_fee: DecimalField,
});

const CreateProductPriceSchema = ProductPriceSchema.omit({
  id: true,
  product_id: true,
});

export const CreateRefinedProductPriceSchema = CreateProductPriceSchema.refine(
  ({ installment_price, cash_price }) => installment_price >= cash_price,
  {
    message: "installment_price must be greater than or equal to cash_price",
    path: ["installment_price"],
  },
);

export const UpdateProductPriceSchema =
  CreateProductPriceSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field must be provided" },
  );

export type AttendanceMode = z.infer<typeof AttendanceModeSchema>;
export type ProductPrice = z.infer<typeof ProductPriceSchema>;
export type CreateProductPriceInput = z.infer<typeof CreateProductPriceSchema>;
export type UpdateProductPriceInput = z.infer<typeof UpdateProductPriceSchema>;