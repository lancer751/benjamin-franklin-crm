import { z } from "zod";
import { defaultLeadFieldValues, leadFieldsSchema } from "./leadFieldsSchema";

export const leadQuickFormSchema = leadFieldsSchema.extend({
  campaignId: z.string().uuid("Selecciona una campaña."),
  sellerId: z.string().optional(),
  source: z.enum(["FACEBOOK", "INSTAGRAM", "TIKTOK", "WHATSAPP", "WEBSITE"]),
  interactionType: z.enum(["WEBSITE_FORM", "SELL", "WHATSAPP", "EMAIL", "MEETING", "CALL"]),
  notes: z.string().transform((value) => value.trim()).refine(
    (value) => value.length >= 4,
    "Registra una nota de al menos 4 caracteres.",
  ),
});

export type LeadQuickFormInput = z.input<typeof leadQuickFormSchema>;
export type LeadQuickFormData = z.output<typeof leadQuickFormSchema>;

export const defaultLeadQuickFormValues: LeadQuickFormInput = {
  ...defaultLeadFieldValues,
  campaignId: "",
  sellerId: "",
  source: "WHATSAPP",
  interactionType: "WHATSAPP",
  notes: "",
};
