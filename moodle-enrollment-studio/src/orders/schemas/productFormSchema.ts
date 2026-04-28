import { z } from "zod";

export const priceSchema = z.object({
  attendance_mode: z.enum(["VIRTUAL", "PRESENCIAL", "HEREDADO"]),
  cash_price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Debe ser un decimal válido (ej. 100.00)"),
  installment_price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Debe ser un decimal válido (ej. 100.00)"),
  enrollment_fee: z.string().regex(/^\d+(\.\d{1,2})?$/, "Debe ser un decimal válido (ej. 100.00)"),
});

export const productFormSchema = z.object({
  edition_id: z.string().min(1, "La edición es requerida"),
  category_id: z.string().min(1, "La categoría es requerida"),
  sales_status: z.enum(["DRAFT", "PUBLISHED", "ON_SALE", "COMPLETED", "CANCELLED"]),
  name: z.string().min(1, "El nombre del producto es requerido"),
  slug: z.string().min(1, "El slug es requerido"),
  short_description: z.string().optional(),
  description: z.string().optional(),
  installments_min_number: z.number().min(1, "El mínimo de cuotas es 1"),
  installments_max_number: z.number().min(1, "El máximo de cuotas es requerido"),
  discount_price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Debe ser un decimal válido").optional().or(z.literal("")),
  discount_expires_at: z.string().optional(),
  prices: z.array(priceSchema).min(1, "Se requiere al menos 1 precio configurado"),
}).refine(data => data.installments_max_number >= data.installments_min_number, {
  message: "El máximo de cuotas no puede ser menor al mínimo",
  path: ["installments_max_number"]
}).refine(data => {
  if (data.discount_price && data.discount_price !== "0" && data.discount_price !== "") {
    return !!data.discount_expires_at;
  }
  return true;
}, {
  message: "La fecha de expiración es obligatoria si hay un precio de descuento",
  path: ["discount_expires_at"]
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
export type PriceFormValues = z.infer<typeof priceSchema>;
