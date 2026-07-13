import { z } from "zod";
import { UUIDField } from "./helpers";

export const LeadOriginSourceSchema = z.enum([
  "FACEBOOK",
  "INSTAGRAM",
  "TIKTOK",
  "WHATSAPP",
  "WEBSITE",
]);

export const GenderSchema = z.enum(["MALE", "FEMALE", "NOT_SPECIFIED"]);
export const PhoneTypeSchema = z.enum(["WHATSAPP", "TELEPHONE"]);

export const LeadStatusSchema = z.enum(["ACTIVE", "INACTIVE"]);

export const CampaignMemberStatusSchema = z.enum([
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "UNQUALIFIED",
  "ATTEMPTED_CONTACT",
  "FOLLOW_UP",
  "ON_HOLD",
  "WON",
  "LOST",
]);

export const InteractionTypeSchema = z.enum([
  "WEBSITE_FORM",
  "SELL",
  "WHATSAPP",
  "EMAIL",
  "MEETING",
  "CALL",
]);

// ── Lead ─────────────────────────────────────────────────────────────────────

const LeadPhoneSchema = z.object({
  id: UUIDField.optional(),
  number: z
    .string()
    .length(9, "Phone number must be 9 digits")
    .refine((num) => /^9\d{8}$/.test(num)),
  type: PhoneTypeSchema,
  isPrincipal: z.boolean().default(false),
});

const exactlyOnePrincipal = (phones: z.infer<typeof LeadPhoneSchema>[]) =>
  phones.filter((p) => p.isPrincipal).length === 1;

const LeadBaseSchema = z.object({
  first_name: z.string().min(1, "First name is required").optional().nullable(),
  middle_name: z.string().default("").optional().nullable(),
  last_name: z.string().min(1, "Last name is required").optional().nullable(),
  email: z.email("Invalid email").optional().nullable(),
  profession: z.string().optional().nullable(),
  gender: GenderSchema.optional().nullable(),
  lead_status: LeadStatusSchema.default("ACTIVE"),
  address: z.string().optional().nullable(),
  secondary_email: z.email().optional().nullable(),
  dni: z.string().length(8, "DNI must be 8 digits").optional().nullable(),
  phones: z
    .array(LeadPhoneSchema)
    .min(1, "At least one phone number is required"),
});

export const CreateLeadSchema = LeadBaseSchema.refine(
  (data) => exactlyOnePrincipal(data.phones),
  {
    message: "Exactly one phone must be marked as principal",
    path: ["phones"],
  },
);

export const UpdateLeadSchema = LeadBaseSchema.partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  })
  .refine((data) => !data.phones || exactlyOnePrincipal(data.phones), {
    message: "Exactly one phone must be marked as principal",
    path: ["phones"],
  });

// ── CampaignMember (the lead's assignment to a campaign) ─────────────────────

const CampaignMemberBaseSchema = z.object({
  lead_id: UUIDField,
  campaing_id: UUIDField,
  assigned_to: UUIDField,
  source: LeadOriginSourceSchema,
  is_primary: z.boolean().default(false),
});

export const CreateCampaignMemberSchema = CampaignMemberBaseSchema;

export const UpdateCampaignMemberStatusSchema = z.object({
  status: CampaignMemberStatusSchema,
});

export const ReassignMultipleCampaignMembersSchema = z.object({
  member_ids: z
    .array(UUIDField)
    .min(1, "At least one campaign member must be selected")
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "Duplicate member_ids are not allowed",
    }),
  assigned_to: UUIDField,
});

export const ReassignCampaignMemberSchema = z.object({
  assigned_to: UUIDField,
});

// ── LeadInteraction ───────────────────────────────────────────────────────────

const LeadInteractionBaseSchema = z.object({
  notes: z.string().min(4, "Notes must be at least 4 characters"),
  type: InteractionTypeSchema,
  // campaign_member_id comes from route param
});

export const CreateLeadInteractionSchema = LeadInteractionBaseSchema;

export const UpdateLeadInteractionSchema =
  LeadInteractionBaseSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field must be provided" },
  );

// ── Task ──────────────────────────────────────────────────────────────────────

const TaskBaseSchema = z.object({
  title: z.string().min(3, "Task title must be at least 3 characters"),
  content: z.string().min(4, "Task content must be at least 4 characters"),
  is_done: z.boolean().default(false),
  due_date: z.coerce.date().optional().nullable(),
});

export const CreateTaskSchema = TaskBaseSchema;

export const UpdateTaskSchema = TaskBaseSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided" },
);

// ── Query schemas ─────────────────────────────────────────────────────────────

export const LeadQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: LeadStatusSchema.optional(),
  campaign_id: UUIDField.optional(),
  assigned_to: z.string().optional(),
});

export const CampaignMemberQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: CampaignMemberStatusSchema.optional(),
  assigned_to: UUIDField.optional(),
});

export type LeadStatus = z.infer<typeof LeadStatusSchema>;
export type CreateLeadInput = z.infer<typeof CreateLeadSchema>;
export type UpdateLeadInput = z.infer<typeof UpdateLeadSchema>;
export type CreateCampaignMemberInput = z.infer<
  typeof CreateCampaignMemberSchema
>;
export type UpdateCampaignMemberStatusInput = z.infer<
  typeof UpdateCampaignMemberStatusSchema
>;
export type ReassignCampaignMemberInput = z.infer<
  typeof ReassignCampaignMemberSchema
>;
export type CreateLeadInteractionInput = z.infer<
  typeof CreateLeadInteractionSchema
>;
export type ReassignMultipleCampaignMembersInput = z.infer<
  typeof ReassignMultipleCampaignMembersSchema
>;
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export type LeadQuery = z.infer<typeof LeadQuerySchema>;
export type CampaignMemberQuery = z.infer<typeof CampaignMemberQuerySchema>;