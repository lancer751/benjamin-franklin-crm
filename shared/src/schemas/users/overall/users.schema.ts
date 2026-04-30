import z from "zod";
import { CreateSellerProfileSchema } from "../sellers/sellers.schema";
import { createSalesSupervisorProfileSchema } from "../sales_supervisor/salesSupervisor.schema";
import { CreateMarketingProfileSchema } from "../marketing/marketers.schema";

export const UserSchema = z.object({
  id: z.uuid().length(36),
  first_name: z
    .string()
    .min(2, "First name must be at least 2 characters long"),
  middle_name: z.string(),
  last_name: z.string().min(2, "Last name must be at least 2 characters long"),
  email: z.email("Invalid email address").optional().nullable(),
  corporate_email: z
    .email("Invalid corporate email address")
    .optional()
    .nullable(),
  cellphone: z
    .string()
    .regex(/^\d{9}$/, "Invalid cellphone number - must be 9 digits")
    .optional()
    .nullable(),
  corporate_cellphone: z
    .string()
    .regex(/^\d{9}$/, "Invalid corporate cellphone number - must be 9 digits")
    .optional()
    .nullable(),
  role_id: z.uuid().length(36),
  is_active: z.boolean(),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  birth_date: z.coerce.date().optional().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const CreateUserSchema = UserSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  seller_profile: CreateSellerProfileSchema.optional(),
  sales_supervisor_profile: createSalesSupervisorProfileSchema.optional(),
  marketing_profile: CreateMarketingProfileSchema.optional()
})

export const UpdateUserSchema = CreateUserSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided" },
);

export type User = z.infer<typeof UserSchema>;
export type CreateUserDTO = z.infer<typeof CreateUserSchema>;
export type UpdateUserDTO = z.infer<typeof UpdateUserSchema>;