import z from "zod";
import { OptionalUrl, UUIDField } from "../../../helpers";
import { CreateEditionScheduleSchema } from "./schedule.schema";

export const EditionStatusSchema = z.enum([
  "IN_PROGRESS",
  "COMPLETED",
  "OPEN",
  "SCHEDULED",
  "DRAFT",
  "CANCELLED",
]);

export const DurationUnitSchema = z.enum(["WEEKS", "MONTHS"]);

export const ModalitySchema = z.enum([
  "PRESENCIAL",
  "VIRTUAL",
  "HIBRIDO",
  "ASINCRONICO",
]);

export const AssignProfessorsOnEditionSchema = z.object({
  professor_id: UUIDField,
});

// --- EDITION BASE ---
const EditionBaseObject = z.object({
  id: UUIDField,
  course_id: UUIDField,
  edition_number: z
    .number()
    .int()
    .positive()
    .max(99, "Max 2-digit edition number"),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  hours_amount: z.number().int().positive(),
  classes_number: z.number().int().positive(),
  duration_value: z.number().int().positive(),
  duration_unit: DurationUnitSchema,
  modality: ModalitySchema,
  moodle_course_id: z.number().int().positive().optional().nullable(),
  meet_link: OptionalUrl,
  whatsapp_group_link: OptionalUrl,
  edition_status: EditionStatusSchema.default("DRAFT"),
  edition_code: z
    .string()
    .length(13, "Edition code must be exactly 13 characters"),
  assigned_professors: z
    .array(AssignProfessorsOnEditionSchema)
    .min(1, "At least one professor must be assigned"),
  schedules: z
    .array(CreateEditionScheduleSchema)
    .min(1, "At least one schedule must be provided"),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const EditionSchema = EditionBaseObject.refine(
  ({ end_date, start_date }) => end_date > start_date, 
  {
    message: "end_date must be after start_date",
    path: ["end_date"],
  }
).refine(
  ({ modality, meet_link }) => {
    if (modality === "ASINCRONICO" || modality === "PRESENCIAL") return true;
    return !!meet_link;
  },
  {
    message: "meet_link is required for VIRTUAL and HIBRIDO modalities",
    path: ["meet_link"],
  }
);
// 🧠 1. El Create se mantiene usando el objeto base limpio (sin mutar) para que no rompa el .omit()
export const CreateEditionSchema = EditionBaseObject.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// 🛠️ 2. REPARACIÓN DEL ERROR: Hacemos el .partial() sobre el Create limpio (que no tiene refines).
// Luego, le encadenamos los refinamientos al final de la declaración.
export const UpdateEditionSchema = CreateEditionSchema.partial()
  .refine(({ end_date, start_date }) => {
    // Como los campos ahora son opcionales en el update, validamos solo si ambos vienen en el body
    if (end_date && start_date) return end_date > start_date;
    return true;
  }, {
    message: "end_date must be after start_date",
    path: ["end_date"],
  })
  .refine(
    ({ modality, meet_link }) => {
      // Validamos solo si se está enviando la modalidad para actualizar
      if (modality === "ASINCRONICO" || modality === "PRESENCIAL") return true;
      if (modality && (modality === "VIRTUAL" || modality === "HIBRIDO")) return !!meet_link;
      return true;
    },
    {
      message: "meet_link is required for VIRTUAL and HIBRIDO modalities",
      path: ["meet_link"],
    },
  )
  .refine(
    (obj) => Object.keys(obj).length > 0,
    "At least one field must be provided"
  );