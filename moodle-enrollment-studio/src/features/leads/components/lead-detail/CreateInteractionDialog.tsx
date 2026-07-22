import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/core/components/ui/alert";
import { Button } from "@/core/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/core/components/ui/dialog";
import { Label } from "@/core/components/ui/label";
import { Textarea } from "@/core/components/ui/textarea";
import { interactionFormSchema, type InteractionFormData } from "../../schemas/leadDetailActionSchemas";

const types = [["WEBSITE_FORM", "Formulario web"], ["SELL", "Venta"], ["WHATSAPP", "WhatsApp"], ["EMAIL", "Correo"], ["MEETING", "Reunión"], ["CALL", "Llamada"]] as const;

interface Props { open: boolean; onOpenChange: (open: boolean) => void; isPending: boolean; error?: string; onSubmit: (data: InteractionFormData, done: () => void) => void }

export function CreateInteractionDialog({ open, onOpenChange, isPending, error, onSubmit }: Props) {
  const [type, setType] = useState<InteractionFormData["type"]>("CALL");
  const [notes, setNotes] = useState("");
  const [validation, setValidation] = useState("");
  useEffect(() => { if (open) { setType("CALL"); setNotes(""); setValidation(""); } }, [open]);
  const submit = () => {
    const parsed = interactionFormSchema.safeParse({ type, notes });
    if (!parsed.success) { setValidation(parsed.error.issues[0]?.message || "Revisa los datos."); return; }
    onSubmit(parsed.data, () => onOpenChange(false));
  };
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="w-[calc(100%-2rem)] sm:max-w-lg"><DialogHeader><DialogTitle>Nueva interacción</DialogTitle><DialogDescription>Registra la actividad en la campaña seleccionada.</DialogDescription></DialogHeader><div className="space-y-4 py-2"><div className="space-y-2"><Label htmlFor="interaction-type">Tipo *</Label><select id="interaction-type" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={type} onChange={(event) => setType(event.target.value as InteractionFormData["type"])}>{types.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><div className="space-y-2"><Label htmlFor="interaction-notes">Notas *</Label><Textarea id="interaction-notes" rows={5} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Describe el contacto realizado…" /></div>{(validation || error) && <Alert variant="destructive"><AlertDescription>{validation || error}</AlertDescription></Alert>}</div><DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancelar</Button><Button onClick={submit} disabled={isPending}>{isPending && <Loader2 className="h-4 w-4 animate-spin" />}{isPending ? "Registrando…" : "Registrar interacción"}</Button></DialogFooter></DialogContent></Dialog>;
}
