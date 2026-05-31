import { z } from "zod";
import { BaseCreateProfessorSchema } from "shared"; 

const spanishErrorMap: z.ZodErrorMap = (issue, ctx) => {
  const defaultMsg = ctx?.defaultError || "Campo inválido";

  if (issue.code === z.ZodIssueCode.invalid_type) {
    if (issue.received === "undefined" || issue.received === "null") {
      return { message: "Este campo es obligatorio" };
    }
  }

  if (issue.code === z.ZodIssueCode.too_small) {
    if (issue.minimum === 1) return { message: "Este campo es obligatorio" };
    return { message: `El campo debe tener al menos ${issue.minimum} caracteres` };
  }

  if (
    (issue.code === z.ZodIssueCode.invalid_string && issue.validation === "email") ||
    (issue.code === z.ZodIssueCode.invalid_format && (issue as any).format === "email")
  ) {
    return { message: "Por favor, ingresa un correo electrónico válido" };
  }

  if (issue.code === z.ZodIssueCode.invalid_string && issue.validation === "regex") {
    return { message: "El celular debe tener exactamente 9 dígitos numéricos" };
  }

  return { message: defaultMsg };
};

z.setErrorMap(spanishErrorMap);

export const professorFormSchema = BaseCreateProfessorSchema.extend({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastname: z.string().min(2, "El apellido debe tener al menos 2 caracteres"), 

  corporate_email: z.preprocess(
    (val) => (val === "" ? undefined : val), 
    z.string().email().optional()
  ),
  cellphone: z.preprocess(
    (val) => (val === "" ? undefined : val), 
    z.string().regex(/^\d{9}$/).optional()
  ),
  moddle_account_id: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)), 
    z.number().int().positive().optional()
  ),
  moodle_user_status: z.enum(["ACTIVE", "SUSPENDED"], { required_error: "El estado de la cuenta es obligatorio" }).default("ACTIVE")
}) as any;

export type ProfessorFormValues = z.infer<typeof professorFormSchema>;

export const defaultProfessorFormValues: Partial<ProfessorFormValues> = {
  name: "",
  lastname: "", 
  email: "",
  corporate_email: "",
  cellphone: "",
  moddle_account_id: undefined,
  moodle_user_status: "ACTIVE" as any
};