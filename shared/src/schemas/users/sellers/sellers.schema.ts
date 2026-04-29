import z from "zod";

export const SellerProfileSchema = z.object({
  id: z.uuid().length(36),
  user_id: z.uuid().length(36),
  sales_target: z.number().int().nonnegative().default(0),
  total_sales: z.number().int().nonnegative(),
  total_orders: z.number().int().nonnegative(),
  completed_orders: z.number().int().nonnegative(),
  canceled_orders: z.number().int().nonnegative(),
  return_rate: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid decimal format")
    .default("0"),
  response_time_avg: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid decimal format")
    .default("0"),
  assigned_supervisor_id: z.uuid().length(36),
});

export const CreateSellerProfileSchema = SellerProfileSchema.omit({
  user_id: true,
  id: true,
  total_sales: true,
  total_orders: true,
  completed_orders: true,
  canceled_orders: true,
  return_rate: true,
  response_time_avg: true,
});

export const UpdateSellerProfileSchema = SellerProfileSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided" },
);

export type SellerProfile = z.infer<typeof SellerProfileSchema>;
export type CreateSellerProfileDTO = z.infer<typeof CreateSellerProfileSchema>;
export type UpdateSellerProfileDTO = z.infer<typeof UpdateSellerProfileSchema>;