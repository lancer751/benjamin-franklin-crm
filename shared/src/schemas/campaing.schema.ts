import { z } from "zod";
import { LeadOriginSourceSchema } from "./lead.schema";

export const campaingSchema = z.object({
  id: z.uuid().length(36),
  campaing_name: z.string().max(255),
  initial_budget: z
    .number()
    .positive()
    .max(99999999.99)
    .refine((val) => Number.isInteger(val * 100), {
      message: "Must have at most 2 decimal places",
    })
    .nonnegative(),
  total_spent: z
    .number()
    .nonnegative()
    .max(99999999.99)
    .optional()
    .refine(
      (val) => {
        if (val !== undefined) return Number.isInteger(val * 100);
      },
      {
        message: "Must have at most 2 decimal places",
      },
    ),
  status: z.enum(["ACTIVE", "INACTIVE", "PAUSED"]),
  edition_id: z.uuid().length(36),
  start_date: z.coerce.date(),
  end_date: z.coerce.date().optional(),
  platform: z.enum(["FACEBOOK", "INSTAGRAM", "TIKTOK", "WEBSITE"]),
  is_organic: z.boolean(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const createCampaingSchema = campaingSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const updateCampaingSchema = createCampaingSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type CampaignDTO = z.infer<typeof campaingSchema>;
export type CreateCampaignDTO = z.infer<typeof createCampaingSchema>;
export type UpdateCampaignDTO = z.infer<typeof updateCampaingSchema>;

// campaign member schemas
const campaignMemberStatus = z.enum([
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "ATTEMPTED_CONTACT",
]);

export const campaignMemberSchema = z.object({
  id: z.uuid().length(36),
  lead_id: z.string(),
  campaing_id: z.string(),
  status: campaignMemberStatus.default("NEW"),
  assigned_to: z.uuid().length(36),
  source: LeadOriginSourceSchema,
  created_at: z.date().default(() => new Date()),
  updated_at: z.date(),
  is_primary: z.boolean().default(false),
});

export const createCampaignMemberSchema = campaignMemberSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const updateCampaignMemberSchema = createCampaignMemberSchema.partial();

export type CampaignMemberDTO = z.infer<typeof campaignMemberSchema>;
export type CreateCampaignMemberDTO = z.infer<
  typeof createCampaignMemberSchema
>;
export type UpdateCampaignMemberDTO = z.infer<
  typeof updateCampaignMemberSchema
>;

export const campaignSellerSchema = z.object({
  id: z.uuid().length(36),
  campaign_id: z.uuid().length(36),
  seller_id: z.uuid().length(36),
  assigned_at: z.date().default(() => new Date()),
});

export const createCampaignSellerSchema = campaignSellerSchema.omit({
  id: true,
  assigned_at: true,
});

export type CampaignSellerDTO = z.infer<typeof campaignSellerSchema>;
export type CreateCampaignSellerDTO = z.infer<
  typeof createCampaignSellerSchema
>;