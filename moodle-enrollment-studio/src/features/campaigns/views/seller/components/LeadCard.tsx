import type { SyntheticEvent } from "react";
import { Phone, MessageSquare, GripVertical, MoreHorizontal } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu";
import {
  CAMPAIGN_MEMBER_STATUS_BY_VALUE,
  CAMPAIGN_MEMBER_STATUS_CONFIG,
  isCampaignMemberStatus,
  type CampaignMemberStatus,
} from "@/core/constants/campaignMemberStatus";
import { cn } from "@/core/lib/utils";
import type { NormalizedLead } from "@/features/leads/adapters/leadAdapter";
import type { KanbanDragState } from "@/features/campaigns/components/kanban-dnd";

interface LeadCardProps {
  lead: NormalizedLead;
  onSelect: (lead: NormalizedLead) => void;
  onStatusChange: (memberId: string, newStatus: CampaignMemberStatus) => void;
  isPending: boolean;
  dragState?: KanbanDragState;
}

export default function LeadCard({ lead, onSelect, onStatusChange, isPending, dragState }: LeadCardProps) {
  const stopDragStart = (event: SyntheticEvent) => event.stopPropagation();
  const nonDraggableControlProps = {
    onPointerDown: stopDragStart,
    onMouseDown: stopDragStart,
  };

  const phone = lead.phones?.[0]?.number || null;
  const formattedPhone = phone ? phone.replace(/\D/g, "") : "";
  const whatsappUrl = formattedPhone ? `https://wa.me/${formattedPhone}` : "";
  const memberId = lead.campaignsEngaging?.[0]?.id || "";
  const currentStatus = isCampaignMemberStatus(lead.lead_status) ? lead.lead_status : "NUEVO";
  const statusConfig = CAMPAIGN_MEMBER_STATUS_BY_VALUE[currentStatus];

  return (
    <div
      onClick={() => onSelect(lead)}
      className={`group relative space-y-3 rounded-xl border border-border bg-card p-3.5 shadow-sm transition-all duration-200 hover:border-primary/40 hover:shadow-md ${
        dragState?.isDragging ? "cursor-grabbing" : dragState ? "cursor-grab" : "cursor-pointer"
      }`}
    >
      {dragState && (
        <span
          aria-hidden="true"
          title="Arrastrar a otra etapa"
          className={dragState.isDragging
            ? "pointer-events-none absolute right-2 top-2 rounded-md p-1 text-primary"
            : "pointer-events-none absolute right-2 top-2 rounded-md p-1 text-muted-foreground/60"}
        >
          <GripVertical size={14} />
        </span>
      )}

      {/* Top Lead Info */}
      <div className="space-y-2 pr-5">
        <h4 className="text-sm font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
          {lead.fullName || `${lead.first_name} ${lead.last_name}`.trim() || "Prospecto sin nombre"}
        </h4>
        <Badge variant="outline" className={cn("w-fit rounded-full px-2 py-0 text-[10px] font-semibold", statusConfig.badgeClassName)}>
          {statusConfig.label}
        </Badge>
      </div>

      {/* Contact Details */}
      <div className="space-y-1 border-t border-border/40 pt-2 text-xs text-muted-foreground">
        {phone && (
          <p className="flex items-center gap-1.5 font-medium text-foreground">
            <Phone size={12} className="text-muted-foreground/80" /> {phone}
          </p>
        )}
        {!phone && <p className="text-[11px] italic">Sin teléfono registrado</p>}
      </div>

      {/* Action Bar / Dropdown to change stage */}
      <div 
        className="pt-2 border-t border-border/40 flex items-center justify-between gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full">
          <select
            {...nonDraggableControlProps}
            value={currentStatus}
            onChange={(event) => {
              if (isCampaignMemberStatus(event.target.value)) {
                onStatusChange(memberId, event.target.value);
              }
            }}
            className="w-full h-7 px-1.5 rounded-lg border border-border bg-slate-50 dark:bg-slate-900 text-[10px] font-bold text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-1 focus:ring-primary/20 cursor-pointer shadow-sm"
            disabled={isPending || !memberId}
          >
            {CAMPAIGN_MEMBER_STATUS_CONFIG.map((status) => (
              <option key={status.value} value={status.value}>
                Mover a: {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Quick External Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {whatsappUrl && (
            <a
              {...nonDraggableControlProps}
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-7 w-7 rounded-lg border border-border hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-muted-foreground hover:text-emerald-600 flex items-center justify-center transition-all shadow-sm"
              title="Enviar WhatsApp"
            >
              <MessageSquare size={13} />
            </a>
          )}
          <Button
            {...nonDraggableControlProps}
            variant="ghost"
            onClick={() => onSelect(lead)}
            className="h-7 rounded-lg border border-border px-2 text-[10px] font-semibold text-muted-foreground shadow-sm transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
            title="Gestionar prospecto"
          >
            Gestionar
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                {...nonDraggableControlProps}
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg border border-border text-muted-foreground shadow-sm"
                title="Más acciones"
              >
                <MoreHorizontal size={13} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {phone ? (
                <DropdownMenuItem asChild>
                  <a href={`tel:${phone}`}>
                    <Phone className="mr-2 h-3.5 w-3.5" /> Llamar
                  </a>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem disabled>Sin acciones adicionales</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
