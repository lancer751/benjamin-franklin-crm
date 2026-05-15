import z from "zod";
import { OptionalUrl, UUIDField } from "../../helpers";

export const CourseTypeSchema = z.enum(["COURSE", "PROGRAM"]);

export const CourseSchema = z.object({
  id: UUIDField,
  type: CourseTypeSchema,
  name: z
    .string()
    .min(8, "Course name must be at least 8 characters long")
    .refine((v) => v.trim().length > 0, "Course name cannot be empty"),
  description: z.string().optional().nullable(),
  classes_number: z.number().int().positive(),
  image_url: OptionalUrl,
  code: z.string().length(7, "Course code must be exactly 7 characters"),
  enrolled_students: z.number().int().nonnegative().default(0),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const CreateCourseSchema = CourseSchema.omit({
  id: true,
  enrolled_students: true,
  created_at: true,
  updated_at: true,
});

export const UpdateCourseSchema = CreateCourseSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided" },
);
