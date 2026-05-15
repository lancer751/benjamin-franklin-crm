import * as z from "zod";

export const professorFormSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  last_name: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.string().email("Por favor, ingresa un correo electrónico válido"),
  corporate_email: z.string().email("Por favor, ingresa un correo electrónico válido").optional().or(z.literal("")),
  cellphone: z.string()
    .regex(/^\d{9}$/, "El celular debe tener exactamente 9 dígitos numéricos")
    .optional()
    .or(z.literal("")),
  moddle_account_id: z.coerce.number().optional()
});

export type ProfessorFormValues = z.infer<typeof professorFormSchema>;
