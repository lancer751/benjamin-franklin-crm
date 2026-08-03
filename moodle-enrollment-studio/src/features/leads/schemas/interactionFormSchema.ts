import { z } from "zod";

export const interactionTypeSchema = z.enum(
  ["WEBSITE_FORM", "SELL", "WHATSAPP", "EMAIL", "MEETING", "CALL"],
  { message: "Selecciona un canal de gestión." },
);

export const interactionFormSchema = z.object({
  type: interactionTypeSchema,
  notes: z
    .string()
    .trim()
    .min(4, "Describe el resultado de la gestión con al menos 4 caracteres.")
    .max(255, "La descripción no puede superar los 255 caracteres."),
});

export type InteractionFormValues = z.infer<typeof interactionFormSchema>;
