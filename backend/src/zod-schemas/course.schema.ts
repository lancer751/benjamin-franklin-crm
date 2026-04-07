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
  image_url: z.url("Invalid image URL").optional(),
  code: z.string().length(7, "Course code must be exactly 7 characters long"),
});

export const createCourseSchema = courseSchema.omit({ id: true });
export const updateCourseSchema = createCourseSchema.partial();

// course edition schemas
const editionStatusEnum = z.enum([
  "IN_PROGRESS",
  "COMPLETED",
  "OPEN",
  "SCHEDULED",
  "DRAFT",
  "CANCELLED",
]);

export const courseEditionSchema = z.object({
  id: z.uuid().length(36),
  course_id: z.uuid().length(36),
  edition_number: z.number().int().positive(),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  modality_id: z.uuid().length(36),
  moodle_course_id: z.number().int().positive().optional(),
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
  meet_link: z.url("Invalid meet link URL"),
  edition_status: editionStatusEnum.optional(),
  edition_code: z
    .string()
    .length(12, "Edition code must be exactly 12 characters long"),
});

export const createCourseEditionSchema = courseEditionSchema.omit({ id: true });
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
