import { z } from "zod";

const GenderSchema = z.enum(["MALE", "FEMALE", "NOT_SPECIFIED"]);

export const LeadOriginSourceSchema = z.enum([
  "FACEBOOK",
  "INSTAGRAM",
  "TIKTOK",
  "WHATSAPP",
  "WEBSITE",
]);

export const LeadStageSchema = z.enum([
  "NEW",
  "CONTACTED",
  "ATTEMPTED_CONTACT",
  "QUALIFIED",
  "UNQUALIFIED",
  "IN_PROGRESS",
  "NEGOTIATION",
  "PROPOSAL_SENT",
  "WON",
  "LOST",
  "REJECTED",
  "FOLLOW_UP",
  "ON_HOLD",
]);

export const LeadStatusSchema = z.enum(["ACTIVE", "INACTIVE"]);

export const LeadSchema = z.object({
  id: z.uuid().max(36),
  first_name: z.string().min(3),
  middle_name: z.string().min(3),
  last_name: z.string().min(3),
  profession: z.string().optional().nullable(),
  gender: GenderSchema.optional().nullable(),
  address: z.string().min(10).optional().nullable(),
  second_address: z.string().min(10).optional().nullable(),
  email: z.email(),
  secondary_email: z.email().optional().nullable(),
  dni: z
    .string()
    .length(8)
    .optional()
    .nullable()
    .refine(
      (dni) => {
        if (!dni) return null;
        return /^\d+$/.test(dni);
      },
      { message: "DNI must contain only numbers" },
    ),
  moodle_user_id: z.number().int().optional().nullable(),
  lead_status: LeadStatusSchema,
  primary_campaign_id: z.uuid().max(36),
  created_at: z.date(),
  updated_at: z.date(),
});

export const createLeadSchema = LeadSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// lead interaction schema
const interactionTypeSchema = z.enum([
  "WEBSITE_FORM",
  "SELL",
  "WHATSAPP",
  "EMAIL",
  "MEETING",
  "CALL",
]);

export const LeadInteractionSchema = z.object({
  id: z.uuid().length(36),
  lead_id: z.uuid(),
  notes: z.string().max(255),
  created_by: z.uuid().length(36).optional().nullable(),
  campaing_id: z.uuid().length(36),
  type: interactionTypeSchema,
});

export const createLeadFromExternalSchema = createLeadSchema
  .omit({ primary_campaign_id: true })
  .extend({
    lead_interaction: LeadInteractionSchema.omit({
      id: true,
      created_by: true,
      lead_id: true,
      campaing_id: true,
    }),
    source: LeadOriginSourceSchema,
    campaing_id: z.uuid().length(36),
  });

export const updateLeadSchema = createLeadSchema
  .partial()
  .refine(
    (data) => (
      Object.keys(data).length > 0,
      { message: "At least one field must be provided" }
    ),
  );

export const createLeadInteractionSchema = LeadInteractionSchema.omit({
  id: true,
});

export const updateLeadInteractionSchema = createLeadInteractionSchema
  .partial()
  .refine(
    (data) => (
      Object.keys(data).length > 0,
      { message: "At least one field must be provided" }
    ),
  );
