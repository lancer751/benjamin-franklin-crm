import { z } from "zod";
import { CreateCourseSchema } from "shared";

export const courseFormSchema = CreateCourseSchema.extend({
  name: z.string().min(8, "El nombre del curso debe tener al menos 8 caracteres"),
  classes_number: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number().int().positive("El número de clases debe ser un entero positivo")
  ),
  code: z.string().length(7, "El código debe tener exactamente 7 caracteres").toUpperCase(),
  // REGLA PREMIUM EXIGIDA: Agrega validación para hacer obligatoria la portada en la UI
  image_url: z.string().url("Por favor, sube una imagen de portada válida").min(1, "La portada del curso es obligatoria"),
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;

export const defaultCourseFormValues: Partial<CourseFormValues> = {
  code: "",
  name: "",
  type: "COURSE",
  classes_number: "" as unknown as number,
  description: "",
  image_url: "",
};
