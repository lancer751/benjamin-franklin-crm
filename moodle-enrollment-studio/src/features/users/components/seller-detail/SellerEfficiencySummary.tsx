import { Clock3, Megaphone, RotateCcw, Target, UserRoundCheck } from "lucide-react";
import type { CleanSellerProfile } from "../../adapters/seller.adapter";
import { formatDuration, formatInteger, formatPercentage } from "./presentation";

interface Props { seller: CleanSellerProfile; campaignsUnavailable: boolean; }

export function SellerEfficiencySummary({ seller, campaignsUnavailable }: Props) {
  const items = [
    { label: "Respuesta promedio", value: formatDuration(seller.responseTimeAvgSeconds), icon: Clock3 },
    { label: "Tasa de devolución", value: formatPercentage(seller.returnRate), icon: RotateCcw },
    { label: "Cumplimiento", value: formatPercentage(seller.goalCompletion), icon: Target },
    { label: "Conversión", value: formatPercentage(seller.conversionRate), icon: UserRoundCheck },
    { label: "Campañas activas", value: campaignsUnavailable ? "No disponible" : formatInteger(seller.activeCampaigns), icon: Megaphone },
  ];
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-bold text-slate-900">Eficiencia comercial</h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {items.map((item) => (
          <div key={item.label} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-center">
            <item.icon className="mx-auto mb-2 h-4 w-4 text-blue-600" />
            <p className="text-sm font-black text-slate-900">{item.value}</p>
            <p className="mt-1 text-[10px] font-semibold leading-tight text-slate-500">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
