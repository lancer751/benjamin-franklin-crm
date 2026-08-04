import { Megaphone, Route, UserRound, Waypoints } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { Card } from "@/core/components/ui/card";
import { getCampaignMemberStatusLabel } from "@/core/constants/campaignMemberStatus";
import type { LeadCampaignViewModel } from "../../adapters/leadDetailAdapter";
import { displayEnum } from "./leadDetail.formatters";

interface LeadCommercialSummaryProps {
  members: LeadCampaignViewModel[];
  activeMember: LeadCampaignViewModel | null;
  canChangeStage: boolean;
  onChangeActiveMember: (memberId: string) => void;
  onChangeStage: (member: LeadCampaignViewModel) => void;
}

export function LeadCommercialSummary({ members, activeMember, canChangeStage, onChangeActiveMember, onChangeStage }: LeadCommercialSummaryProps) {
  const campaignValue = members.length > 1 ? (
    <select
      className="mt-1 h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      value={activeMember?.id ?? ""}
      onChange={(event) => onChangeActiveMember(event.target.value)}
      aria-label="Campaña activa"
      title={activeMember?.campaignName}
    >
      {members.map((member) => (
        <option key={member.id} value={member.id}>
          {member.campaignName} — {getCampaignMemberStatusLabel(member.status)} · {member.assignedUser?.name ?? "Sin asignar"}
        </option>
      ))}
    </select>
  ) : <p className="mt-0.5 break-words font-semibold">{activeMember?.campaignName ?? "Sin campaña asociada"}</p>;

  return (
    <Card className="grid gap-0 overflow-hidden sm:grid-cols-2 lg:grid-cols-4">
      <div className="flex min-w-0 gap-3 p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10"><Megaphone className="h-4 w-4 text-primary" /></div>
        <div className="min-w-0 flex-1"><p className="text-sm text-muted-foreground">Campaña activa</p>{campaignValue}</div>
      </div>
      <div className="flex gap-3 border-t p-4 sm:border-l sm:border-t-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10"><Route className="h-4 w-4 text-primary" /></div>
        <div>
          <p className="text-sm text-muted-foreground">Etapa de la campaña</p>
          <p className="mt-0.5 font-semibold">{activeMember ? getCampaignMemberStatusLabel(activeMember.status) : "Sin etapa"}</p>
          {activeMember && canChangeStage && <Button type="button" variant="link" className="h-auto px-0 py-1 text-xs" onClick={() => onChangeStage(activeMember)}>Cambiar etapa</Button>}
        </div>
      </div>
      <div className="flex gap-3 border-t p-4 sm:border-l lg:border-t-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10"><UserRound className="h-4 w-4 text-primary" /></div>
        <div><p className="text-sm text-muted-foreground">Asesor asignado</p><p className="mt-0.5 font-semibold">{activeMember?.assignedUser?.name ?? "Sin asignar"}</p></div>
      </div>
      <div className="flex gap-3 border-t p-4 sm:border-l lg:border-t-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10"><Waypoints className="h-4 w-4 text-primary" /></div>
        <div><p className="text-sm text-muted-foreground">Fuente</p><p className="mt-0.5 font-semibold">{activeMember ? displayEnum(activeMember.source) : "No especificado"}</p></div>
      </div>
    </Card>
  );
}
