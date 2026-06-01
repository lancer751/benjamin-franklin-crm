import { z } from "zod";

const preprocessNumber = (val: unknown) => {
  if (val === "" || val === undefined || val === null) return 0;
  const parsed = Number(val);
  return isNaN(parsed) ? val : parsed;
};

const preprocessNullableNumber = (val: unknown) => {
  if (val === "" || val === undefined || val === null) return null;
  const parsed = Number(val);
  return isNaN(parsed) ? val : parsed;
};

export const priceSchema = z.object({
  attendance_mode: z.enum(["VIRTUAL", "PRESENCIAL", "HEREDADO"]),
  cash_price: z.preprocess(
    preprocessNumber,
    z.number({ required_error: "El precio al contado es obligatorio" }).min(0, "Debe ser mayor o igual a 0")
  ),
  installment_price: z.preprocess(
    preprocessNumber,
    z.number({ required_error: "El precio en cuotas es obligatorio" }).min(0, "Debe ser mayor o igual a 0")
  ),
  enrollment_fee: z.preprocess(
    preprocessNumber,
    z.number({ required_error: "La matrícula es obligatoria" }).min(0, "Debe ser mayor o igual a 0")
  ),
});

export const baseProductFormSchema = z.object({
  edition_id: z.string().min(1, "La edición es requerida"),
  category_id: z.string().uuid("Debes seleccionar una categoría válida de la lista de catálogos"),
  sales_status: z.enum(["DRAFT", "PUBLISHED", "ON_SALE", "COMPLETED", "CANCELLED"]),
  name: z.string().min(1, "El nombre del producto es requerido"),
  slug: z.string().min(1, "El slug es requerido"),
  short_description: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  presale_price: z.preprocess(
    preprocessNullableNumber,
    z.number().nullable().optional()
  ),
  installments_min_number: z.number().min(1, "El mínimo de cuotas es 1"),
  installments_max_number: z.number().min(1, "El máximo de cuotas es requerido"),
  discount_price: z.preprocess(
    preprocessNullableNumber,
    z.number().nullable().optional()
  ),
  discount_expires_at: z.string().optional().nullable(),
  image_url: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? null : val),
    z.string().url("Ingresa una URL de imagen válida (ej: https://...)").nullable().optional()
  ),
  brochure_url: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? null : val),
    z.string().url("Ingresa una URL válida para el brochure promocional (ej: https://...)").nullable().optional()
  ),
  prices: z.array(priceSchema).min(1, "Se requiere al menos 1 precio configurado"),
  benefit_ids: z.array(z.string().uuid("UUID de beneficio no válido")).min(1, "Debes seleccionar al menos un beneficio"),
  faqs: z.array(z.any()).default([]),
  certifications: z.array(z.any()).default([]),
  certification_id: z.string().optional().nullable(),
  certification_title: z.string().optional().nullable(),
  certification_description: z.string().optional().nullable(),
  certification_issuing_authority: z.string().optional().nullable(),
  certification_registry_validity: z.string().optional().nullable(),
  certification: z.object({
    image_url: z.string().optional().default(""),
    title: z.string().optional().default(""),
    description: z.string().optional().default(""),
    issuing_authority: z.string().optional().default("Corporación Educativa Benjamin Franklin"),
    registry_validity: z.string().optional().default(""),
    has_digital: z.boolean().optional().default(true),
    has_physical: z.boolean().optional().default(true),
  }).optional().nullable(),
});

export const productFormSchema = baseProductFormSchema.refine(data => data.installments_max_number >= data.installments_min_number, {
  message: "El máximo de cuotas no puede ser menor al mínimo",
  path: ["installments_max_number"]
}).refine(data => {
  if (data.discount_price && data.discount_price !== 0) {
    return !!data.discount_expires_at;
  }
  return true;
}, {
  message: "La fecha de expiración es obligatoria si hay un precio de descuento",
  path: ["discount_expires_at"]
}).refine(data => {
  if (data.sales_status === "PUBLISHED" || data.sales_status === "ON_SALE") {
    return !!data.description && !!data.short_description && data.description.trim() !== "" && data.short_description.trim() !== "";
  }
  return true;
}, {
  message: "La descripción corta y detallada son obligatorias para publicar el producto en la web",
  path: ["description"]
});

export type ProductFormValues = z.input<typeof productFormSchema>;
export type PriceFormValues = z.input<typeof priceSchema>;
