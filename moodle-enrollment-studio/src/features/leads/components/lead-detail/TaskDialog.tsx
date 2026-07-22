import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/core/components/ui/alert";
import { Button } from "@/core/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/core/components/ui/dialog";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { Textarea } from "@/core/components/ui/textarea";
import { taskDateInput } from "../../adapters/leadDetailAdapter";
import { taskFormSchema, type TaskFormData } from "../../schemas/leadDetailActionSchemas";
import type { LeadTask } from "./leadDetail.types";

interface Props { open: boolean; onOpenChange: (open: boolean) => void; task?: LeadTask | null; isPending: boolean; error?: string; onSubmit: (data: TaskFormData, done: () => void) => void }

export function TaskDialog({ open, onOpenChange, task, isPending, error, onSubmit }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [validation, setValidation] = useState("");
  useEffect(() => { if (open) { setTitle(task?.title || ""); setContent(task?.content || ""); setDueDate(taskDateInput(task?.due_date)); setValidation(""); } }, [open, task]);
  const submit = () => {
    const parsed = taskFormSchema.safeParse({ title, content, due_date: dueDate });
    if (!parsed.success) { setValidation(parsed.error.issues[0]?.message || "Revisa los datos."); return; }
    onSubmit(parsed.data, () => onOpenChange(false));
  };
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[95vh] w-[calc(100%-2rem)] overflow-y-auto sm:max-w-lg"><DialogHeader><DialogTitle>{task ? "Editar tarea" : "Nueva tarea"}</DialogTitle><DialogDescription>{task ? "Actualiza únicamente los datos necesarios." : "Crea un pendiente para la campaña seleccionada."}</DialogDescription></DialogHeader><div className="space-y-4 py-2"><div className="space-y-2"><Label htmlFor="task-title">Título *</Label><Input id="task-title" value={title} onChange={(event) => setTitle(event.target.value)} /></div><div className="space-y-2"><Label htmlFor="task-content">Contenido *</Label><Textarea id="task-content" rows={5} value={content} onChange={(event) => setContent(event.target.value)} /></div><div className="space-y-2"><Label htmlFor="task-due-date">Fecha límite</Label><Input id="task-due-date" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></div>{(validation || error) && <Alert variant="destructive"><AlertDescription>{validation || error}</AlertDescription></Alert>}</div><DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancelar</Button><Button onClick={submit} disabled={isPending}>{isPending && <Loader2 className="h-4 w-4 animate-spin" />}{isPending ? "Guardando…" : task ? "Guardar cambios" : "Crear tarea"}</Button></DialogFooter></DialogContent></Dialog>;
}
