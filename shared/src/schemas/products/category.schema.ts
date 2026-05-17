import z from "zod";
import { UUIDField } from "../helpers";

export const CategorySchema = z.object({
  id: UUIDField,
  name: z.string().min(2, "Category name must be at least 2 characters"),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const CreateCategorySchema = CategorySchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const UpdateCategorySchema = CreateCategorySchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided" },
);

export type Category = z.infer<typeof CategorySchema>;
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;