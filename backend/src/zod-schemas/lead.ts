import z from "zod";

const GenderSchema = z.enum(["MALE", "FEMALE", "NOT_SPECIFIED"]);

export const LeadOriginSourceSchema = z.enum([
  "FACEBOOK",
  "INSTAGRAM",
  "TIKTOK",
  "WHATSAPP",
  "WEBSITE",
]);

export const LeadStatusSchema = z.enum([
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
  dni: z.string().min(8).optional().nullable(),
  score: z.number().int().optional(),
  moodle_user_id: z.number().int().optional().nullable(),
  source: LeadOriginSourceSchema,
  lead_status: LeadStatusSchema.optional(),
});

export const CreateLeadSchema = LeadSchema.omit({
  id: true,
});

export const UpdateLeadSchema = CreateLeadSchema.partial().refine(
  (data) => (
    Object.keys(data).length > 0,
    { message: "At least one field must be provided" }
  ),
);
