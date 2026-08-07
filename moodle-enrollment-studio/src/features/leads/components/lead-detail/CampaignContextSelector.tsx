import { Check, UserRound } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { cn } from "@/core/lib/utils";
import {
  getCampaignMemberStatusConfig,
  getCampaignMemberStatusLabel,
} from "@/core/constants/campaignMemberStatus";
import type { LeadCampaignViewModel } from "../../adapters/leadDetailAdapter";

interface CampaignContextSelectorProps {
  members: LeadCampaignViewModel[];
  selectedMemberId: string;
  onChange: (memberId: string) => void;
}

export function CampaignContextSelector({ members, selectedMemberId, onChange }: CampaignContextSelectorProps) {
  const campaignCountLabel = `${members.length} ${members.length === 1 ? "campaña" : "campañas"}`;

  return (
    <section aria-labelledby="prospect-campaigns-title" className="space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <h2 id="prospect-campaigns-title" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Campañas del prospecto
        </h2>
        <span className="shrink-0 text-xs font-medium text-muted-foreground">{campaignCountLabel}</span>
      </div>

      {members.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
          Este prospecto todavía no pertenece a una campaña.
        </p>
      ) : (
        <div className="-mx-1 overflow-x-auto px-1 pb-1" role="group" aria-label="Seleccionar contexto de campaña">
          <div className="flex min-w-max gap-3">
            {members.map((member) => {
              const isSelected = selectedMemberId === member.id;
              const statusConfig = getCampaignMemberStatusConfig(member.status);

              return (
                <Button
                  key={member.id}
                  type="button"
                  variant="outline"
                  aria-pressed={isSelected}
                  onClick={() => onChange(member.id)}
                  className={cn(
                    "h-auto w-[min(17rem,calc(100vw-3.5rem))] shrink-0 items-start justify-start whitespace-normal rounded-xl p-3 text-left shadow-none transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:w-64",
                    isSelected
                      ? "border-primary bg-primary/[0.06] text-foreground hover:bg-primary/[0.08]"
                      : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted/40",
                  )}
                >
                  <span className="flex w-full min-w-0 items-start gap-2.5">
                    <span className="min-w-0 flex-1">
                      <span className="block line-clamp-2 text-sm font-semibold leading-5">{member.campaignName}</span>
                      <span className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                            statusConfig?.badgeClassName,
                          )}
                        >
                          {getCampaignMemberStatusLabel(member.status)}
                        </span>
                      </span>
                      <span className="mt-2 flex min-w-0 items-center gap-1.5 text-xs font-normal text-muted-foreground">
                        <UserRound className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{member.assignedUser?.name ?? "Sin asignar"}</span>
                      </span>
                    </span>
                    {isSelected && (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground" aria-hidden="true">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
