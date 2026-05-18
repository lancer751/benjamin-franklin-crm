import z from "zod";
import { DecimalField, UUIDField } from "../helpers";

export const AttendanceModeSchema = z.enum([
  "VIRTUAL",
  "PRESENCIAL",
  "HEREDADO",
]);

// 🧠 Objeto base puro (sin refines) para que .omit() y .partial() funcionen nativamente
const ProductPriceBaseObject = z.object({
  id: UUIDField,
  product_id: UUIDField,
  attendance_mode: AttendanceModeSchema,
  cash_price: DecimalField,
  installment_price: DecimalField,
  enrollment_fee: DecimalField,
});

<<<<<<< HEAD
export const ProductPriceSchema = ProductPriceBaseObject;

export const CreateProductPriceSchema = ProductPriceBaseObject.omit({
=======
const CreateProductPriceSchema = ProductPriceSchema.omit({
>>>>>>> origin/backend
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

// 🧠 Aplicamos .partial() sobre el base limpio y metemos la lógica al final
export const UpdateProductPriceSchema = ProductPriceBaseObject.omit({
  id: true,
  product_id: true,
})
  .partial()
  .refine(
    ({ installment_price, cash_price }) => {
      if (installment_price !== undefined && cash_price !== undefined) {
        return installment_price >= cash_price;
      }
      return true;
    },
    {
      message: "installment_price must be greater than or equal to cash_price",
      path: ["installment_price"],
    },
  )
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field must be provided" },
  );

export type AttendanceMode = z.infer<typeof AttendanceModeSchema>;
export type ProductPrice = z.infer<typeof ProductPriceSchema>;
export type CreateProductPriceInput = z.infer<typeof CreateProductPriceSchema>;
export type UpdateProductPriceInput = z.infer<typeof UpdateProductPriceSchema>;