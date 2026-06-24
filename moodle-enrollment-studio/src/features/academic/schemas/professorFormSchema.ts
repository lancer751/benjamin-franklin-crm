import { z } from "zod";
import { BaseCreateProfessorSchema } from "shared"; 

const spanishErrorMap = (issue: any, ctx: any) => {
  const defaultMsg = ctx?.defaultError || "Campo inválido";

  if (issue.code === "invalid_type") {
    if (issue.received === "undefined" || issue.received === "null") {
      return { message: "Este campo es obligatorio" };
    }
  }

  if (issue.code === "too_small") {
    if (issue.minimum === 1) return { message: "Este campo es obligatorio" };
    return { message: `El campo debe tener al menos ${issue.minimum} caracteres` };
  }

  if (
    (issue.code === "invalid_string" && (issue as any).validation === "email") ||
    (issue.code === "invalid_format" && (issue as any).format === "email")
  ) {
    return { message: "Por favor, ingresa un correo electrónico válido" };
  }

  if (issue.code === "invalid_string" && (issue as any).validation === "regex") {
    return { message: "El celular debe tener exactamente 9 dígitos numéricos" };
  }

  return { message: defaultMsg };
};

z.setErrorMap(spanishErrorMap as any);

export const professorFormSchema = BaseCreateProfessorSchema.extend({
  // Ajustamos a min 2 caracteres para mejorar la UX en español
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastname: z.string().min(2, "El apellido debe tener al menos 2 caracteres"), 

  // ⚠️ Quitamos el .optional() porque el backend los exige obligatoriamente
  email: z.string().email("Por favor, ingresa un correo electrónico válido"),
  
  corporate_email: z.string().email("Por favor, ingresa un correo corporativo válido"),
  
  cellphone: z.string().regex(/^\d{9}$/, "El celular debe tener exactamente 9 dígitos numéricos"),

  // ✅ Este sí está perfecto como opcional porque el backend lo permite
  moddle_account_id: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }, z.number().int().positive().optional().nullable().or(z.literal(""))),
  
  moodle_user_status: z.enum(["ACTIVE", "SUSPENDED"]),

  is_active: z.boolean(),

  profession: z.string().optional(),
  linkedin_account_url: z.string().url("Ingresa una URL de LinkedIn válida").or(z.literal("")).optional(),
  curriculum_vitae: z.string().url("Ingresa una URL de CV válida").or(z.literal("")).optional()
});

export type ProfessorFormValues = z.infer<typeof professorFormSchema>;

export const defaultProfessorFormValues: Partial<ProfessorFormValues> = {
  name: "",
  lastname: "", 
  email: "",
  corporate_email: "",
  cellphone: "",
  moddle_account_id: undefined,
  moodle_user_status: "ACTIVE" as any,
  is_active: true,
  profession: "",
  linkedin_account_url: "",
  curriculum_vitae: ""
};