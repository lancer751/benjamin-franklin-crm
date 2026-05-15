import z from "zod";
import { OptionalUrl, UUIDField } from "../../../helpers";
import { ModalitySchema } from "../../../course.schema";
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

/** Assign professors payload accepted on create/update */
export const AssignProfessorsOnEditionSchema = z.object({
  professor_id: UUIDField,
});

export const EditionSchema = z
  .object({
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
    // Char(13) in DB  — e.g. "LP-001-25-01"
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
  })
  .refine(({ end_date, start_date }) => end_date > start_date, {
    message: "end_date must be after start_date",
    path: ["end_date"],
  })
  .refine(
    ({ modality, meet_link }) => {
      // Async/presencial-only editions don't need a meet link
      if (modality === "ASINCRONICO" || modality === "PRESENCIAL") return true;
      return !!meet_link;
    },
    {
      message: "meet_link is required for VIRTUAL and HIBRIDO modalities",
      path: ["meet_link"],
    },
  );

export const CreateEditionSchema = EditionSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const UpdateEditionSchema = CreateEditionSchema.partial().refine(
  (obj) => Object.keys(obj).length > 0,
  "At least one field must be provided",
);
