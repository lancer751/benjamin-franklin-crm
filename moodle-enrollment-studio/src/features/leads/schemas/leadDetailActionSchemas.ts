import { z } from "zod";

export const interactionFormSchema = z.object({
  type: z.enum(["WEBSITE_FORM", "SELL", "WHATSAPP", "EMAIL", "MEETING", "CALL"]),
  notes: z.string().transform((value) => value.trim()).refine((value) => value.length >= 4, "Ingresa al menos 4 caracteres."),
});

export const taskFormSchema = z.object({
  title: z.string().transform((value) => value.trim()).refine((value) => value.length >= 3, "Ingresa al menos 3 caracteres."),
  content: z.string().transform((value) => value.trim()).refine((value) => value.length >= 4, "Ingresa al menos 4 caracteres."),
  due_date: z.string().refine((value) => value === "" || !Number.isNaN(new Date(value).getTime()), "Ingresa una fecha válida."),
});

export type InteractionFormData = z.output<typeof interactionFormSchema>;
export type TaskFormData = z.output<typeof taskFormSchema>;
