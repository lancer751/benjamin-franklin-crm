import { z } from "zod";
import { UUIDField } from "./helpers";

export const CampaignStatusSchema = z.enum(["ACTIVE", "INACTIVE", "PAUSED"]);
export const CampaignPlatformSchema = z.enum([
  "FACEBOOK",
  "INSTAGRAM",
  "TIKTOK",
  "WEBSITE",
]);

const CampaignBaseSchema = z.object({
  campaing_name: z
    .string()
    .min(3, "Campaign name must be at least 3 characters"),
  initial_budget: z.number().nonnegative().multipleOf(0.01),
  start_date: z.coerce.date(),
  end_date: z.coerce.date().optional().nullable(),
  platform: CampaignPlatformSchema,
  is_organic: z.boolean().default(false),
  status: CampaignStatusSchema.default("INACTIVE"),
  product_id: UUIDField,
  supervisor_id: UUIDField,
  meta_form_id: z.string().optional().nullable(),
});

export const CreateCampaignSchema = CampaignBaseSchema.refine(
  ({ end_date, start_date }) => !end_date || end_date > start_date,
  { message: "end_date must be after start_date", path: ["end_date"] },
);

export const UpdateCampaignSchema = CampaignBaseSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided" },
);

export const AssignSellerSchema = z.object({
  seller_id: UUIDField,
});

export const AssignSellersSchema = z.object({
  seller_ids: z.array(UUIDField).min(1, "At least one seller must be assigned"),
});

export const CampaignQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: CampaignStatusSchema.optional(),
  platform: CampaignPlatformSchema.optional(),
  search: z
    .string()
    .optional()
    .refine((val) => val && val.trim().length > 0, "Search query cannot be empty"),
});

export type CreateCampaignInput = z.infer<typeof CreateCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof UpdateCampaignSchema>;
export type AssignSellersInput = z.infer<typeof AssignSellersSchema>;
export type CampaignQuery = z.infer<typeof CampaignQuerySchema>;
