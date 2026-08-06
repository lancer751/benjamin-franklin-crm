import { ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/core/components/ui/alert";
import { Button } from "@/core/components/ui/button";
import { Form } from "@/core/components/ui/form";
import { useLeadCreationFlow } from "../../hooks/useLeadCreationFlow";
import { LeadAdditionalFields } from "./LeadAdditionalFields";
import { LeadCommercialFields } from "./LeadCommercialFields";
import { LeadFormActions } from "./LeadFormActions";
import { LeadLookupStatus } from "./LeadLookupStatus";
import { LeadPrimaryFields } from "./LeadPrimaryFields";

export function LeadQuickForm() {
  const controller = useLeadCreationFlow();

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50/50 pb-24">
      <div className="mx-auto max-w-6xl space-y-5 px-4 py-5 sm:px-6 lg:px-8">
        {/* Encabezado compacto CRM */}
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
              onClick={controller.cancel}
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              {controller.isContextualMode ? "Volver" : "Volver a prospectos"}
            </Button>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-950">Nuevo prospecto</h1>
              <p className="text-sm text-slate-500">
                {controller.isContextualMode
                  ? `Registra un prospecto para la campaña ${controller.contextualCampaignName}.`
                  : "Registra los datos del prospecto, asignación comercial e interacción inicial."}
              </p>
            </div>
          </div>
        </header>

        <Form {...controller.form}>
          <form onSubmit={controller.onSubmit} className="space-y-5" noValidate>
            {/* Bloque principal unificado (Datos principales + Lookup + Campaña y asignación + Interacción) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 space-y-4">
              <LeadPrimaryFields />
              <LeadLookupStatus controller={controller} />
              <div className="border-t border-slate-100 pt-4">
                <LeadCommercialFields controller={controller} />
              </div>
            </div>

            {/* Información adicional (Colapsada por defecto: ▼ Información adicional (Opcional)) */}
            <LeadAdditionalFields />

            {controller.flowError && (
              <Alert variant="destructive" role="alert" className="py-2.5 text-xs">
                <AlertDescription>{controller.flowError}</AlertDescription>
              </Alert>
            )}

            {/* Footer Sticky Fijo en pantalla */}
            <LeadFormActions
              cancel={controller.cancel}
              disabled={!controller.canSubmit}
              isPending={controller.isRegistering}
              label={controller.actionLabel}
              pendingLabel={controller.pendingLabel}
            />
          </form>
        </Form>
      </div>
    </div>
  );
}
