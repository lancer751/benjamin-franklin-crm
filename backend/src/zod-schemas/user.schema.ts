import { z } from "zod";

export const userSchema = z.object({
  id: z.uuid().min(36).max(36),
  name: z.string().min(1, "Name is required"),
  first_name: z
    .string()
    .min(2, "First name must be at least 2 characters long"),
  middle_name: z.string(),
  last_name: z.string().min(2, "Last name must be at least 2 characters long"),
  email: z.email("Invalid email address").optional(),
  cellphone: z
    .string()
    .regex(/^\d{9}$/, "Invalid cellphone number")
    .optional(),
  role_id: z.uuid("Invalid role ID"),
  is_active: z.boolean().default(true),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  created_at: z.date().default(() => new Date()),
  updated_at: z.date().default(() => new Date()),
});

export const createUserSchema = userSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const updateUserSchema = createUserSchema.partial();

// seller profiles schema
export const sellerProfileSchema = userSchema
  .extend({
    user_id: z.uuid().min(36).max(36),
    sales_target: z
      .number()
      .positive("Sales target must be a positive number")
      .default(0)
      .optional(),
    sales_closed: z
      .number()
      .positive("Sales closed must be a positive number")
      .default(0)
      .optional(),
    max_discount: z
      .number()
      .min(0, "Max discount must be at least 0")
      .max(100, "Max discount cannot exceed 100")
      .default(0),
  })
  .omit({ id: true });

export const updateSellerProfileSchema = sellerProfileSchema
  .omit({ user_id: true })
  .partial();
