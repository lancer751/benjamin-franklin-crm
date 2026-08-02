import { Megaphone, Route, UserRound, Waypoints } from "lucide-react";
import { Card } from "@/core/components/ui/card";
import { getCampaignMemberStatusLabel } from "@/core/constants/campaignMemberStatus";
import type { LeadCampaignViewModel } from "../../adapters/leadDetailAdapter";
import { displayEnum } from "./leadDetail.formatters";

export function LeadCommercialSummary({ campaign }: { campaign?: LeadCampaignViewModel | null }) {
  const items = [
    { icon: Megaphone, label: "Campaña", value: campaign?.campaignName ?? "Sin campaña asociada" },
    { icon: Route, label: "Etapa actual", value: campaign ? getCampaignMemberStatusLabel(campaign.status) : "Sin etapa" },
    { icon: UserRound, label: "Asesor asignado", value: campaign?.assignedUser?.name ?? "Sin asignar" },
    { icon: Waypoints, label: "Fuente", value: campaign ? displayEnum(campaign.source) : "No especificado" },
  ];

  return (
    <Card className="grid gap-0 overflow-hidden sm:grid-cols-2 lg:grid-cols-4">
      {items.map(({ icon: Icon, label, value }, index) => (
        <div key={label} className={`flex gap-3 p-4 ${index > 0 ? "border-t sm:border-l sm:border-t-0" : ""}`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-0.5 font-semibold">{value}</p>
          </div>
        </div>
      ))}
    </Card>
  );
}
