import { z } from "zod";
import { UUIDField } from "./helpers";

export const CampaignStatusSchema = z.enum(["ACTIVE", "INACTIVE", "PAUSED"]);
export const CampaignPlatformSchema = z.enum([
  "FACEBOOK",
  "INSTAGRAM",
  "TIKTOK",
  "WEBSITE",
]);

const CampaignFieldsSchema = z.object({
  name: z.string().min(1),
  initial_budget: z.coerce.number().positive(),
  start_date: z.coerce.date(),
  end_date: z.coerce.date().optional().nullable(),
  platform: CampaignPlatformSchema,
  is_organic: z.boolean(),
  status: CampaignStatusSchema.default("INACTIVE"),
  product_id: UUIDField,
  supervisor_id: UUIDField,
  // Meta linkage
  meta_campaign_id: z.string().optional().nullable(),
  meta_form_id: z.string().optional().nullable(),
  click_to_whatsapp: z.boolean().default(false),
  whatsapp_number: z
    .string()
    .length(9)
    .regex(/^9\d{8}$/)
    .optional()
    .nullable(),
});

export const CreateCampaignSchema = CampaignFieldsSchema.extend({
  seller_ids: z.array(UUIDField).min(1, "At least one seller must be assigned"),
})
  .refine((data) => !data.click_to_whatsapp || !!data.whatsapp_number, {
    message: "whatsapp_number is required when click_to_whatsapp is enabled",
    path: ["whatsapp_number"],
  })
  .refine((data) => !(data.meta_form_id && data.click_to_whatsapp), {
    message: "A campaign can link a lead form or click-to-WhatsApp, not both",
    path: ["click_to_whatsapp"],
  });

const CampaignUpdateFieldsSchema = z.object({
  name: z.string().min(1).optional(),
  initial_budget: z.coerce.number().positive().optional(),
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().optional().nullable(),
  platform: CampaignPlatformSchema.optional(),
  is_organic: z.boolean().optional(),
  status: CampaignStatusSchema.optional(),
  product_id: UUIDField.optional(),
  supervisor_id: UUIDField.optional(),
  meta_campaign_id: z.string().optional().nullable(),
  meta_form_id: z.string().optional().nullable(),
  click_to_whatsapp: z.boolean().optional(),
  whatsapp_number: z
    .string()
    .length(9)
    .regex(/^9\d{8}$/)
    .optional()
    .nullable(),
});

export const UpdateCampaignSchema = CampaignUpdateFieldsSchema.refine(
  (data) => Object.keys(data).length > 0,
  { error: "At least one field must be provided" },
)
  .refine(
    // solo valida si AMBOS vienen en el payload — si el usuario solo
    // actualiza whatsapp_number sin tocar click_to_whatsapp, no hay
    // suficiente contexto en este payload para juzgar la regla completa
    (data) =>
      data.click_to_whatsapp === undefined ||
      !data.click_to_whatsapp ||
      !!data.whatsapp_number,
    {
      error: "whatsapp_number is required when click_to_whatsapp is enabled",
      path: ["whatsapp_number"],
    },
  )
  .refine((data) => !(data.meta_form_id && data.click_to_whatsapp), {
    error: "A campaign can link a lead form or click-to-WhatsApp, not both",
    path: ["click_to_whatsapp"],
  })
  .refine((data) => !data.meta_campaign_id || !!data.meta_form_id, {
    error: "Choosing a meta campaign requires selecting a meta form",
    path: ["meta_form_id"],
  });

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
    .refine(
      (val) => val && val.trim().length > 0,
      "Search query cannot be empty",
    ),
});

export type CreateCampaignInput = z.infer<typeof CreateCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof UpdateCampaignSchema>;
export type AssignSellersInput = z.infer<typeof AssignSellersSchema>;
export type CampaignQuery = z.infer<typeof CampaignQuerySchema>;
