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
  email: z.email("Invalid email address"),
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

const BaseCreateUserSchema = UserSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const checkAtLeastOneProfileField = (data: any) => {
  const hasAtLeastOneField = Object.values(data).some(
    (value) => value !== undefined,
  );
  if (!hasAtLeastOneField) {
    return false;
  }
};

export const CreateUserSchema = z.discriminatedUnion("role", [
  BaseCreateUserSchema.extend({
    role: z.literal("SALES_REP"),
    seller_profile: CreateSellerProfileSchema.refine(
      (data) => checkAtLeastOneProfileField(data),
      {
        message:
          "At least the assigned supervisor field must be provided in seller_profile",
      },
    ),
  }),
  BaseCreateUserSchema.extend({
    role: z.literal("SALES_SUPERVISOR"),
    sales_supervisor_profile: createSalesSupervisorProfileSchema
      .omit({ user_id: true }) // is not necessary when creating the user account and profile
      .refine(
        (data) => {
          const hasAtLeastOneField = Object.values(data).some(
            (value) => value !== undefined,
          );
          if (!hasAtLeastOneField) {
            return false;
          }
        },
        {
          message:
            "At least one profile field must be provided in sales_supervisor_profile",
        },
      ),
  }),
  BaseCreateUserSchema.extend({
    role: z.literal("MARKETING"),
    marketing_profile: CreateMarketingProfileSchema.omit({ user_id: true }),
  }),
  // Each no-profile role gets its own literal entry
  BaseCreateUserSchema.extend({ role: z.literal("ADMIN") }),
  BaseCreateUserSchema.extend({ role: z.literal("COLLECTIONS") }),
]);

export const UpdateUserSchema = BaseCreateUserSchema.partial()

export type User = z.infer<typeof UserSchema>;
export type CreateUserDTO = z.infer<typeof CreateUserSchema>;
export type UpdateUserDTO = z.infer<typeof UpdateUserSchema>;