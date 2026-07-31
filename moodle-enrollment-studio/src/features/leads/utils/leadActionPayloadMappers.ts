import type { InteractionFormValues } from "../schemas/interactionFormSchema";
import type { TaskFormValues } from "../schemas/taskFormSchema";

export const mapInteractionFormToPayload = (values: InteractionFormValues) => ({
  type: values.type,
  notes: values.notes.trim(),
});

export const mapTaskFormToPayload = (values: TaskFormValues) => ({
  title: values.title.trim(),
  content: values.content.trim(),
  is_done: values.is_done,
  due_date: values.due_date
    ? new Date(`${values.due_date}T12:00:00`).toISOString()
    : null,
});
