import { z } from "zod";

export const orderSchema = z.object({
  id: z.uuid().length(36),
  lead_id: z.uuid().length(36),
  generated_by: z.uuid().length(36),
  sub_total: z.number().positive(),
  total_amount: z.number().positive(),
  discount: z.number().nonnegative().default(0),
  order_status: z
    .enum(["PENDING", "COMPLETED", "REFUNDED", "CANCELLED"])
    .default("PENDING"),
  order_code: z.string().length(7),
  created_at: z.date(),
  updated_at: z.date(),
});

export const createOrderSchema = orderSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export const updateOrderSchema = createOrderSchema.partial();
