import type { ReactNode } from "react";
import { useDraggable } from "@dnd-kit/react";
import { cn } from "@/core/lib/utils";
import type { CampaignKanbanDragData, KanbanDragState } from "./types";

interface DraggableLeadCardProps {
  memberId: string;
  currentStage: string;
  disabled?: boolean;
  children: (dragState: KanbanDragState) => ReactNode;
}

export function DraggableLeadCard({
  memberId,
  currentStage,
  disabled = false,
  children,
}: DraggableLeadCardProps) {
  const isDisabled = disabled || !memberId;
  const { ref, isDragging } = useDraggable<CampaignKanbanDragData>({
    id: memberId,
    data: { memberId, currentStage },
    disabled: isDisabled,
  });

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={isDisabled ? -1 : 0}
      aria-label="Arrastrar lead a otra etapa"
      className={cn(
        "cursor-grab rounded-xl transition-[opacity,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        isDragging && "z-20 cursor-grabbing opacity-60 shadow-lg",
        disabled && "opacity-70",
      )}
    >
      {children({ isDragging, disabled: isDisabled })}
    </div>
  );
}
