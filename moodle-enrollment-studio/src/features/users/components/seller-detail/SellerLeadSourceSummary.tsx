import { Share2 } from "lucide-react";
import { LEAD_SOURCES, type CleanSellerProfile } from "../../adapters/seller.adapter";
import { formatPercentage, leadSourceLabels } from "./presentation";

interface Props { seller: CleanSellerProfile; }

export function SellerLeadSourceSummary({ seller }: Props) {
  const total = seller.campaignMembers.length;
  const sources = LEAD_SOURCES.filter((source) => seller.leadSourceCounts[source] > 0);
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900"><Share2 className="h-4 w-4 text-blue-600" />Origen de leads</h2>
      {sources.length === 0 ? (
        <div className="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">Sin leads registrados</div>
      ) : (
        <div className="space-y-2">
          {sources.map((source) => {
            const count = seller.leadSourceCounts[source];
            const ratio = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={source} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5">
                <span className="text-xs font-semibold text-slate-600">{leadSourceLabels[source]}</span>
                <span className="text-xs text-slate-400"><strong className="mr-2 text-sm text-slate-900">{count}</strong>{formatPercentage(ratio)}</span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
