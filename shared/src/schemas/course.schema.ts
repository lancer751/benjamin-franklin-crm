import { z } from "zod";
import { AssignProfessorsOnEditionSchema } from "../types";

// ---- Enums ----
export const CourseTypeSchema = z.enum(["COURSE", "PROGRAM"]);

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

// ---- Course ----
export const CourseBenefitSchema = z.object({
  id: z.uuid().length(36),
  course_id: z.uuid().length(36),
  description: z.string(),
  image_url: z.string().optional().nullable(),
});

export const CourseSchema = z.object({
  id: z.uuid().length(36),
  type: CourseTypeSchema,
  name: z
    .string()
    .min(8, "Course name must be at least 8 characters long")
    .refine((name) => name.trim().length > 0, "Course name cannot be empty"),
  description: z
    .string()
    .max(500, "Course description must be at most 500 characters long")
    .optional()
    .nullable(),
  classes_number: z.number().int().positive(),
  image_url: z.url().optional().nullable(),
  code: z.string().length(7, "Course code must be exactly 7 characters long"),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const CreateCourseSchema = CourseSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const UpdateCourseSchema = CreateCourseSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided" },
);

export const CreateCourseBenefitSchema = CourseBenefitSchema.omit({
  id: true,
  course_id: true,
});

export const UpdateCourseBenefitSchema =
  CreateCourseBenefitSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field must be provided" },
  );

// ---- Edition ----
export type CourseType = z.infer<typeof CourseTypeSchema>;
export type EditionStatus = z.infer<typeof EditionStatusSchema>;
export type DurationUnit = z.infer<typeof DurationUnitSchema>;
export type Modality = z.infer<typeof ModalitySchema>;

export const EditionSchema = z.object({
  id: z.uuid().length(36),
  course_id: z.uuid().length(36),
  edition_number: z.number().int().positive().max(20), //max 2 digits
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  hours_amount: z.number().int().positive(),
  classes_number: z.number().int().positive(),
  duration_value: z.number().int().positive(),
  duration_unit: DurationUnitSchema,
  modality: ModalitySchema,
  moodle_course_id: z.number().int().optional().nullable(),
  assigned_professors: z.array(AssignProfessorsOnEditionSchema).min(1),
  meet_link: z.url("Invalid meet link URL").optional().nullable(),
  whatsapp_group_link: z
    .url("Invalid WhatsApp group URL")
    .optional()
    .nullable(),
  edition_status: EditionStatusSchema,
  edition_code: z
    .string()
    .length(13, "Edition code must be exactly 13 characters"),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const CreateEditionSchema = EditionSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const UpdateEditionSchema = CreateEditionSchema.partial().refine(
  (obj) => Object.keys(obj).length > 0,
  "At least one field must be provided",
);

// ---- Query schemas ----
export const CourseQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  type: CourseTypeSchema.optional(),
  search: z.string().optional(),
});

// ---- Types ----
export type CourseBenefit = z.infer<typeof CourseBenefitSchema>;
export type Course = z.infer<typeof CourseSchema>;
export type CreateCourseInput = z.infer<typeof CreateCourseSchema>;
export type UpdateCourseInput = z.infer<typeof UpdateCourseSchema>;
export type Edition = z.infer<typeof EditionSchema>;
export type CreateEditionInput = z.infer<typeof CreateEditionSchema>;
export type UpdateEditionInput = z.infer<typeof UpdateEditionSchema>;
export type CreateCourseBenefitInput = z.infer<
  typeof CreateCourseBenefitSchema
>;
export type UpdateCourseBenefitInput = z.infer<
  typeof UpdateCourseBenefitSchema
>;
export type CourseQuery = z.infer<typeof CourseQuerySchema>;
