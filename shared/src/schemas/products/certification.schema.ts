import z from "zod";
import { OptionalString, OptionalUrl, UUIDField } from "../helpers";

// 🧠 1. Creamos el objeto base puro (Sin .refine()) para que Zod pueda usar .omit() y .partial() libremente
const CertificationBaseObject = z.object({
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

// Esquema completo para lectura (Con el refine aplicado al final)
export const CertificationSchema = CertificationBaseObject;

// 🧠 2. Para la creación, usamos el objeto base puro para hacer el .omit() primero, y LUEGO refinamos
export const CreateCertificationSchema = CertificationBaseObject.omit({
  id: true,
  product_id: true,
}).refine(({ has_digital, has_physical }) => has_digital || has_physical, {
  message: "At least one delivery format (digital or physical) must be enabled",
  path: ["has_digital"],
});

// 🧠 3. Para la actualización, aplicamos .partial() sobre el esquema de creación LIMPIO (antes de que se refine)
// y le encadenamos las reglas de negocio al final
export const UpdateCertificationSchema = CertificationBaseObject.omit({
  id: true,
  product_id: true,
})
  .partial()
  .refine(
    (data) => {
      // Si se envían los formatos, validamos que al menos uno sea verdadero
      if (data.has_digital !== undefined || data.has_physical !== undefined) {
        return (data.has_digital ?? true) || (data.has_physical ?? true);
      }
      return true;
    },
    {
      message: "At least one delivery format (digital or physical) must be enabled",
      path: ["has_digital"],
    }
  )
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field must be provided" }
  );

// ---- Tipos ----
export type Certification = z.infer<typeof CertificationSchema>;
export type CreateCertificationInput = z.infer<typeof CreateCertificationSchema>;
export type UpdateCertificationInput = z.infer<typeof UpdateCertificationSchema>;