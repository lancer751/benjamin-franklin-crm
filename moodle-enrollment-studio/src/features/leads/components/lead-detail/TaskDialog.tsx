import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/core/components/ui/alert";
import { Button } from "@/core/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/core/components/ui/dialog";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { Textarea } from "@/core/components/ui/textarea";
import { taskDateInput } from "../../adapters/leadDetailAdapter";
import { taskFormSchema, type TaskFormInput, type TaskFormValues } from "../../schemas/taskFormSchema";
import type { LeadTaskViewModel } from "./leadDetail.types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: LeadTaskViewModel | null;
  isPending: boolean;
  error?: string;
  onSubmit: (data: TaskFormValues, done: () => void) => void;
}

const emptyValues: TaskFormValues = { title: "", content: "", due_date: "", is_done: false };

export function TaskDialog({ open, onOpenChange, task, isPending, error, onSubmit }: Props) {
  const form = useForm<TaskFormInput, unknown, TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: emptyValues,
    mode: "onTouched",
  });
  const title = form.watch("title") || "";
  const content = form.watch("content") || "";

  useEffect(() => {
    if (!open) return;
    form.reset({
      title: task?.title || "",
      content: task?.content || "",
      due_date: taskDateInput(task?.dueDate),
      is_done: task?.isDone ?? false,
    });
  }, [form, open, task]);

  const submit = form.handleSubmit((values) => {
    onSubmit(values, () => {
      form.reset(emptyValues);
      onOpenChange(false);
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] w-[calc(100%-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? "Editar tarea" : "Nueva tarea"}</DialogTitle>
          <DialogDescription>{task ? "Actualiza los datos de la tarea." : "Crea un pendiente para la campaña seleccionada."}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4 py-2" noValidate>
          <div className="space-y-2">
            <Label htmlFor="task-title">Título *</Label>
            <Input
              id="task-title"
              maxLength={100}
              aria-invalid={Boolean(form.formState.errors.title)}
              aria-describedby={form.formState.errors.title ? "task-title-error task-title-count" : "task-title-count"}
              disabled={isPending}
              {...form.register("title")}
            />
            <div className="flex items-start justify-between gap-3">
              {form.formState.errors.title
                ? <p id="task-title-error" role="alert" className="text-xs text-destructive">{form.formState.errors.title.message}</p>
                : <span />}
              <p id="task-title-count" className="shrink-0 text-xs text-muted-foreground">{title.length}/100 caracteres</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-content">Contenido *</Label>
            <Textarea
              id="task-content"
              rows={5}
              maxLength={500}
              aria-invalid={Boolean(form.formState.errors.content)}
              aria-describedby={form.formState.errors.content ? "task-content-error task-content-count" : "task-content-count"}
              disabled={isPending}
              {...form.register("content")}
            />
            <div className="flex items-start justify-between gap-3">
              {form.formState.errors.content
                ? <p id="task-content-error" role="alert" className="text-xs text-destructive">{form.formState.errors.content.message}</p>
                : <span />}
              <p id="task-content-count" className="shrink-0 text-xs text-muted-foreground">{content.length}/500 caracteres</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-due-date">Fecha de vencimiento (opcional)</Label>
            <Input
              id="task-due-date"
              type="date"
              aria-invalid={Boolean(form.formState.errors.due_date)}
              aria-describedby={form.formState.errors.due_date ? "task-due-date-help task-due-date-error" : "task-due-date-help"}
              disabled={isPending}
              {...form.register("due_date")}
            />
            <p id="task-due-date-help" className="text-xs text-muted-foreground">Puedes crear la tarea sin una fecha definida.</p>
            {form.formState.errors.due_date && <p id="task-due-date-error" role="alert" className="text-xs text-destructive">{form.formState.errors.due_date.message}</p>}
          </div>
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending ? (task ? "Guardando…" : "Creando…") : task ? "Guardar cambios" : "Crear tarea"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
