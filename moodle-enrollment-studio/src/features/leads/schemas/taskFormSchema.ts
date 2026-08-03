import { z } from "zod";

const isValidDateInput = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const optionalDateSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || isValidDateInput(value),
    "Ingresa una fecha válida.",
  )
  .optional()
  .default("");

export const taskFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Ingresa un título de al menos 3 caracteres.")
    .max(100, "El título no puede superar los 100 caracteres."),
  content: z
    .string()
    .trim()
    .min(4, "Describe la tarea con al menos 4 caracteres.")
    .max(500, "La descripción no puede superar los 500 caracteres."),
  due_date: optionalDateSchema,
  is_done: z.boolean().default(false),
});

export const updateTaskFormSchema = taskFormSchema;

export type TaskFormInput = z.input<typeof taskFormSchema>;
export type TaskFormValues = z.infer<typeof taskFormSchema>;
