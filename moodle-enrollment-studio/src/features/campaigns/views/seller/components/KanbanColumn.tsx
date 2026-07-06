import { cn } from "@/core/lib/utils";
import { Users } from "lucide-react";
import LeadCard from "./LeadCard";

interface KanbanColumnProps {
  stage: {
    id: string;
    label: string;
    backendStatuses: string[];
    borderStyle: string;
    dotColor: string;
  };
  leads: any[];
  onSelect: (lead: any) => void;
  onStatusChange: (memberId: string, newStatus: string) => void;
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
        "flex flex-col rounded-2xl border bg-card overflow-hidden shadow-sm h-[70vh] hover:shadow transition-all duration-300",
        stage.id === "MATRICULADO"
          ? "border-emerald-350 dark:border-emerald-500/30 ring-1 ring-emerald-500/10 shadow-[0_0_8px_rgba(16,185,129,0.05)]"
          : "border-border"
      )}
    >
      {/* Lane Header */}
      <div
        className={cn(
          "px-4 py-3.5 border-b flex items-center justify-between font-bold text-xs tracking-wider uppercase",
          stage.borderStyle
        )}
      >
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", stage.dotColor)} />
          {stage.label}
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
          leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onSelect={onSelect}
              onStatusChange={onStatusChange}
              isPending={isPending}
            />
          ))
        )}
      </div>
    </div>
  );
}
