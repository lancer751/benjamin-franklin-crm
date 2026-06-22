import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import { translateEnum, CampaignStatusMap, CampaignPlatformMap } from "@/core/utils/dictionaries";

interface CampaignDetailHeaderProps {
  campaign: any;
  onAssignSellerClick: () => void;
  onConfigClick: () => void;
  onDeleteClick: () => void;
  isDeleting: boolean;
}

export const CampaignDetailHeader = ({
  campaign,
  onAssignSellerClick,
  onConfigClick,
  onDeleteClick,
  isDeleting,
}: CampaignDetailHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/campanas")}
          className="mt-1"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* CORREGIDO: Usar campaign.name en lugar de campaign.campaing_name */}
            <h1 className="text-2xl font-bold text-foreground">{campaign.name}</h1>
            <Badge
              className={
                campaign.status === "ACTIVE"
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                  : campaign.status === "PAUSED"
                  ? "bg-amber-100 text-amber-700 border-amber-200"
                  : "bg-muted text-muted-foreground"
              }
            >
              {translateEnum(campaign.status, CampaignStatusMap)}
            </Badge>
          </div>
          {/* Metadatos detallados */}
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
            <span className="font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md">
              UUID: {campaign.id}
            </span>
            {campaign.meta_form_id && (
              <span className="font-mono bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900 px-2 py-0.5 rounded-md flex items-center gap-1">
                Meta Form ID: {campaign.meta_form_id}
              </span>
            )}
            <span>•</span>
            <span>Plataforma: {translateEnum(campaign.platform, CampaignPlatformMap)}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <Button variant="outline" size="sm" onClick={onAssignSellerClick}>
          <UserPlus size={16} className="mr-1.5" /> Asignar Vendedor
        </Button>
        <Button variant="outline" size="sm" onClick={onConfigClick}>
          <Edit size={16} className="mr-1.5" /> Configurar Campaña
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={onDeleteClick}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 size={16} className="mr-1.5 animate-spin" />
          ) : (
            <Trash2 size={16} className="mr-1.5" />
          )}
          Eliminar
        </Button>
      </div>
    </div>
  );
};
