import { Clock3 } from "lucide-react";
import type { CleanSellerProfile } from "../../adapters/seller.adapter";
import { formatDate, getSourceLabel, getStatusLabel } from "./presentation";

interface Props { seller: CleanSellerProfile; }

export function SellerRecentLeadActivity({ seller }: Props) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900"><Clock3 className="h-4 w-4 text-blue-600" />Actividad reciente de leads</h2>
      {seller.recentLeadActivity.length === 0 ? (
        <div className="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">Sin actividad</div>
      ) : (
        <div className="divide-y divide-slate-100">
          {seller.recentLeadActivity.map((member) => (
            <div key={member.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-slate-800">Origen: {getSourceLabel(member.source)}</p>
                <p className="mt-1 text-[11px] text-slate-500">Estado: {getStatusLabel(member.status)}</p>
              </div>
              <p className="shrink-0 text-right text-[11px] text-slate-400">Actualizado<br /><span className="font-semibold text-slate-600">{formatDate(member.updatedAt ?? member.createdAt, "No registrado")}</span></p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
