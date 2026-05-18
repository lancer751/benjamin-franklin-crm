import z from "zod";
import { OptionalString, OptionalUrl, UUIDField } from "../helpers";

export const CertificationSchema = z.object({
  id: UUIDField,
  product_id: UUIDField,
  title: z.string().min(4, "Certification title must be at least 4 characters"),
  description: OptionalString,
  image_url: OptionalUrl,
  has_digital: z.boolean().default(true),
  has_physical: z.boolean().default(true),
  issuing_authority: OptionalString,
  registry_validity: OptionalString,
});

const CreateCertificationSchema = CertificationSchema.omit({
  id: true,
  product_id: true,
});

export const CreateRefinedCertificationSchema =
  CreateCertificationSchema.refine(
    ({ has_digital, has_physical }) => has_digital || has_physical,
    {
      message:
        "At least one delivery format (digital or physical) must be enabled",
      path: ["has_digital"],
    },
  );

export const UpdateCertificationSchema =
  CreateCertificationSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field must be provided" },
  );

export type Certification = z.infer<typeof CertificationSchema>;
export type CreateCertificationInput = z.infer<
  typeof CreateCertificationSchema
>;
export type UpdateCertificationInput = z.infer<
  typeof UpdateCertificationSchema
>;
