import { z } from "zod";
import { CreateLeadSchema } from "shared";

// 1. Mapeo nativo de errores en español compatible con React Hook Form
const spanishErrorMap: z.ZodErrorMap = (issue, ctx) => {
  const defaultMsg = ctx?.defaultError || "Campo inválido";

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

  if (issue.code === z.ZodIssueCode.invalid_string && issue.validation === "email") {
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

  return { message: defaultMsg };
};

z.setErrorMap(spanishErrorMap as any);

// 2. Extensión limpia del esquema para Frontend (Modo Creación y Edición)
export const leadFormSchema = CreateLeadSchema.extend({
  // Sobreescritura de campos obligatorios en español
  first_name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  middle_name: z.string().min(3, "El apellido paterno debe tener al menos 3 caracteres"),
  last_name: z.string().min(3, "El apellido materno debe tener al menos 3 caracteres"),
  email: z.string().email("Ingresa un correo electrónico válido"),
  cellphone: z.string().min(9, "El teléfono debe tener al menos 9 dígitos"),

  // Campos opcionales sanitizados
  dni: z.preprocess((val) => (val === "" ? null : val), z.string().length(8, "El DNI debe tener exactamente 8 dígitos").nullable().optional()),
  secondary_email: z.preprocess((val) => (val === "" ? null : val), z.string().email("Correo secundario inválido").nullable().optional()),
  address: z.preprocess((val) => (val === "" ? null : val), z.string().min(10, "La dirección debe tener al menos 10 caracteres").nullable().optional()),
  second_address: z.preprocess((val) => (val === "" ? null : val), z.string().min(10, "La dirección debe tener al menos 10 caracteres").nullable().optional()),
  profession: z.string().optional().nullable().or(z.literal("")),
  
  primary_campaign_id: z.preprocess(
    (val) => (val === "" || val === "none" ? undefined : val),
    z.string().uuid().optional()
  ),
  
  source: z.string().default("MANUAL"),
  interaction_notes: z.string().optional().nullable().or(z.literal("")),
  
  gender: z.preprocess(
    (val) => {
      if (val === "MALE" || val === "FEMALE" || val === "NOT_SPECIFIED") return val;
      return "NOT_SPECIFIED";
    },
    z.enum(["MALE", "FEMALE", "NOT_SPECIFIED"]).default("NOT_SPECIFIED")
  ),

  // Permite que el cliente deje pasar la validación y delega la responsabilidad al submit/backend
  phones: z.array(
    z.object({
      number: z.string(),
      type: z.string()
    })
  ).optional().nullable()
});

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