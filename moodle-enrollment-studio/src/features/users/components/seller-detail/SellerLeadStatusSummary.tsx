import { Activity } from "lucide-react";
import { LEAD_STATUSES, LEAD_STATUS_LABELS, type CleanSellerProfile } from "../../adapters/seller.adapter";
import { formatInteger } from "./presentation";

interface Props {
  seller: CleanSellerProfile;
}

export function SellerLeadStatusSummary({ seller }: Props) {
  const total = seller.totalLeads || Object.values(seller.leadStatusCounts).reduce((a, b) => a + b, 0);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Activity className="h-4 w-4 text-primary" />
          Distribución de leads por estado
        </h2>
        <span className="text-xs font-semibold text-slate-400">
          {total > 0 ? `${formatInteger(total)} leads totales` : "Sin leads registrados"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
        {LEAD_STATUSES.map((statusKey) => {
          const count = seller.leadStatusCounts[statusKey] ?? 0;
          const ratio = total > 0 ? (count / total) * 100 : 0;
          const label = LEAD_STATUS_LABELS[statusKey] ?? statusKey;

          return (
            <div key={statusKey} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-center space-y-1">
              <p className="text-[10px] font-bold uppercase leading-tight tracking-wider text-slate-500 truncate" title={label}>
                {label}
              </p>
              <p className="text-base font-black text-slate-900">{count}</p>
              <div className="h-1 w-full overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, ratio))}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
