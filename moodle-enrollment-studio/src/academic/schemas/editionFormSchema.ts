import * as z from "zod";

export const editionFormSchema = z.object({
  course_id: z.string().min(1, "Debes seleccionar un curso base"),
  // 🧠 Exigimos explícitamente un número del 1 al 9 para mantener el dígito único
  edition_number: z.coerce.number({
    invalid_type_error: "Ingresa un número",
  }).int().min(1, "Debe ser al menos 1").max(9, "Solo se permite 1 dígito (1-9)"),
  edition_code: z.string().length(13, "El código debe tener exactamente 13 caracteres"),
  start_date: z.date({ required_error: "La fecha de inicio es obligatoria" }),
  end_date: z.date({ required_error: "La fecha de fin es obligatoria" }),
  modality_id: z.string().min(1, "Debes seleccionar una modalidad"),
  teacher_fullname: z.string()
    .regex(/^[\p{L}\s]+$/u, "Solo debe contener letras y espacios")
    .min(2, "El nombre es obligatorio"),
  meet_link: z.string()
    .url("Debe ser una URL válida (ej: https://meet.google.com/...)")
    .optional()
    .or(z.literal("")),
  edition_status: z.enum(["IN_PROGRESS", "COMPLETED", "OPEN", "SCHEDULED", "DRAFT", "CANCELLED"]).default("SCHEDULED"),
  
  hours_amount: z.coerce.number({
    invalid_type_error: "Ingresa un número válido",
    required_error: "Este campo es obligatorio",
  }).min(1, "Debe ser al menos 1"),
  classes_number: z.coerce.number({
    invalid_type_error: "Ingresa un número válido",
    required_error: "Este campo es obligatorio",
  }).min(1, "Debe ser al menos 1"),
  duration_value: z.coerce.number({
    invalid_type_error: "Ingresa un número válido",
    required_error: "Este campo es obligatorio",
  }).min(1, "Debe ser al menos 1"),
  duration_unit: z.enum(["WEEKS", "MONTHS"]).default("WEEKS"),
  whatsapp_group_link: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
});

export type EditionFormValues = z.infer<typeof editionFormSchema>;

export const defaultEditionFormValues: Partial<EditionFormValues> = {
  edition_number: "" as unknown as number,
  edition_code: "",
  start_date: undefined,
  end_date: undefined,
  modality_id: "",
  teacher_fullname: "",
  meet_link: "",
  edition_status: "SCHEDULED",
  hours_amount: "" as unknown as number,
  classes_number: "" as unknown as number,
  duration_value: "" as unknown as number,
  duration_unit: "WEEKS",
  whatsapp_group_link: "",
};