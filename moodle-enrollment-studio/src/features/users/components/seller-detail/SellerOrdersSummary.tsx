import { CheckCircle2, ShoppingBag, XCircle } from "lucide-react";
import type { CleanSellerProfile } from "../../adapters/seller.adapter";
import { formatInteger } from "./presentation";

interface Props { seller: CleanSellerProfile; }

export function SellerOrdersSummary({ seller }: Props) {
  const items = [
    { label: "Totales", value: seller.totalOrders, icon: ShoppingBag, color: "text-blue-600" },
    { label: "Completadas", value: seller.completedOrders, icon: CheckCircle2, color: "text-emerald-600" },
    { label: "Canceladas", value: seller.canceledOrders, icon: XCircle, color: "text-rose-500" },
  ];
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900">Resumen de órdenes</h2>
        {seller.totalOrders === 0 && <span className="text-[11px] font-semibold text-slate-400">Sin órdenes registradas</span>}
      </div>
      <div className="grid grid-cols-3 divide-x divide-slate-100 rounded-lg bg-slate-50 py-3">
        {items.map((item) => (
          <div key={item.label} className="px-2 text-center">
            <item.icon className={`mx-auto mb-1.5 h-4 w-4 ${item.color}`} />
            <p className="text-lg font-black text-slate-900">{formatInteger(item.value)}</p>
            <p className="text-[10px] font-semibold text-slate-500">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
