import { z } from "zod";
import { manualLeadSchema, normalizeLeadEmail, normalizeLeadPhone } from "./manualLeadSchema";

const PERSON_NAME_PATTERN = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;
const PERSON_NAME_LETTER_PATTERN = /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const optionalName = z.string().transform((value) => value.trim()).refine(
  (value) => value === "" || (
    value.length >= 2
    && value.length <= 80
    && PERSON_NAME_PATTERN.test(value)
    && PERSON_NAME_LETTER_PATTERN.test(value)
  ),
  "Ingresa un valor válido de al menos 2 caracteres.",
).transform((value) => value || undefined);

const optionalEmail = z.string().transform(normalizeLeadEmail).refine(
  (value) => value === "" || EMAIL_PATTERN.test(value),
  "Ingresa un correo electrónico válido.",
).transform((value) => value || undefined);

const optionalText = z.string().transform((value) => value.trim()).transform((value) => value || undefined);

const additionalPhoneSchema = z.object({
  id: z.string().uuid().optional(),
  number: z.string().transform(normalizeLeadPhone).refine(
    (value) => /^9\d{8}$/.test(value),
    "Ingresa un celular válido de 9 dígitos que empiece con 9.",
  ),
  type: z.enum(["WHATSAPP", "TELEPHONE"]),
});

export const leadFieldsSchema = manualLeadSchema.extend({
  principalPhoneId: z.string().uuid().optional(),
  principalPhoneType: z.enum(["WHATSAPP", "TELEPHONE"]),
  middle_name: optionalName,
  dni: z.string().transform((value) => value.replace(/\D/g, "")).refine(
    (value) => value === "" || /^\d{8}$/.test(value),
    "Ingresa un DNI válido de 8 dígitos.",
  ).transform((value) => value || undefined),
  gender: z.enum(["MALE", "FEMALE", "NOT_SPECIFIED"]),
  profession: optionalText,
  secondary_email: optionalEmail,
  address: optionalText,
  additionalPhones: z.array(additionalPhoneSchema),
  lead_status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type LeadFieldsInput = z.input<typeof leadFieldsSchema>;
export type LeadFieldsData = z.output<typeof leadFieldsSchema>;

export const defaultLeadFieldValues: LeadFieldsInput = {
  cellphone: "",
  principalPhoneId: undefined,
  principalPhoneType: "WHATSAPP",
  first_name: "",
  middle_name: "",
  last_name: "",
  email: "",
  dni: "",
  gender: "NOT_SPECIFIED",
  profession: "",
  secondary_email: "",
  address: "",
  additionalPhones: [],
  lead_status: "ACTIVE",
};
