import { Activity } from "lucide-react";
import { LEAD_STATUSES, type CleanSellerProfile } from "../../adapters/seller.adapter";
import { formatInteger, leadStatusLabels } from "./presentation";

interface Props { seller: CleanSellerProfile; }

export function SellerLeadStatusSummary({ seller }: Props) {
  const total = seller.campaignMembers.length;
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900"><Activity className="h-4 w-4 text-blue-600" />Distribución de leads</h2>
        <span className="text-xs font-semibold text-slate-400">{total > 0 ? `${formatInteger(total)} en total` : "Sin leads registrados"}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {LEAD_STATUSES.map((status) => {
          const count = seller.leadStatusCounts[status];
          const ratio = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={status} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[10px] font-bold uppercase leading-tight tracking-wide text-slate-500">{leadStatusLabels[status]}</p>
                <strong className="text-sm text-slate-900">{count}</strong>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-blue-500" style={{ width: `${ratio}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
