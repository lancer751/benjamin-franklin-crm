import { cn } from "@/core/lib/utils";
import { Users } from "lucide-react";
import LeadCard from "./LeadCard";
import { DraggableLeadCard } from "@/features/campaigns/components/kanban-dnd";
import type { NormalizedLead } from "@/features/leads/adapters/leadAdapter";
import {
  CAMPAIGN_MEMBER_STATUS_GROUPS,
  type CampaignMemberStatus,
  type CampaignMemberStatusListItem,
} from "@/core/constants/campaignMemberStatus";

interface KanbanColumnProps {
  stage: CampaignMemberStatusListItem;
  leads: NormalizedLead[];
  onSelect: (lead: NormalizedLead) => void;
  onStatusChange: (memberId: string, newStatus: CampaignMemberStatus) => void;
  isPending: boolean;
}

export default function KanbanColumn({
  stage,
  leads,
  onSelect,
  onStatusChange,
  isPending,
}: KanbanColumnProps) {
  return (
    <div
      className={cn(
        "flex h-[68vh] min-h-[480px] flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow duration-200 hover:shadow-md",
        "border-border",
      )}
    >
      {/* Lane Header */}
      <div
        className={cn(
          "px-4 py-3.5 border-b flex items-center justify-between font-bold text-xs tracking-wider uppercase",
          stage.columnClassName
        )}
      >
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", stage.dotClassName)} />
          <span className="flex flex-col gap-0.5">
            <span className="text-[9px] font-semibold normal-case tracking-normal opacity-70">
              {CAMPAIGN_MEMBER_STATUS_GROUPS[stage.group]}
            </span>
            <span>{stage.label}</span>
          </span>
        </div>
        <span className="bg-white/40 dark:bg-black/20 text-foreground px-2 py-0.5 rounded-full text-[10px] font-extrabold font-mono">
          {leads.length}
        </span>
      </div>

      {/* Lane Body Scrollable */}
      <div className="p-3 overflow-y-auto flex-1 space-y-3 bg-slate-50/30 dark:bg-slate-900/10">
        {leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4 text-muted-foreground/60 select-none">
            <Users size={28} className="opacity-20 mb-2" />
            <p className="text-[10px] font-medium">Sin prospectos en esta etapa</p>
          </div>
        ) : (
          leads.map((lead) => {
            const memberId = lead.campaignsEngaging?.[0]?.id || "";
            const currentStage = stage.value;

            if (!memberId) {
              return (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onSelect={onSelect}
                  onStatusChange={onStatusChange}
                  isPending={isPending}
                />
              );
            }

            return (
              <DraggableLeadCard
                key={memberId || lead.id}
                memberId={memberId}
                currentStage={currentStage}
                disabled={isPending}
              >
                {(dragState) => (
                  <LeadCard
                    lead={lead}
                    onSelect={onSelect}
                    onStatusChange={onStatusChange}
                    isPending={isPending}
                    dragState={dragState}
                  />
                )}
              </DraggableLeadCard>
            );
          })
        )}
      </div>
    </div>
  );
}
