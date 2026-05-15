import z from "zod";
import { OptionalUrl, UUIDField } from "../helpers";

export const BenefitSchema = z.object({
  id: UUIDField,
  description: z
    .string()
    .min(4, "Benefit description must be at least 4 characters"),
  image_url: OptionalUrl,
});

export const CreateBenefitSchema = BenefitSchema.omit({ id: true });

export const UpdateBenefitSchema = CreateBenefitSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided" },
);

export type Benefit = z.infer<typeof BenefitSchema>;
export type CreateBenefitInput = z.infer<typeof CreateBenefitSchema>;
export type UpdateBenefitInput = z.infer<typeof UpdateBenefitSchema>;