import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle, ArrowLeft, Loader2, Megaphone } from "lucide-react";
import CampaignForm from "@/features/campaigns/components/CampaignForm";
import { useCampaignDetail } from "@/features/campaigns/hooks/useCampaignDetail";
import { Button } from "@/core/components/ui/button";

const CampaignEditView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { campaign, isLoading, isError } = useCampaignDetail(id);
  const goBack = () => navigate(id ? `/admin/campanas/${id}` : "/admin/campanas");

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-primary" />
          <p className="text-sm">Cargando campaña...</p>
        </div>
      </div>
    );
  }

  if (isError || !campaign) {
    return (
      <div className="mx-auto flex min-h-[420px] max-w-xl flex-col items-center justify-center text-center">
        <AlertCircle className="mb-3 h-10 w-10 text-destructive" />
        <h1 className="text-lg font-bold">No se pudo cargar la campaña</h1>
        <p className="mt-1 text-sm text-muted-foreground">Vuelve al listado e inténtalo nuevamente.</p>
        <Button variant="outline" onClick={() => navigate("/admin/campanas")} className="mt-5">Volver a campañas</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 pb-10">
      <header className="space-y-4">
        <Button variant="ghost" onClick={goBack} className="-ml-3 w-fit text-muted-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
        <div className="flex min-w-0 items-start gap-3">
          <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Editar campaña</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Actualiza la configuración de {campaign.name || campaign.campaing_name || "la campaña"}.
            </p>
          </div>
        </div>
      </header>

      <CampaignForm initialData={campaign} onCancel={goBack} onSuccess={goBack} />
    </div>
  );
};

export default CampaignEditView;
