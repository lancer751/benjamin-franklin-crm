import { AlertCircle, CalendarDays, Eye, Loader2, Megaphone, UserCheck, Users } from "lucide-react";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import type { CleanSellerProfile } from "../../adapters/seller.adapter";
import { formatDate, formatPercentage } from "./presentation";

interface Props {
  seller: CleanSellerProfile;
  selectedCampaignId?: string | null;
  onSelectCampaign: (campaignId: string, campaignName: string) => void;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function SellerCampaignsSection({
  seller,
  selectedCampaignId,
  onSelectCampaign,
  isLoading,
  isError,
  onRetry,
}: Props) {
  const statusLabels: Record<string, string> = {
    ACTIVE: "Activa",
    INACTIVE: "Inactiva",
    PAUSED: "Pausada",
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <Megaphone className="h-5 w-5 text-primary" />
            Campañas asignadas
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Selecciona una campaña para inspeccionar sus prospectos asociados.
          </p>
        </div>
        {!isLoading && !isError && (
          <Badge variant="secondary" className="font-bold text-xs">
            {seller.campaigns.length} campaña{seller.campaigns.length === 1 ? "" : "s"}
          </Badge>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 py-10 text-xs text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Cargando campañas asignadas…
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-6 text-center">
          <AlertCircle className="h-5 w-5 text-rose-500" />
          <p className="text-xs text-rose-700">No fue posible cargar las campañas asignadas.</p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm" className="h-8 text-xs">
              Reintentar
            </Button>
          )}
        </div>
      ) : seller.campaigns.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-xs text-slate-500">
          El asesor no tiene campañas asignadas actualmente.
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {seller.campaigns.map((campaign) => {
            const targetId = campaign.campaignId || campaign.id;
            const isSelected = selectedCampaignId === targetId;

            return (
              <div
                key={campaign.id}
                role="button"
                tabIndex={0}
                aria-label={`Ver prospectos de la campaña ${campaign.name}`}
                onClick={() => onSelectCampaign(targetId, campaign.name)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectCampaign(targetId, campaign.name);
                  }
                }}
                className={`group relative flex flex-col justify-between rounded-xl border p-4 transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isSelected
                    ? "border-primary bg-sky-50/80 shadow-md ring-2 ring-primary/30"
                    : "border-slate-200 bg-slate-50/40 hover:border-primary/50 hover:bg-white hover:shadow-md"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2" title={campaign.name}>
                      {campaign.name}
                    </h3>
                    <Badge
                      variant="outline"
                      className={`shrink-0 text-[10px] font-semibold ${
                        campaign.status === "ACTIVE"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-white text-slate-500"
                      }`}
                    >
                      {statusLabels[campaign.status] ?? campaign.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span>Asignación: {formatDate(campaign.assignedAt || campaign.startDate)}</span>
                  </div>

                  {/* Clean 3-column metric stats */}
                  <div className="grid grid-cols-3 gap-2 rounded-lg bg-white p-2.5 border border-slate-100 text-center">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Leads</p>
                      <p className="text-sm font-extrabold text-slate-800">{campaign.assignedLeads}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Matric.</p>
                      <p className="text-sm font-extrabold text-emerald-700">{campaign.totalMatriculated}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Conv.</p>
                      <p className="text-sm font-extrabold text-primary">{formatPercentage(campaign.conversionRate)}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-500">
                    {isSelected ? "Seleccionada actualmente" : "Haz clic para cargar prospectos"}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    className="h-7 text-xs gap-1 font-semibold"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCampaign(targetId, campaign.name);
                    }}
                  >
                    {isSelected ? <UserCheck className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {isSelected ? "Viendo prospectos" : "Ver prospectos"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
