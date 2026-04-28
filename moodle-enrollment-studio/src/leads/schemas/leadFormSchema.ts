import * as z from "zod";

export const leadFormSchema = z.object({
  first_name: z.string().trim().min(3, "Este campo es obligatorio"),
  middle_name: z.string().trim().min(3, "Este campo es obligatorio"),
  last_name: z.string().trim().min(3, "Este campo es obligatorio"),
  
  dni: z.string().regex(/^\d+$/, "Solo números").length(8, "Debe tener exactamente 8 caracteres").optional().or(z.literal("")),
  gender: z.enum(["MALE", "FEMALE", "NOT_SPECIFIED"]).optional(),
  
  email: z.string().email("Email inválido"),
  secondary_email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().min(9, "Teléfono inválido"),
  
  address: z.string().min(10, "Debe tener al menos 10 caracteres").optional().or(z.literal("")),
  second_address: z.string().min(10, "Debe tener al menos 10 caracteres").optional().or(z.literal("")),
  
  profession: z.string().optional().or(z.literal("")),
  primary_campaign_id: z.string().uuid("Campaña inválida").optional().or(z.literal("")).or(z.literal("none")),
  lead_status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  source: z.string().default("MANUAL"),
  interaction_notes: z.string().optional(),
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;

export const defaultLeadFormValues: Partial<LeadFormValues> = {
  first_name: "",
  middle_name: "",
  last_name: "",
  dni: "",
  gender: "NOT_SPECIFIED",
  email: "",
  secondary_email: "",
  phone: "",
  address: "",
  second_address: "",
  profession: "",
  primary_campaign_id: "",
  lead_status: "ACTIVE",
  source: "MANUAL",
  interaction_notes: "",
};
