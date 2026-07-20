import { Megaphone, ShoppingBag, Target, Trophy, UserRoundCheck, Users } from "lucide-react";
import type { CleanSellerProfile } from "../../adapters/seller.adapter";
import { formatInteger, formatPercentage } from "./presentation";

interface Props {
  seller: CleanSellerProfile;
  isSelfView: boolean;
  campaignsUnavailable: boolean;
}

export function SellerKpiGrid({ seller, isSelfView, campaignsUnavailable }: Props) {
  const items = [
    { label: isSelfView ? "Mi meta" : "Meta de ventas", value: formatInteger(seller.salesTarget), icon: Target, tone: "text-blue-600 bg-blue-50" },
    { label: "Ventas realizadas", value: formatInteger(seller.totalSales), icon: Trophy, tone: "text-emerald-600 bg-emerald-50" },
    { label: isSelfView ? "Mis leads" : "Leads asignados", value: formatInteger(seller.campaignMembers.length), icon: Users, tone: "text-violet-600 bg-violet-50" },
    { label: "Conversión", value: formatPercentage(seller.conversionRate), icon: UserRoundCheck, tone: "text-cyan-600 bg-cyan-50" },
    { label: "Órdenes", value: formatInteger(seller.totalOrders), icon: ShoppingBag, tone: "text-amber-600 bg-amber-50" },
    { label: "Campañas activas", value: campaignsUnavailable ? "No disponible" : formatInteger(seller.activeCampaigns), icon: Megaphone, tone: "text-indigo-600 bg-indigo-50" },
  ];

  return (
    <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg ${item.tone}`}>
            <item.icon className="h-4 w-4" />
          </div>
          <p className="text-xl font-black leading-none text-slate-950">{item.value}</p>
          <p className="mt-2 text-[11px] font-semibold text-slate-500">{item.label}</p>
        </div>
      ))}
    </section>
  );
}
