import z from "zod";
import { UUIDField } from "../helpers";

export const FAQSchema = z.object({
  id: UUIDField,
  question: z.string().min(10, "Question must be at least 10 characters"),
  answer: z.string().min(10, "Answer must be at least 10 characters"),
  order: z.number().int().nonnegative().default(0),
});

export const CreateFAQSchema = FAQSchema.omit({ id: true });

export const UpdateFAQSchema = CreateFAQSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided" },
);

export type FAQ = z.infer<typeof FAQSchema>;
export type CreateFAQInput = z.infer<typeof CreateFAQSchema>;
export type UpdateFAQInput = z.infer<typeof UpdateFAQSchema>;