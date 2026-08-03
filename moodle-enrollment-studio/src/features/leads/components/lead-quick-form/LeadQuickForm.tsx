import { ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/core/components/ui/alert";
import { Button } from "@/core/components/ui/button";
import { Card } from "@/core/components/ui/card";
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
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:py-8">
      <header className="space-y-3">
        <Button type="button" variant="ghost" className="-ml-3 w-fit" onClick={controller.cancel}>
          <ArrowLeft className="h-4 w-4" />Volver a prospectos
        </Button>
        <div><h1 className="text-2xl font-bold tracking-tight">Nuevo prospecto</h1><p className="mt-1 text-sm text-muted-foreground">Registra los datos principales, asígnalo a una campaña y deja constancia del primer contacto.</p></div>
      </header>
      <Form {...controller.form}>
        <form onSubmit={controller.submit} className="space-y-5" noValidate>
          <Card className="space-y-6 p-5 shadow-sm sm:p-6">
            <LeadPrimaryFields />
            <LeadLookupStatus controller={controller} />
            <div className="border-t pt-6"><LeadCommercialFields controller={controller} /></div>
          </Card>
          <LeadAdditionalFields />
          {controller.flowError && <Alert variant="destructive" role="alert"><AlertDescription>{controller.flowError}</AlertDescription></Alert>}
          <LeadFormActions cancel={controller.cancel} disabled={!controller.canSubmit} isPending={controller.isPending} label={controller.actionLabel} pendingLabel="Registrando…" />
        </form>
      </Form>
    </div>
  );
}
