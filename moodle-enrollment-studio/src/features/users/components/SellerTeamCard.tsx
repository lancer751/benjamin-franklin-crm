import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/core/components/ui/avatar";
import { Badge } from "@/core/components/ui/badge";
import type { SellerTeamCardModel } from "../adapters/seller.adapter";

interface SellerTeamCardProps {
  seller: SellerTeamCardModel;
}

const MetricItem = ({ label, value }: { label: string; value: number }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</span>
    <span className="text-lg font-bold leading-none text-slate-800">{value.toLocaleString("es-PE")}</span>
  </div>
);

export function SellerTeamCard({ seller }: SellerTeamCardProps) {
  const navigate = useNavigate();

  const handleActivate = () => {
    if (seller.userId) navigate(`/users/sellers/${seller.userId}`);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleActivate();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Ver detalle de ${seller.fullName}`}
      onClick={handleActivate}
      onKeyDown={handleKeyDown}
      className={[
        "group relative flex cursor-pointer flex-col gap-4 rounded-xl border bg-white p-5 shadow-sm",
        "transition-all duration-150 hover:border-primary/50 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        !seller.isActive && "opacity-60",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Header: avatar + nombre + estado */}
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10 shrink-0 ring-2 ring-slate-100">
          <AvatarFallback
            className={[
              "text-sm font-bold",
              seller.isActive
                ? "bg-primary/10 text-primary"
                : "bg-slate-100 text-slate-400",
            ].join(" ")}
          >
            {seller.initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight text-slate-900">
            {seller.fullName}
          </p>
          <div className="mt-1">
            {seller.isActive ? (
              <Badge
                variant="outline"
                className="border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700"
              >
                Activo
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500"
              >
                Inactivo
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Métricas 2×2 */}
      <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3">
        <MetricItem label="Leads" value={seller.totalLeads} />
        <MetricItem label="Matriculados" value={seller.totalMatriculated} />
        <MetricItem label="Órdenes" value={seller.totalOrders} />
        <MetricItem label="Camp. activas" value={seller.activeCampaigns} />
      </div>

      {/* Meta comercial */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          Meta comercial:{" "}
          <span className="font-semibold text-slate-700">
            {seller.salesTarget.toLocaleString("es-PE")}
          </span>
        </span>
        <span
          aria-hidden="true"
          className="flex items-center gap-1 font-semibold text-primary transition-transform duration-150 group-hover:translate-x-0.5"
        >
          Ver detalle <ArrowRight size={13} />
        </span>
      </div>
    </div>
  );
}
