import { BarChart3, TrendingUp } from "lucide-react";
import { Skeleton } from "@/core/components/ui/skeleton";

interface CampaignStatsCardsProps {
  isLoading: boolean;
  totalBudget: number;
  totalSpent: number;
  activeCampaigns: number;
  spentPercent: number;
  totalCampaignsCount: number;
}

const formatCurrency = (value: number) => {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
};

export const CampaignStatsCards = ({
  isLoading,
  totalBudget,
  totalSpent,
  activeCampaigns,
  spentPercent,
  totalCampaignsCount,
}: CampaignStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Presupuesto Total */}
      <div className="rounded-xl bg-card border border-border p-5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Presupuesto Total
          </p>
          <BarChart3 size={18} className="text-primary" />
        </div>
        {isLoading ? (
          <Skeleton className="h-8 w-28 mt-2" />
        ) : (
          <p className="text-2xl font-bold text-foreground mt-2">
            {formatCurrency(totalBudget)}
          </p>
        )}
        <span className="inline-flex mt-2 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
          Calculado en vivo
        </span>
      </div>

      {/* Total Gastado */}
      <div className="rounded-xl bg-card border border-border p-5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Total Gastado
          </p>
          <BarChart3 size={18} className="text-muted-foreground" />
        </div>
        {isLoading ? (
          <Skeleton className="h-8 w-28 mt-2" />
        ) : (
          <div className="flex items-baseline gap-3 mt-2">
            <span className="text-2xl font-bold text-foreground">
              {formatCurrency(totalSpent)}
            </span>
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-foreground transition-all duration-300"
                style={{ width: `${spentPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Campañas Activas */}
      <div className="rounded-xl bg-card border border-border p-5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Campañas Activas
          </p>
          <TrendingUp size={18} className="text-muted-foreground" />
        </div>
        {isLoading ? (
          <Skeleton className="h-8 w-28 mt-2" />
        ) : (
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-foreground">
              {activeCampaigns}
            </span>
            <span className="text-sm text-muted-foreground">
              de {totalCampaignsCount} totales
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
