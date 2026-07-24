import { useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Share2 } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import { translateEnum, CampaignStatusMap, CampaignPlatformMap } from "@/core/utils/dictionaries";
import { displayFriendlyDate } from "@/core/utils/date-utils";
import { MetaSyncAction } from "./MetaSyncAction";

interface CampaignDetailHeaderProps {
  campaign: any;
  onConfigClick: () => void;
  onPublishReportClick?: () => void;
  canRequestMetaSync: boolean;
}

export const CampaignDetailHeader = ({
  campaign,
  onConfigClick,
  onPublishReportClick,
  canRequestMetaSync,
}: CampaignDetailHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin/campanas")}
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
            {/* Tipo de Distribución */}
            <Badge
              variant="outline"
              className={
                campaign.is_organic
                  ? "bg-sky-50 text-sky-700 border-sky-200 rounded-lg font-bold"
                  : "bg-purple-50 text-purple-700 border-purple-200 rounded-lg font-bold"
              }
            >
              {campaign.is_organic ? "Orgánica" : "Paga"}
            </Badge>

            <span>•</span>

            {/* Plataforma */}
            <span className="font-semibold text-slate-700">
              {translateEnum(campaign.platform, CampaignPlatformMap)}
            </span>

            <span>•</span>

            {/* Fechas de Gestión */}
            <span>
              Inicio: {displayFriendlyDate(campaign.start_date)}
            </span>
            <span>•</span>
            <span>
              Creada: {displayFriendlyDate(campaign.created_at)}
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-start justify-end gap-2 self-end sm:self-auto">
        {canRequestMetaSync && <MetaSyncAction campaign={campaign} />}
        <Button
          variant="outline"
          className="rounded-xl font-bold bg-white border-slate-200 text-slate-700 shadow-sm"
          onClick={onConfigClick}
        >
          <Pencil size={16} className="mr-1.5" /> Editar Campaña
        </Button>
        <Button
          className="rounded-xl font-bold bg-slate-950 text-white shadow-md hover:bg-slate-900"
          onClick={onPublishReportClick}
        >
          <Share2 size={16} className="mr-1.5" /> Publicar Reporte
        </Button>
      </div>
    </div>
  );
};
