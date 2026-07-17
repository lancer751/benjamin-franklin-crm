import type { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/react";
import { cn } from "@/core/lib/utils";
import type { CampaignKanbanDropData } from "./types";

interface DroppableKanbanColumnProps {
  stageId: string;
  children: ReactNode;
  disabled?: boolean;
}

export function DroppableKanbanColumn({
  stageId,
  children,
  disabled = false,
}: DroppableKanbanColumnProps) {
  const { ref, isDropTarget } = useDroppable<CampaignKanbanDropData>({
    id: stageId,
    data: { stageId },
    disabled,
  });

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl transition-[box-shadow,background-color] duration-150",
        isDropTarget && !disabled && "bg-primary/5 ring-2 ring-primary/25 ring-offset-2",
      )}
    >
      {children}
    </div>
  );
}
