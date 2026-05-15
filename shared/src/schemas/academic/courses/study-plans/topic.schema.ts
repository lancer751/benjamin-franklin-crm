import z from "zod";
import { UUIDField } from "../../../helpers";

export const StudyPlanTopicSchema = z.object({
  id: UUIDField,
  module_id: UUIDField,
  title: z.string().min(3, "Topic title must be at least 3 characters"),
  order: z.number().int().nonnegative(),
});

export const CreateStudyPlanTopicSchema = StudyPlanTopicSchema.omit({
  id: true,
  module_id: true,
});

export const UpdateStudyPlanTopicSchema =
  CreateStudyPlanTopicSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field must be provided" },
  );

export type StudyPlanTopic = z.infer<typeof StudyPlanTopicSchema>;
export type CreateStudyPlanTopicInput = z.infer<
  typeof CreateStudyPlanTopicSchema
>;
export type UpdateStudyPlanTopicInput = z.infer<
  typeof UpdateStudyPlanTopicSchema
>;