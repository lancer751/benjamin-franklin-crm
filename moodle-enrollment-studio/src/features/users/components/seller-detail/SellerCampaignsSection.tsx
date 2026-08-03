import { Link } from "react-router-dom";
import { AlertCircle, ArrowUpRight, CalendarDays, Loader2, Megaphone, Users } from "lucide-react";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import type { CleanSellerProfile } from "../../adapters/seller.adapter";
import { formatCurrency, formatDate } from "./presentation";

interface Props {
  seller: CleanSellerProfile;
  isSelfView: boolean;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function SellerCampaignsSection({ seller, isSelfView, isLoading, isError, onRetry }: Props) {
  const statusLabels: Record<string, string> = {
    ACTIVE: "Activa",
    INACTIVE: "Inactiva",
    PAUSED: "Pausada",
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900"><Megaphone className="h-4 w-4 text-blue-600" />{isSelfView ? "Mis campañas" : "Campañas asignadas"}</h2>
        {!isLoading && !isError && <span className="text-xs font-semibold text-slate-400">{seller.campaigns.length} asignadas</span>}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-lg bg-slate-50 py-8 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" />Cargando campañas...</div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-rose-100 bg-rose-50 px-4 py-6 text-center">
          <AlertCircle className="h-5 w-5 text-rose-500" />
          <p className="text-sm text-rose-700">No fue posible cargar las campañas asignadas.</p>
          <Button onClick={onRetry} variant="outline" size="sm">Reintentar</Button>
        </div>
      ) : seller.campaigns.length === 0 ? (
        <div className="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">Sin campañas asignadas</div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {seller.campaigns.map((campaign) => (
            <article key={campaign.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold text-slate-900">{campaign.name}</h3>
                  <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-slate-500"><Megaphone className="h-3 w-3" />{campaign.platform} · {campaign.isOrganic ? "Orgánica" : "Pagada"}</p>
                </div>
                <Badge variant="outline" className={campaign.status === "ACTIVE" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-600"}>
                  {statusLabels[campaign.status] ?? campaign.status}
                </Badge>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-[11px]">
                <div><dt className="text-slate-400">Presupuesto inicial</dt><dd className="mt-0.5 font-bold text-slate-700">{formatCurrency(campaign.initialBudget)}</dd></div>
                <div><dt className="text-slate-400">Leads asignados</dt><dd className="mt-0.5 flex items-center gap-1 font-bold text-slate-700"><Users className="h-3 w-3" />{campaign.assignedLeads}</dd></div>
                <div><dt className="flex items-center gap-1 text-slate-400"><CalendarDays className="h-3 w-3" />Inicio</dt><dd className="mt-0.5 font-semibold text-slate-600">{formatDate(campaign.startDate)}</dd></div>
                <div><dt className="flex items-center gap-1 text-slate-400"><CalendarDays className="h-3 w-3" />Fin</dt><dd className="mt-0.5 font-semibold text-slate-600">{formatDate(campaign.endDate)}</dd></div>
              </dl>
              {!isSelfView && (
                <Link to={`/admin/campanas/${campaign.id}`} className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-800">
                  Ver campaña <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
