import { useNavigate } from "react-router-dom";
import { Form } from "@/core/components/ui/form";
import { Button } from "@/core/components/ui/button";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { useLeadForm } from "../hooks/useLeadForm";
import PersonalInfoCard from "../components/form/PersonalInfoCard";
import ContactCard from "../components/form/ContactCard";
import OriginCard from "../components/form/OriginCard";
import { Alert, AlertDescription } from "@/core/components/ui/alert";

export default function LeadFormView() {
  const navigate = useNavigate();
  const { form, mode, isLoadingLead, isErrorLead, isPending, isLoadingCampaigns, activeCampaigns, onSubmit } = useLeadForm();

  const isEdit = mode === "edit";

  if (isEdit && isLoadingLead) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center flex-col gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Cargando datos del prospecto...</p>
      </div>
    );
  }

  if (isEdit && isErrorLead) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto p-4">
        <Alert variant="destructive">
          <AlertDescription>No se pudo obtener la información del prospecto o ya no existe en el servidor.</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => navigate("/prospectos")} className="rounded-xl">
          <ArrowLeft size={16} className="mr-2" /> Volver a Prospectos
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 max-w-4xl">
      {/* Cabecera Ejecutiva Premium */}
      <div className="pt-2 mb-6 border-b border-slate-200/80 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-xl bg-white border border-slate-200 hover:bg-slate-50 shadow-sm shrink-0"
            onClick={() => navigate("/prospectos")}
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {isEdit ? "Editar Detalles del Prospecto" : "Crear Nuevo Prospecto"}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {isEdit 
                ? "Modifica y actualiza la información comercial y de contacto del lead." 
                : "Registra un nuevo prospecto para iniciar el embudo de inscripción."}
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
          {/* Tarjeta 1: Información Personal */}
          <PersonalInfoCard form={form} />

          {/* Tarjeta 2: Contacto y Ubicación */}
          <ContactCard form={form} />

          {/* Tarjeta 3: Clasificación y Origen */}
          <OriginCard 
            form={form} 
            isLoadingCampaigns={isLoadingCampaigns} 
            activeCampaigns={activeCampaigns} 
          />

          {/* Barra Fija Inferior */}
          <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-950/95 border-t border-border/80 p-4 px-6 md:px-8 flex justify-end items-center gap-3 z-50 shadow-md">
            <div className="max-w-4xl w-full mx-auto flex justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/prospectos")} 
                disabled={isPending}
                className="rounded-xl border-slate-200 hover:bg-slate-50"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isPending}
                className="rounded-xl btn-primary gap-2 shadow-md shadow-primary/20"
              >
                {isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Guardando...
                  </>
                ) : (
                  <>
                    <Save size={16} /> {isEdit ? "Guardar Cambios" : "Crear Prospecto"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
