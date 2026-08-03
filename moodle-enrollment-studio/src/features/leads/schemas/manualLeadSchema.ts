import { z } from "zod";

const PERSON_NAME_PATTERN = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;
const PERSON_NAME_LETTER_PATTERN = /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const normalizeLeadPhone = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  return digits.length > 9 ? digits.slice(-9) : digits;
};

export const normalizeLeadEmail = (value: string): string => value.trim().toLowerCase();

export const isValidLeadPhone = (value: string): boolean => /^9\d{8}$/.test(normalizeLeadPhone(value));
export const isValidLeadEmail = (value: string): boolean => EMAIL_PATTERN.test(normalizeLeadEmail(value));

const optionalName = (message: string) => z.string()
  .transform((value) => value.trim())
  .refine(
    (value) => value === "" || (
      value.length >= 2
      && value.length <= 80
      && PERSON_NAME_PATTERN.test(value)
      && PERSON_NAME_LETTER_PATTERN.test(value)
    ),
    message,
  )
  .transform((value) => value || undefined);

const optionalEmail = z.string()
  .transform(normalizeLeadEmail)
  .refine((value) => value === "" || EMAIL_PATTERN.test(value), "Ingresa un correo electrónico válido.")
  .transform((value) => value || undefined);

export const manualLeadSchema = z.object({
  first_name: optionalName("Ingresa un nombre válido de al menos 2 caracteres."),
  last_name: optionalName("Ingresa un apellido válido de al menos 2 caracteres."),
  email: optionalEmail,
  cellphone: z.string()
    .transform(normalizeLeadPhone)
    .refine(
      (value) => /^9\d{8}$/.test(value),
      "Ingresa un celular válido de 9 dígitos que empiece con 9.",
    ),
});

export type ManualLeadFormInput = z.input<typeof manualLeadSchema>;
export type ManualLeadData = z.output<typeof manualLeadSchema>;
