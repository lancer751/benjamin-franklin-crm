import { useNavigate } from "react-router-dom";
import { ArrowLeft, Megaphone } from "lucide-react";
import CampaignForm from "@/features/campaigns/components/CampaignForm";
import { Button } from "@/core/components/ui/button";

const CampaignCreateView = () => {
  const navigate = useNavigate();
  const goToList = () => navigate("/admin/campanas");

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 pb-10">
      <header className="space-y-4">
        <Button variant="ghost" onClick={goToList} className="-ml-3 w-fit text-muted-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
        <div className="flex min-w-0 items-start gap-3">
          <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Crear nueva campaña</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Configura la campaña, asigna responsables y vincula los canales de captación.
            </p>
          </div>
        </div>
      </header>

      <CampaignForm onCancel={goToList} onSuccess={goToList} />
    </div>
  );
};

export default CampaignCreateView;
