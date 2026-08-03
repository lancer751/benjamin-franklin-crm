import * as z from "zod";

export const editionFormSchema = z.object({
  course_id: z.string().min(1, "Debes seleccionar un curso base"),
  // 🧠 Exigimos explícitamente un número del 1 al 9 para mantener el dígito único
  edition_number: z.coerce.number({
    message: "Ingresa un número",
  }).int().min(1, "Debe ser al menos 1").max(9, "Solo se permite 1 dígito (1-9)"),
  edition_code: z.string().min(1, "El código es requerido").max(16, "Máximo 16 caracteres"),
  start_date: z.date({ message: "La fecha de inicio es obligatoria" }),
  end_date: z.date({ message: "La fecha de fin es obligatoria" }),
  modality: z.enum(["PRESENCIAL", "VIRTUAL", "HIBRIDO", "ASINCRONICO"], { message: "Debes seleccionar una modalidad" }),
  meet_link: z.string()
    .url("Debe ser una URL válida (ej: https://meet.google.com/...)")
    .optional()
    .or(z.literal("")),
  edition_status: z.enum(["IN_PROGRESS", "COMPLETED", "OPEN", "SCHEDULED", "DRAFT", "CANCELLED"]).default("SCHEDULED"),
  
  hours_amount: z.coerce.number({
    message: "Ingresa un número válido",
  }).min(1, "Debe ser al menos 1"),
  classes_number: z.coerce.number({
    message: "Ingresa un número válido",
  }).min(1, "Debe ser al menos 1"),
  duration_value: z.coerce.number({
    message: "Ingresa un número válido",
  }).min(1, "Debe ser al menos 1"),
  duration_unit: z.enum(["WEEKS", "MONTHS"]).default("WEEKS"),
  whatsapp_group_link: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  moodle_course_id: z.coerce.number().optional().nullable(),
  assigned_professors: z.array(z.object({
    professor_id: z.string().uuid("Selecciona un profesor")
  })).min(1, "Selecciona un profesor"),
  schedules: z.array(z.object({
    day: z.string(),
    slots: z.array(z.object({
      start_time: z.string(),
      end_time: z.string()
    }))
  }))
}).refine((data) => {
  if (data.modality === "VIRTUAL" || data.modality === "HIBRIDO") {
    return !!data.meet_link && data.meet_link.trim() !== "";
  }
  return true;
}, {
  message: "El enlace de Google Meet es obligatorio para las modalidades VIRTUAL e HÍBRIDO",
  path: ["meet_link"]
});

export type EditionFormValues = z.infer<typeof editionFormSchema>;

export const defaultEditionFormValues: Partial<EditionFormValues> = {
  edition_number: "" as unknown as number,
  edition_code: "",
  start_date: undefined,
  end_date: undefined,
  modality: undefined,
  meet_link: "",
  edition_status: "SCHEDULED",
  hours_amount: "" as unknown as number,
  classes_number: "" as unknown as number,
  duration_value: "" as unknown as number,
  duration_unit: "WEEKS",
  whatsapp_group_link: "",
  moodle_course_id: "" as unknown as number,
  assigned_professors: [],
  schedules: [],
};