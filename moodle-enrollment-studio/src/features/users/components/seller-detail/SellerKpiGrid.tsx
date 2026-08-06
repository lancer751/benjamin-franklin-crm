import { CheckCircle2, Megaphone, ShoppingBag, Target, Trophy, UserRoundCheck, Users } from "lucide-react";
import type { CleanSellerProfile } from "../../adapters/seller.adapter";
import { formatInteger, formatPercentage } from "./presentation";

interface Props {
  seller: CleanSellerProfile;
  isSelfView?: boolean;
}

export function SellerKpiGrid({ seller, isSelfView }: Props) {
  const items = [
    { label: isSelfView ? "Mi meta" : "Meta de ventas", value: formatInteger(seller.salesTarget), icon: Target, tone: "text-blue-600 bg-blue-50" },
    { label: "Ventas realizadas", value: formatInteger(seller.totalSales), icon: Trophy, tone: "text-emerald-600 bg-emerald-50" },
    { label: isSelfView ? "Mis leads" : "Leads asignados", value: formatInteger(seller.totalLeads), icon: Users, tone: "text-violet-600 bg-violet-50" },
    { label: "Matriculados", value: formatInteger(seller.totalMatriculated), icon: CheckCircle2, tone: "text-teal-600 bg-teal-50" },
    { label: "Conversión", value: formatPercentage(seller.conversionRate), icon: UserRoundCheck, tone: "text-cyan-600 bg-cyan-50" },
    { label: "Órdenes", value: formatInteger(seller.totalOrders), icon: ShoppingBag, tone: "text-amber-600 bg-amber-50" },
    { label: "Campañas activas", value: formatInteger(seller.activeCampaigns), icon: Megaphone, tone: "text-indigo-600 bg-indigo-50" },
  ];

  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${item.tone}`}>
              <item.icon className="h-3.5 w-3.5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate" title={item.label}>
              {item.label}
            </span>
          </div>
          <p className="text-lg font-black leading-none text-slate-900">{item.value}</p>
        </div>
      ))}
    </section>
  );
}
