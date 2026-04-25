import { z } from "zod";

export const RoleAccessSchema = z.enum([
  "SALES_REP",
  "MARKETING",
  "SALES_SUPERVISOR",
  "ADMIN",
  "COLLECTIONS",
]);

export const UserSchema = z.object({
  id: z.uuid().length(36),
  first_name: z
    .string()
    .min(2, "First name must be at least 2 characters long"),
  middle_name: z.string(),
  last_name: z.string().min(2, "Last name must be at least 2 characters long"),
  email: z.string().email("Invalid email address").optional().nullable(),
  cellphone: z
    .string()
    .regex(/^\d{9}$/, "Invalid cellphone number - must be 9 digits")
    .optional()
    .nullable(),
  role_id: z.uuid().length(36),
  is_active: z.boolean(),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const CreateUserSchema = UserSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const UpdateUserSchema = CreateUserSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided" }
);

// ---- Seller Profile ----
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
});

export const CreateSellerProfileSchema = SellerProfileSchema.omit({
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
  { message: "At least one field must be provided" }
);

// ---- Marketing Profile ----
export const MarketingProfileSchema = z.object({
  id: z.uuid().length(36),
  user_id: z.uuid().length(36),
});

export const CreateMarketingProfileSchema = MarketingProfileSchema.omit({
  id: true,
});

// ---- Role ----
export const RoleSchema = z.object({
  id: z.uuid().length(36),
  name: RoleAccessSchema,
  description: z.string().optional().nullable(),
  is_active: z.boolean(),
});

// ---- Types ----
export type RoleAccess = z.infer<typeof RoleAccessSchema>;
export type User = z.infer<typeof UserSchema>;
export type CreateUserDTO = z.infer<typeof CreateUserSchema>;
export type UpdateUserDTO = z.infer<typeof UpdateUserSchema>;
export type SellerProfile = z.infer<typeof SellerProfileSchema>;
export type CreateSellerProfileDTO = z.infer<typeof CreateSellerProfileSchema>;
export type UpdateSellerProfileDTO = z.infer<typeof UpdateSellerProfileSchema>;
export type MarketingProfile = z.infer<typeof MarketingProfileSchema>;
export type CreateMarketingProfileDTO = z.infer<typeof CreateMarketingProfileSchema>;
export type Role = z.infer<typeof RoleSchema>;