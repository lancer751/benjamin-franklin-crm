import { z } from "zod";
<<<<<<< HEAD
import { CreateProductPriceSchema } from "./price.schema";
import { CreateCertificationSchema } from "./certification.schema";
=======
import { CreateRefinedProductPriceSchema } from "./price.schema";
import { CreateRefinedCertificationSchema } from "./certification.schema";
>>>>>>> origin/backend
import { CreateFAQSchema } from "./faq.schema";
import { DecimalField, OptionalUrl, UUIDField } from "../helpers";

export const SalesStatusSchema = z.enum([
  "DRAFT",
  "PUBLISHED",
  "ON_SALE",
  "COMPLETED",
  "CANCELLED",
]);

<<<<<<< HEAD
// 🧠 El objeto con todas las propiedades pero sin los .refine() finales
const ProductBaseObject = z.object({
=======
export const ProductSchema = z.object({
>>>>>>> origin/backend
  id: UUIDField,
  edition_id: UUIDField,
  category_id: UUIDField,
  name: z.string().min(4, "Product name must be at least 4 characters"),
  slug: z
    .string()
<<<<<<< HEAD
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens only")
=======
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase with hyphens only",
    )
>>>>>>> origin/backend
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
  installments_max_number: z.number().int().min(1).max(24),
  installments_min_number: z.number().int().min(1),
  sales_status: SalesStatusSchema.default("DRAFT"),
<<<<<<< HEAD
  prices: z.array(CreateProductPriceSchema).min(1, "At least one price must be defined"),
  benefit_ids: z.array(UUIDField).min(1, "At least one benefit must be linked"),
  faqs: z.array(CreateFAQSchema).optional().default([]),
  certifications: z.array(CreateCertificationSchema).optional().default([]),
=======
  // Nested on create
  prices: z
    .array(CreateRefinedProductPriceSchema)
    .min(1, "At least one price must be defined"),
  benefit_ids: z.array(UUIDField).min(1, "At least one benefit must be linked"),
  faqs: z.array(CreateFAQSchema).optional().default([]),
  certifications: z
    .array(CreateRefinedCertificationSchema)
    .optional()
    .default([]),
>>>>>>> origin/backend
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

<<<<<<< HEAD
// Esquema de lectura final con sus refinamientos
export const ProductSchema = ProductBaseObject.refine(
  ({ installments_min_number, installments_max_number }) =>
    installments_max_number >= installments_min_number,
  {
    message: "installments_max_number must be greater than or equal to installments_min_number",
    path: ["installments_max_number"],
  }
).refine(
  ({ discount_price, discount_expires_at }) => {
=======
export const CreateProductSchema = ProductSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

const CreateRefinedProductSchema = CreateProductSchema.refine(
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
>>>>>>> origin/backend
    if (discount_price && discount_price > 0) return !!discount_expires_at;
    return true;
  },
  {
    message: "discount_expires_at is required when a discount_price is set",
    path: ["discount_expires_at"],
<<<<<<< HEAD
  }
);

// 🧠 Creación limpia desde el objeto base
export const CreateProductSchema = ProductBaseObject.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).refine(
  ({ installments_min_number, installments_max_number }) =>
    installments_max_number >= installments_min_number,
  {
    message: "installments_max_number must be greater than or equal to installments_min_number",
    path: ["installments_max_number"],
  }
).refine(
  ({ discount_price, discount_expires_at }) => {
    if (discount_price && discount_price > 0) return !!discount_expires_at;
    return true;
  },
  {
    message: "discount_expires_at is required when a discount_price is set",
    path: ["discount_expires_at"],
  }
);

// 🧠 Actualización parcial limpia sin chocar con Zod
export const UpdateProductSchema = ProductBaseObject.omit({
  id: true,
  created_at: true,
  updated_at: true,
})
  .partial()
  .refine(
    ({ installments_min_number, installments_max_number }) => {
      if (installments_max_number !== undefined && installments_min_number !== undefined) {
        return installments_max_number >= installments_min_number;
      }
      return true;
    },
    {
      message: "installments_max_number must be greater than or equal to installments_min_number",
      path: ["installments_max_number"],
    }
  )
  .refine(
    ({ discount_price, discount_expires_at }) => {
      if (discount_price && discount_price > 0) return !!discount_expires_at;
      return true;
    },
    {
      message: "discount_expires_at is required when a discount_price is set",
      path: ["discount_expires_at"],
    }
  )
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field must be provided" }
  );
=======
  },
);

export const UpdateProductSchema = CreateProductSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided" },
);
>>>>>>> origin/backend

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
