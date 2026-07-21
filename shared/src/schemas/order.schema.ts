import { z } from "zod";
import { AttendanceModeSchema } from "./products/price.schema";
import { decimalString } from "../utils/fields-validation";

export const OrderStatusSchema = z.enum([
  "PENDING",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
]);

export const OrderDetailSchema = z.object({
  id: z.uuid().length(36),
  product_id: z.uuid().length(36),
  price: decimalString,
  order_id: z.uuid().length(36),
  discount_code: z.string().optional().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const OrderSchema = z.object({
  id: z.uuid().length(36),
  lead_id: z.uuid().length(36),
  generated_by: z.uuid().length(36).optional().nullable(),
  sub_total: decimalString,
  total_amount: decimalString,
  discount: decimalString.optional(),
  order_status: OrderStatusSchema,
  order_code: z.string().length(7),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

// ── Create ───────────────────────────────────────────────────────────────
// The client only says WHAT is being bought (product + attendance mode).
// Price, sub_total, total_amount, order_status, order_code and generated_by
// are all resolved server-side — never trust these from the request body.

const CreateOrderItemSchema = z.object({
  product_id: z.uuid().length(36),
  attendance_mode: AttendanceModeSchema,
  discount_code: z.string().optional().nullable(),
});

export const CreateOrderSchema = z.object({
  lead_id: z.uuid().length(36),
  discount: decimalString.optional(),
  order_items: z
    .array(CreateOrderItemSchema)
    .min(1, "At least one order item is required"),
});

// ── Update ───────────────────────────────────────────────────────────────
// lead_id and generated_by are intentionally not editable after creation.
// order_items, if provided, are re-priced server-side the same way as create.

export const UpdateOrderSchema = z
  .object({
    discount: decimalString.optional(),
    order_status: OrderStatusSchema.optional(),
    order_items: z.array(CreateOrderItemSchema).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

// Params and Query schemas
export const OrderParamsSchema = z.object({
  id: z.uuid().length(36),
});

export const OrderQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  order_status: OrderStatusSchema.optional(),
  lead_id: z.uuid().optional(),
  generated_by: z.uuid().optional(),
});

export const OrderDetailParamsSchema = z.object({
  id: z.uuid().length(36),
});

// ---- Inferred types ----
export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type OrderDetail = z.infer<typeof OrderDetailSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderInput = z.infer<typeof UpdateOrderSchema>;
export type OrderParams = z.infer<typeof OrderParamsSchema>;
export type OrderQuery = z.infer<typeof OrderQuerySchema>;