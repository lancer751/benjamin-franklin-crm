import z from "zod";
import { OptionalString, UUIDField } from "../../../helpers";
import { CreateStudyPlanTopicSchema } from "./topic.schema";

export const StudyPlanModuleSchema = z.object({
  id: UUIDField,
  study_plan_id: UUIDField,
  title: z.string().min(3, "Module title must be at least 3 characters"),
  description: OptionalString,
  order: z.number().int().nonnegative(),
  topics: z
    .array(CreateStudyPlanTopicSchema)
    .min(1, "Each module must have at least one topic"),
});

export const CreateStudyPlanModuleSchema = StudyPlanModuleSchema.omit({
  id: true,
  study_plan_id: true,
});

export const UpdateStudyPlanModuleSchema =
  CreateStudyPlanModuleSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field must be provided" },
  );

export type StudyPlanModule = z.infer<typeof StudyPlanModuleSchema>;
export type CreateStudyPlanModuleInput = z.infer<
  typeof CreateStudyPlanModuleSchema
>;
export type UpdateStudyPlanModuleInput = z.infer<
  typeof UpdateStudyPlanModuleSchema
>;