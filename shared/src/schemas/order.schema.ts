import { z } from "zod";

const decimalString = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, "Must be a valid decimal with up to 2 decimal places");

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

// Create and Update schemas
export const CreateOrderSchema = OrderSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  order_code: true,
}).extend({
  discount: decimalString.optional(),
  order_items: z.array(
    OrderDetailSchema.omit({
      id: true,
      created_at: true,
      updated_at: true,
      order_id: true,
    })
  ),
});

export const UpdateOrderSchema = CreateOrderSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided" }
);

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
