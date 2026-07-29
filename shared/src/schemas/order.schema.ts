import { z } from "zod";
import { AttendanceModeSchema } from "./products/price.schema";
import { decimalString } from "../utils/fields-validation";
import { PaymentTypeSchema } from "./payment.schema";

export const OrderStatusSchema = z.enum([
  "PENDING",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
]);

const CreateOrderItemSchema = z.object({
  product_id: z.uuid().length(36),
  attendance_mode: AttendanceModeSchema, // only meaningful for HIBRIDO editions — see route
  payment_modality: PaymentTypeSchema,
  discount_code: z.string().length(7).optional(),
});

export const CreateOrderSchema = z.object({
  lead_id: z.uuid().length(36),
  order_items: z.array(CreateOrderItemSchema).min(1),
  related_campaign: z.uuid().length(36),
  generated_by: z.uuid().length(36),
  assigned_to: z.uuid().length(36)
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
  creation_order: z.enum(["asc", "desc"])
});

export const OrderDetailParamsSchema = z.object({
  id: z.uuid().length(36),
});

// ---- Inferred types ----
export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type OrderDetail = z.infer<typeof CreateOrderItemSchema>;
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderInput = z.infer<typeof UpdateOrderSchema>;
export type OrderParams = z.infer<typeof OrderParamsSchema>;
export type OrderQuery = z.infer<typeof OrderQuerySchema>;