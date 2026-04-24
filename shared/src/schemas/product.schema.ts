import { z } from "zod";

export const SalesStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ON_SALE", "COMPLETED", "CANCELLED"]);
export const AttendanceModeSchema = z.enum(["VIRTUAL", "PRESENCIAL", "HEREDADO"]);

const decimalString = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, "Must be a valid decimal with up to 2 decimal places");

export const ProductPriceSchema = z.object({
  id: z.uuid().length(36),
  product_id: z.uuid().length(36),
  attendance_mode: AttendanceModeSchema,
  enrollment_fee: decimalString,
  cash_price: decimalString,
  installment_price: decimalString,
});

export const ProductSchema = z.object({
  id: z.uuid().length(36),
  name: z.string().min(1, "Product name is required"),
  slug: z.string().nullable(),
  description: z.string().nullable(),
  image_url: z.url().nullable(),
  short_description: z.string().nullable(),
  presale_price: decimalString.nullable(),
  edition_id: z.uuid().length(36),
  category_id: z.uuid().length(36),
  installments_max_number: z.number().int().positive(),
  installments_min_number: z.number().int().positive(),
  discount_price: decimalString.nullable(),
  discount_expires_at: z.coerce.date().nullable(),
  sales_status: SalesStatusSchema,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

// schemas for db operations
export const CreateProductSchema = ProductSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  presale_price: decimalString.optional().nullable(),
  discount_price: decimalString.optional().nullable(),
  discount_expires_at: z.coerce.date().optional().nullable(),
  prices: z.array(ProductPriceSchema.omit({ id: true, product_id: true })).refine(
    (prices) => prices.length > 0 && prices.length >= 3,
    { message: "You can only provide between 1 and 2 product prices" }
  ),
});

export const UpdateProductSchema = CreateProductSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided" }
);

export const CreateProductPriceSchema = ProductPriceSchema.omit({ id: true, product_id: true });

export const UpdateProductPriceSchema = CreateProductPriceSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided" }
);

// ---- Params & Query ----
export const ProductParamsSchema = z.object({
  id: z.uuid("Invalid product ID").length(36),
});

export const ProductQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  sales_status: SalesStatusSchema.optional(),
  category_id: z.string().optional(),
  edition_id: z.string().optional(),
  search: z.string().optional(),
});

export const ProductPriceParamsSchema = z.object({
  id: z.uuid("Invalid product price ID").length(36),
  product_id: z.uuid("Invalid product ID").length(36),
});

// ---- Inferred types ----
export type SalesStatus = z.infer<typeof SalesStatusSchema>;
export type AttendanceMode = z.infer<typeof AttendanceModeSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type ProductPrice = z.infer<typeof ProductPriceSchema>;
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type ProductParams = z.infer<typeof ProductParamsSchema>;
export type ProductQuery = z.infer<typeof ProductQuerySchema>;
export type CreateProductPriceInput = z.infer<typeof CreateProductPriceSchema>;
export type UpdateProductPriceInput = z.infer<typeof UpdateProductPriceSchema>;
export type ProductPriceParams = z.infer<typeof ProductPriceParamsSchema>;