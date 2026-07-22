import { Loader2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/core/components/ui/alert-dialog";
import type { LeadTask } from "./leadDetail.types";

interface Props { task: LeadTask | null; onOpenChange: (open: boolean) => void; isPending: boolean; onConfirm: (done: () => void) => void }

export function DeleteTaskDialog({ task, onOpenChange, isPending, onConfirm }: Props) {
  return <AlertDialog open={Boolean(task)} onOpenChange={onOpenChange}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Eliminar tarea</AlertDialogTitle><AlertDialogDescription>La tarea “{task?.title || "Sin título"}” se eliminará de esta campaña. Esta acción no se puede deshacer.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isPending} onClick={(event) => { event.preventDefault(); onConfirm(() => onOpenChange(false)); }}>{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{isPending ? "Eliminando…" : "Eliminar tarea"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>;
}
