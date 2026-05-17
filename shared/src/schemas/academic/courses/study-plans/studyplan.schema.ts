import z from "zod";
import { OptionalString, UUIDField } from "../../../helpers";
import { CreateStudyPlanModuleSchema } from "./module.schema";

export const StudyPlanSchema = z.object({
  id: UUIDField,
  course_id: UUIDField,
  title: z.string().min(4, "Study plan title must be at least 4 characters"),
  description: OptionalString,
  order: z.number().int().nonnegative().default(0),
  modules: z
    .array(CreateStudyPlanModuleSchema)
    .min(1, "A study plan must have at least one module"),
});

export const CreateStudyPlanSchema = StudyPlanSchema.omit({
  id: true,
  // course_id comes from the route param, not the body
  course_id: true,
});

export const UpdateStudyPlanSchema = CreateStudyPlanSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided" },
);

export type StudyPlan = z.infer<typeof StudyPlanSchema>;
export type CreateStudyPlanInput = z.infer<typeof CreateStudyPlanSchema>;
export type UpdateStudyPlanInput = z.infer<typeof UpdateStudyPlanSchema>;