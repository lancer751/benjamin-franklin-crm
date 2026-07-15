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

export const CreateCampaignSchema = z.object({
  name: z.string().min(1),
  initial_budget: z.coerce.number().positive(),
  start_date: z.coerce.date(),
  end_date: z.coerce.date().optional().nullable(),
  platform: CampaignPlatformSchema,
  is_organic: z.boolean(),
  status: CampaignStatusSchema.default("INACTIVE"), // never create as ACTIVE directly
  product_id: UUIDField,
  supervisor_id: UUIDField,
  seller_ids: z.array(UUIDField).min(1, "At least one seller must be assigned"),

  // Meta linkage — all optional (organic/non-Meta campaigns skip these)
  meta_campaign_id: z.string().optional().nullable(),
  meta_form_id: z.string().optional().nullable(),
  click_to_whatsapp: z.boolean().default(false),
  whatsapp_number: z
    .string()
    .length(9)
    .regex(/^9\d{8}$/)
    .optional()
    .nullable(),
}).refine(
  (data) => !data.click_to_whatsapp || !!data.whatsapp_number,
  { message: "whatsapp_number is required when click_to_whatsapp is enabled", path: ["whatsapp_number"] },
).refine(
  (data) => !(data.meta_form_id && data.click_to_whatsapp),
  { message: "A campaign can link a lead form or click-to-WhatsApp, not both", path: ["click_to_whatsapp"] },
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
