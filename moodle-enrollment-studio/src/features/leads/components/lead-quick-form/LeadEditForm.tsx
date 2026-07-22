import { ArrowLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/core/components/ui/alert";
import { Button } from "@/core/components/ui/button";
import { Card } from "@/core/components/ui/card";
import { Form } from "@/core/components/ui/form";
import { Skeleton } from "@/core/components/ui/skeleton";
import { useLeadEditFlow } from "../../hooks/useLeadEditFlow";
import { LeadAdditionalFields } from "./LeadAdditionalFields";
import { LeadFormActions } from "./LeadFormActions";
import { LeadPrimaryFields } from "./LeadPrimaryFields";

const LeadEditSkeleton = () => (
  <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:py-8">
    <Skeleton className="h-9 w-44" /><div className="space-y-2"><Skeleton className="h-8 w-56" /><Skeleton className="h-5 w-full max-w-xl" /></div>
    <Skeleton className="h-80 w-full rounded-xl" /><Skeleton className="h-14 w-full rounded-lg" />
  </div>
);

export function LeadEditForm({ id }: { id: string }) {
  const controller = useLeadEditFlow(id);
  if (controller.isLoading) return <LeadEditSkeleton />;
  if (controller.isError) return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Card className="space-y-5 p-8 text-center">
        <div><h1 className="text-xl font-semibold">{controller.isNotFound ? "Prospecto no encontrado." : "No fue posible cargar el prospecto"}</h1><p className="mt-2 text-sm text-muted-foreground">{controller.queryMessage}</p></div>
        <div className="flex flex-wrap justify-center gap-2"><Button variant="outline" onClick={controller.back}>Volver</Button><Button onClick={controller.retry}>Reintentar</Button></div>
      </Card>
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:py-8">
      <header className="space-y-3">
        <Button type="button" variant="ghost" className="-ml-3 w-fit" onClick={controller.cancel}><ArrowLeft className="h-4 w-4" />Volver al prospecto</Button>
        <div><h1 className="text-2xl font-bold tracking-tight">Editar prospecto</h1><p className="mt-1 text-sm text-muted-foreground">Actualiza los datos personales y de contacto del prospecto.</p></div>
      </header>
      <Form {...controller.form}>
        <form onSubmit={controller.submit} className="space-y-5" noValidate>
          <fieldset disabled={controller.isPending} className="space-y-5">
            <Card className="space-y-6 p-5 shadow-sm sm:p-6"><LeadPrimaryFields /></Card>
            <LeadAdditionalFields defaultOpen={controller.hasAdditionalData} showLeadStatus />
          </fieldset>
          {controller.mutationMessage && <Alert variant="destructive"><AlertTitle>No se guardaron los cambios</AlertTitle><AlertDescription>{controller.mutationMessage}</AlertDescription></Alert>}
          <LeadFormActions cancel={controller.cancel} disabled={!controller.canSubmit} isPending={controller.isPending} label="Guardar cambios" pendingLabel="Guardando…" />
        </form>
      </Form>
    </div>
  );
}
