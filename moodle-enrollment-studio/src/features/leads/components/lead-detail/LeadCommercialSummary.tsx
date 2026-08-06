import { Megaphone, Route, UserRound, Waypoints } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { Card } from "@/core/components/ui/card";
import { getCampaignMemberStatusLabel } from "@/core/constants/campaignMemberStatus";
import type { LeadCampaignViewModel } from "../../adapters/leadDetailAdapter";
import { CampaignContextSelector } from "./CampaignContextSelector";
import { displayEnum } from "./leadDetail.formatters";

interface LeadCommercialSummaryProps {
  members: LeadCampaignViewModel[];
  activeMember: LeadCampaignViewModel | null;
  canChangeStage: boolean;
  onChangeActiveMember: (memberId: string) => void;
  onChangeStage: (member: LeadCampaignViewModel) => void;
}

export function LeadCommercialSummary({ members, activeMember, canChangeStage, onChangeActiveMember, onChangeStage }: LeadCommercialSummaryProps) {
  return (
    <div className="space-y-3">
      <CampaignContextSelector
        members={members}
        selectedMemberId={activeMember?.id ?? ""}
        onChange={onChangeActiveMember}
      />

      <Card className="overflow-hidden">
        <div className="flex min-w-0 items-start gap-3 border-b px-4 py-3 sm:px-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Megaphone className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Contexto seleccionado</p>
            <h2 className="mt-0.5 break-words font-semibold text-foreground">
              {activeMember?.campaignName ?? "Sin campaña asociada"}
            </h2>
          </div>
        </div>

        <dl className="grid sm:grid-cols-3">
          <div className="flex min-w-0 gap-2.5 px-4 py-3 sm:px-5">
            <Route className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">Etapa</dt>
              <dd className="mt-0.5 font-medium">
                {activeMember ? getCampaignMemberStatusLabel(activeMember.status) : "Sin etapa"}
              </dd>
              {activeMember && canChangeStage && (
                <Button type="button" variant="link" className="h-auto px-0 py-0.5 text-xs" onClick={() => onChangeStage(activeMember)}>
                  Cambiar etapa
                </Button>
              )}
            </div>
          </div>
          <div className="flex min-w-0 gap-2.5 border-t px-4 py-3 sm:border-l sm:border-t-0 sm:px-5">
            <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">Asesor</dt>
              <dd className="mt-0.5 break-words font-medium">{activeMember?.assignedUser?.name ?? "Sin asignar"}</dd>
            </div>
          </div>
          <div className="flex min-w-0 gap-2.5 border-t px-4 py-3 sm:border-l sm:border-t-0 sm:px-5">
            <Waypoints className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">Fuente</dt>
              <dd className="mt-0.5 break-words font-medium">{activeMember ? displayEnum(activeMember.source) : "No especificado"}</dd>
            </div>
          </div>
        </dl>
      </Card>
    </div>
  );
}
