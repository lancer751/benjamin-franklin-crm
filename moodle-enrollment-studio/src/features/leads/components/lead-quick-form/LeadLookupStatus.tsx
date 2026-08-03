import { AlertCircle, CheckCircle2, Loader2, SearchCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/core/components/ui/alert";
import type { LeadCreationController } from "../../hooks/useLeadCreationFlow";

export function LeadLookupStatus({ controller }: { controller: LeadCreationController }) {
  if (controller.isSearching) {
    return <p className="flex items-center gap-2 text-sm text-muted-foreground" role="status"><Loader2 className="h-4 w-4 animate-spin" />Buscando prospecto…</p>;
  }
  if (controller.hasIdentityConflict) {
    return <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Conflicto de identidad</AlertTitle><AlertDescription>El celular y el correo pertenecen a prospectos diferentes. Verifica los datos.</AlertDescription></Alert>;
  }
  if (controller.isLookupError) {
    return <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>No fue posible comprobar si el prospecto ya existe.</AlertDescription></Alert>;
  }
  if (!controller.lookup || !controller.hasLookupCriteria) return null;
  if (!controller.existingLead) {
    return <p className="flex items-center gap-2 text-sm text-muted-foreground" role="status"><SearchCheck className="h-4 w-4" />No encontramos un prospecto registrado con estos datos.</p>;
  }

  const lead = controller.existingLead;
  const name = [lead.first_name, lead.last_name].filter(Boolean).join(" ") || "Prospecto sin nombre";
  return (
    <Alert className="border-emerald-200 bg-emerald-50/60 text-emerald-950">
      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
      <AlertTitle>Prospecto existente</AlertTitle>
      <AlertDescription className="space-y-1">
        <p className="font-medium">{name}</p>
        <p>{lead.phones?.[0]?.number}{lead.email ? ` · ${lead.email}` : ""}</p>
        <p>{controller.existingMemberId ? "Este prospecto ya está registrado en esta campaña." : "Se reutilizará su registro y se asociará a la campaña seleccionada."}</p>
      </AlertDescription>
    </Alert>
  );
}
