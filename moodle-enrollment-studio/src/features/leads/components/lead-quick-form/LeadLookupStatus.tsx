import { AlertCircle, AlertTriangle, Info, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/core/components/ui/alert";
import { Button } from "@/core/components/ui/button";
import type { LeadCreationController } from "../../hooks/useLeadCreationFlow";

const matchedByLabel = (matchedBy: string | null): string => {
  if (matchedBy === "phone_and_email") return "Coincidencia por celular y correo";
  if (matchedBy === "phone") return "Coincidencia por celular";
  if (matchedBy === "email") return "Coincidencia por correo";
  return "Coincidencia encontrada";
};

export function LeadLookupStatus({ controller }: { controller: LeadCreationController }) {
  const state = controller.leadLookupState;

  if (state.status === "idle") return null;
  if (state.status === "loading") {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
        <Loader2 className="h-4 w-4 animate-spin" />Comprobando prospecto…
      </p>
    );
  }
  if (state.status === "error") {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No se pudo validar el prospecto</AlertTitle>
        <AlertDescription>{state.message} Modifica los datos o vuelve a intentarlo.</AlertDescription>
      </Alert>
    );
  }
  if (state.status === "new") {
    return (
      <Alert className="border-sky-200 bg-sky-50/70 text-sky-950">
        <Info className="h-4 w-4 text-sky-600" />
        <AlertDescription>
          Este prospecto no está registrado. Se creará y se asociará a la campaña seleccionada.
        </AlertDescription>
      </Alert>
    );
  }
  if (state.status === "existing-unassigned") {
    return (
      <Alert className="border-blue-200 bg-blue-50/70 text-blue-950">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle>Prospecto existente</AlertTitle>
        <AlertDescription className="space-y-1">
          <p className="font-medium">{state.leadName} · {matchedByLabel(state.matchedBy)}</p>
          <p>Este prospecto ya está registrado. Al continuar, se asociará a la campaña seleccionada sin duplicar sus datos.</p>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-amber-300 bg-amber-50 text-amber-950">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle>Este prospecto ya pertenece a la campaña seleccionada.</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>{state.leadName} · {matchedByLabel(state.matchedBy)}</p>
        <p>No es necesario volver a registrarlo.</p>
        <Button asChild type="button" variant="outline" size="sm" className="mt-1 bg-white text-sm">
          <Link to={`/prospectos/${state.leadId}`}>Ver prospecto</Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}
