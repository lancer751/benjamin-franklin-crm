import { z } from "zod";

export const courseSchema = z.object({
  id: z.uuid().length(36),
  name: z
    .string()
    .min(8, "Course name must be at least 8 characters long")
    .refine((name) => name.trim().length > 0, "Course name cannot be empty"),
  description: z
    .string()
    .max(200, "Course description must be at most 200 characters long")
    .optional(),
  classes_number: z.int().positive(),
  image_url: z.url("Invalid image URL").optional(),
  code: z.string().length(7, "Course code must be exactly 7 characters long"),
});

export const createCourseSchema = courseSchema.omit({ id: true });
export const updateCourseSchema = createCourseSchema.partial();

// ---- Enums ----
export const EditionStatusSchema = z.enum([
  "IN_PROGRESS",
  "COMPLETED",
  "OPEN",
  "SCHEDULED",
  "DRAFT",
  "CANCELLED",
]);

export const DurationUnitSchema = z.enum(["WEEKS", "MONTHS"]);

// ---- Base: mirrors the DB model 1:1 ----

export const EditionSchema = z.object({
  id: z.uuid().length(36),
  course_id: z.uuid().length(36),
  edition_number: z.number().int().positive(),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  hours_amount: z.number().int().positive(),
  classes_number: z.number().int().positive(),
  duration_value: z.number().int().positive(),
  duration_unit: DurationUnitSchema,
  modality_id: z.uuid().length(36),
  moodle_course_id: z.number().int().positive().nullable(),
  teacher_fullname: z
    .string()
    .regex(
      /^[\p{L}\s]+$/u,
      "Teacher fullname must contain only letters and spaces",
    )
    .refine(
      (name) => name.trim().length > 0,
      "Teacher fullname cannot be empty",
    ),
  meet_link: z.string().url("Invalid meet link URL").nullable(), // nullable: PACKED has none
  edition_status: EditionStatusSchema,
  edition_code: z
    .string()
    .length(12, "Edition code must be exactly 12 characters"),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const createCourseEditionSchema = EditionSchema.omit({ id: true });
export const updateCourseEditionSchema = createCourseEditionSchema
  .partial()
  .refine(
    (obj) => Object.keys(obj).length > 0,
    "At least one field must be provided",
  );

// modality schema
export const modalitySchema = z.object({
  id: z.uuid().length(36),
  name: z.string().nonempty("Modality name cannot be empty"),
});

export const createModalitySchema = modalitySchema.omit({ id: true });
