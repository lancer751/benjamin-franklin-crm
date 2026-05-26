import { z } from "zod";
import { createLeadSchema } from "shared";

// 🚀 TRUCO DE EXPERTO (MONKEY PATCH):
// Como no podemos tocar el archivo de nuestro compañero y tiene un bug con 'z.uuid()',
// le enseñamos a Zod en nuestro frontend qué hacer si alguien invoca esa función por error.
if (typeof (z as any).uuid !== "function") {
  (z as any).uuid = function () {
    return this.string().uuid();
  };
}

// 1. Zod Native ErrorMap adaptado estrictamente a las firmas de Zod v4
const spanishErrorMap = (issue: z.ZodIssue, ctx: { defaultError: string; data: any }) => {
  if (issue.code === z.ZodIssueCode.invalid_type) {
    if (issue.received === "undefined" || issue.received === "null") {
      return { message: "Este campo es obligatorio" };
    }
  }

  if (issue.code === z.ZodIssueCode.too_small) {
    if (issue.type === "string") {
      if (issue.minimum === 1) {
        return { message: "Este campo es obligatorio" };
      }
      return { message: `El campo debe tener al menos ${issue.minimum} caracteres` };
    }
  }

  // En v4 validamos el formato del string de manera segura
  if (issue.code === z.ZodIssueCode.invalid_string && (issue as any).validation === "email") {
    return { message: "Ingresa un correo electrónico válido" };
  }

  if (issue.path.includes("dni")) {
    if (
      issue.code === z.ZodIssueCode.too_small ||
      issue.code === z.ZodIssueCode.too_big ||
      issue.code === z.ZodIssueCode.invalid_string ||
      issue.code === z.ZodIssueCode.custom
    ) {
      return { message: "El DNI debe contener exactamente 8 números" };
    }
  }

  return { message: ctx.defaultError };
};

// Registrar el ErrorMap seguro
z.setErrorMap(spanishErrorMap as any);

// 2. Extensión del esquema de tu compañero
export const leadFormSchema = createLeadSchema.extend({
  dni: z.preprocess((val) => (val === "" ? null : val), z.string().length(8).nullable().optional() as any),
  secondary_email: z.preprocess((val) => (val === "" ? null : val), z.string().email().nullable().optional() as any),
  address: z.preprocess((val) => (val === "" ? null : val), z.string().min(10).nullable().optional() as any),
  second_address: z.preprocess((val) => (val === "" ? null : val), z.string().min(10).nullable().optional() as any),
  profession: z.preprocess((val) => (val === "" ? null : val), z.string().nullable().optional() as any),
  primary_campaign_id: z.preprocess((val) => (val === "" || val === "none" ? undefined : val), z.string().uuid().optional() as any),

  // Creamos el campo para el input de la UI
  cellphone: z.string().min(9, "El teléfono debe tener al menos 9 dígitos"),

  source: z.string().default("MANUAL"),
  interaction_notes: z.string().optional().or(z.literal("")),
}) as any; // Casteo de seguridad para evitar diferencias estrictas entre workspaces de node_modules

export type LeadFormValues = z.infer<typeof leadFormSchema>;

export const defaultLeadFormValues: Partial<LeadFormValues> = {
  first_name: "",
  middle_name: "",
  last_name: "",
  dni: "",
  gender: "NOT_SPECIFIED" as any,
  email: "",
  secondary_email: "",
  cellphone: "", 
  address: "",
  second_address: "",
  profession: "",
  primary_campaign_id: "",
  lead_status: "ACTIVE" as any,
  source: "MANUAL",
  interaction_notes: "",
};