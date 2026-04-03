import { z } from "zod";

export const productSchema = z.object({
  id: z.uuid().length(36),
  slug: z.string().optional(),
  description: z.string().optional(),
  short_description: z.string().optional(),
  category: z.string(),
  edition_id: z.string(),
  cash_price: z.number().positive(),
  installment_price: z.number().positive(),
  discount_price: z.number().positive().optional().default(0),
  discount_expires_at: z.date().optional(),
  sales_status: z.enum([
    "DRAFT",
    "PUBLISHED",
    "ON_SALE",
    "COMPLETED",
    "CANCELLED",
  ]),
  created_at: z.date(),
  updated_at: z.date(),
});

export const createProductSchema = productSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const updateProductSchema = createProductSchema.partial();

export type Product = z.infer<typeof productSchema>;
