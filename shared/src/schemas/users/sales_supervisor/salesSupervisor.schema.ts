import z from "zod";
import { decimalString } from "../../../utils/fields-validation";

export const salesSupervisorProfileSchema = z.object({
  id: z.uuid().length(36),
  user_id: z.uuid().length(36),
  team_name: z.string().nullable().optional(),
  max_sellers: z.number().int().default(10),
  can_assign_leads: z.boolean().default(true),
  can_reassign_leads: z.boolean().default(true),
  can_approve_discounts: z.boolean().default(true),
  can_cancel_orders: z.boolean().default(true),
  can_view_all_team_sales: z.boolean().default(true),
  discount_limit_percent: decimalString.default("10"),
  max_manual_discount: decimalString.nullable().optional().default("0"),
  supervised_sellers: z.number().int().default(0),
  active_sellers: z.number().int().default(0),
  total_team_sales: z.number().int().default(0),
  total_team_orders: z.number().int().default(0),
  completed_team_orders: z.number().int().default(0),
  cancelled_team_orders: z.number().int().default(0),
  team_conversion_rate: decimalString.default("0"),
  avg_team_response_time: decimalString.default("0"),
});

export const createSalesSupervisorProfileSchema =
  salesSupervisorProfileSchema.omit({
    id: true,
    supervised_sellers: true,
    active_sellers: true,
    total_team_sales: true,
    total_team_orders: true,
    completed_team_orders: true,
    cancelled_team_orders: true,
    team_conversion_rate: true,
    avg_team_response_time: true,
  });

export const updateSalesSupervisorProfileSchema = salesSupervisorProfileSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type SalesSupervisorProfile = z.infer<typeof salesSupervisorProfileSchema>;
export type CreateSalesSupervisorProfileDTO = z.infer<
  typeof createSalesSupervisorProfileSchema
>;
export type UpdateSalesSupervisorProfileDTO = z.infer<
  typeof updateSalesSupervisorProfileSchema
>;