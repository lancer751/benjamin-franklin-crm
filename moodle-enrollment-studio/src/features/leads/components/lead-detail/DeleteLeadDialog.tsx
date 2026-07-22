import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/core/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/core/components/ui/alert-dialog";

interface Props { open: boolean; onOpenChange: (open: boolean) => void; isPending: boolean; error?: string; onConfirm: () => void }

export function DeleteLeadDialog({ open, onOpenChange, isPending, error, onConfirm }: Props) {
  return <AlertDialog open={open} onOpenChange={onOpenChange}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Eliminar prospecto</AlertDialogTitle><AlertDialogDescription>Esta acción retirará al prospecto de las vistas activas. Podrá restaurarse posteriormente si el sistema lo permite.</AlertDialogDescription></AlertDialogHeader>{error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}<AlertDialogFooter><AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isPending} onClick={(event) => { event.preventDefault(); onConfirm(); }}>{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{isPending ? "Eliminando…" : "Eliminar prospecto"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>;
}
