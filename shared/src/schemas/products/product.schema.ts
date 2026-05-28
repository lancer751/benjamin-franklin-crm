import { z } from "zod";
import { CreateRefinedProductPriceSchema } from "./price.schema";
import { DecimalField, OptionalUrl, UUIDField } from "../helpers";

export const SalesStatusSchema = z.enum([
  "DRAFT",
  "PUBLISHED",
  "ON_SALE",
  "COMPLETED",
  "CANCELLED",
]);

export const ProductSchema = z.object({
  id: UUIDField,
  edition_id: UUIDField,
  category_id: UUIDField,
  name: z.string().min(4, "Product name must be at least 4 characters"),
  slug: z
    .string()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase with hyphens only",
    )
    .optional()
    .nullable(),
  description: z
    .string()
    .max(2000, "Description must be at most 2000 characters")
    .optional()
    .nullable(),
  short_description: z
    .string()
    .max(160, "Short description must be at most 160 characters")
    .optional()
    .nullable(),
  image_url: OptionalUrl,
  presale_price: DecimalField.optional().nullable(),
  discount_price: DecimalField.optional().nullable().default(0),
  discount_expires_at: z.coerce.date().optional().nullable(),
  brochure_url: OptionalUrl,
  installments_max_number: z.number().int().min(1).max(24),
  installments_min_number: z.number().int().min(1),
  sales_status: SalesStatusSchema.default("DRAFT"),
  // Nested on create
  prices: z
    .array(CreateRefinedProductPriceSchema)
    .min(1, "At least one price must be defined"),
  benefit_ids: z.array(UUIDField).min(1, "At least one benefit must be linked"),
  faq_ids: z.array(UUIDField).optional().default([]),
  certification_ids: z
    .array(UUIDField)
    .optional()
    .default([]),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const CreateProductSchema = ProductSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const CreateRefinedProductSchema = CreateProductSchema.refine(
  ({ installments_min_number, installments_max_number }) =>
    installments_max_number >= installments_min_number,
  {
    message:
      "installments_max_number must be greater than or equal to installments_min_number",
    path: ["installments_max_number"],
  },
).refine(
  ({ discount_price, discount_expires_at }) => {
    // If a discount is set, an expiry date should accompany it
    if (discount_price && discount_price > 0) return !!discount_expires_at;
    return true;
  },
  {
    message: "discount_expires_at is required when a discount_price is set",
    path: ["discount_expires_at"],
  },
);

export const UpdateProductSchema = CreateProductSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided" },
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
export type Product = z.infer<typeof ProductSchema>;
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type ProductParams = z.infer<typeof ProductParamsSchema>;
export type ProductQuery = z.infer<typeof ProductQuerySchema>;