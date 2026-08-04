import { CalendarDays, CheckCircle2, Megaphone, Plus, UserRound, Waypoints } from "lucide-react";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { Card } from "@/core/components/ui/card";
import { cn } from "@/core/lib/utils";
import {
  getCampaignMemberStatusConfig,
  getCampaignMemberStatusLabel,
} from "@/core/constants/campaignMemberStatus";
import type { LeadCampaignViewModel } from "../../adapters/leadDetailAdapter";
import { displayEnum, formatLeadDate } from "./leadDetail.formatters";

interface LeadCampaignsTabProps {
  members: LeadCampaignViewModel[];
  selectedMemberId: string;
  canAddCampaign: boolean;
  canChangeStage: boolean;
  onAddCampaign: () => void;
  onSelectMember: (memberId: string) => void;
  onChangeStage: (member: LeadCampaignViewModel) => void;
  onViewActivity: (memberId: string) => void;
}

export function LeadCampaignsTab({
  members,
  selectedMemberId,
  canAddCampaign,
  canChangeStage,
  onAddCampaign,
  onSelectMember,
  onChangeStage,
  onViewActivity,
}: LeadCampaignsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Campañas asociadas</h2>
          <p className="text-sm text-muted-foreground">Selecciona una para consultar su actividad.</p>
        </div>
        {canAddCampaign && <Button onClick={onAddCampaign}><Plus className="h-4 w-4" />Agregar a campaña</Button>}
      </div>

      {members.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">Este prospecto todavía no está asociado a una campaña.</Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {members.map((member) => {
            const statusConfig = getCampaignMemberStatusConfig(member.status);
            return (
              <Card
                key={member.id}
                role="button"
                tabIndex={0}
                aria-pressed={selectedMemberId === member.id}
                className={`cursor-pointer p-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selectedMemberId === member.id ? "border-primary/60 bg-primary/[0.02]" : "hover:border-primary/30"}`}
                onClick={() => onSelectMember(member.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectMember(member.id);
                  }
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Megaphone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{member.campaignName}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{displayEnum(member.platform)}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    {selectedMemberId === member.id && <Badge variant="secondary" className="gap-1"><CheckCircle2 className="h-3 w-3" />Campaña activa</Badge>}
                    {member.isPrimary && <Badge variant="outline">Principal</Badge>}
                  </div>
                </div>
                <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm text-muted-foreground">Etapa</dt>
                    <dd className="mt-1">
                      <Badge variant="outline" className={cn(statusConfig?.badgeClassName || "border-slate-200 bg-slate-50 text-slate-700")}>
                        {getCampaignMemberStatusLabel(member.status)}
                      </Badge>
                      {canChangeStage && <Button type="button" variant="link" className="ml-2 h-auto px-0 py-0 text-xs" onClick={(event) => { event.stopPropagation(); onChangeStage(member); }}>Cambiar</Button>}
                    </dd>
                  </div>
                  <div><dt className="text-sm text-muted-foreground"><UserRound className="mr-1 inline h-4 w-4" />Asesor</dt><dd className="mt-1 font-medium">{member.assignedUser?.name ?? "Sin asignar"}</dd></div>
                  <div><dt className="text-sm text-muted-foreground"><Waypoints className="mr-1 inline h-4 w-4" />Fuente</dt><dd className="mt-1 font-medium">{displayEnum(member.source)}</dd></div>
                  <div><dt className="text-sm text-muted-foreground"><CalendarDays className="mr-1 inline h-4 w-4" />Asociación</dt><dd className="mt-1 font-medium">{formatLeadDate(member.createdAt)}</dd></div>
                </dl>
                <Button variant="link" className="mt-4 h-auto px-0" onClick={(event) => { event.stopPropagation(); onViewActivity(member.id); }}>Ver actividad</Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
