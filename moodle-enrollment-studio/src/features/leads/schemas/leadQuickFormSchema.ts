import { z } from "zod";
import { defaultLeadFieldValues, leadFieldsSchema } from "./leadFieldsSchema";
import { interactionFormSchema, interactionTypeSchema } from "./interactionFormSchema";

export const leadQuickFormSchema = leadFieldsSchema.extend({
  campaignId: z.string().uuid("Selecciona una campaña."),
  sellerId: z.string().optional(),
  source: z.enum(["FACEBOOK", "INSTAGRAM", "TIKTOK", "WHATSAPP", "WEBSITE"]),
  interactionType: interactionTypeSchema,
  notes: interactionFormSchema.shape.notes,
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
