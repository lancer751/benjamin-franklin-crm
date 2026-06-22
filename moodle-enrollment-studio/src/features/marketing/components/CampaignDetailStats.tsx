import { DollarSign, BarChart3, TrendingUp, Calendar } from "lucide-react";
import { Card, CardContent } from "@/core/components/ui/card";
import { translateEnum, CampaignStatusMap, CampaignPlatformMap } from "@/core/utils/dictionaries";

interface CampaignDetailStatsProps {
  campaign: any;
}

const formatDate = (dateString: string | undefined | null) => {
  if (!dateString) return "Sin fecha de fin";
  return new Date(dateString).toLocaleDateString("es-PE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export const CampaignDetailStats = ({ campaign }: CampaignDetailStatsProps) => {
  const initialBudget = Number(campaign.initial_budget) || 0;
  const totalSpent = campaign.total_spent ? Number(campaign.total_spent) : 0;
  const spentPercent = initialBudget > 0 ? Math.round((totalSpent / initialBudget) * 100) : 0;

  const kpis = [
    {
      label: "Presupuesto",
      value: `$${initialBudget.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      sub: "Total asignado",
    },
    {
      label: "Gastado",
      value: `$${totalSpent.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: BarChart3,
      sub: `${spentPercent}% utilizado`,
    },
    {
      label: "Estado",
      value: translateEnum(campaign.status, CampaignStatusMap),
      icon: TrendingUp,
      sub: translateEnum(campaign.platform, CampaignPlatformMap),
    },
    {
      label: "Inicio",
      value: formatDate(campaign.start_date),
      icon: Calendar,
      sub: "Fecha de inicio",
    },
    {
      label: "Fin",
      value: formatDate(campaign.end_date),
      icon: Calendar,
      sub: "Fecha de cierre",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {kpis.map((kpi, i) => {
        const Icon = kpi.icon;
        return (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {kpi.label}
                </p>
                <Icon size={16} className="text-primary" />
              </div>
              <p className="text-xl font-bold text-foreground mt-2">{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{kpi.sub}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
