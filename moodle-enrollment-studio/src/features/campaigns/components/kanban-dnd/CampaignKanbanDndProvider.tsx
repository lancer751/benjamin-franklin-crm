import type { ReactNode } from "react";
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import type {
  CampaignKanbanDragData,
  CampaignKanbanDropData,
  CampaignKanbanMovePayload,
} from "./types";

interface CampaignKanbanDndProviderProps {
  children: ReactNode;
  disabled?: boolean;
  onMove: (payload: CampaignKanbanMovePayload) => void;
}

export function CampaignKanbanDndProvider({
  children,
  disabled = false,
  onMove,
}: CampaignKanbanDndProviderProps) {
  const handleDragEnd = (event: DragEndEvent) => {
    if (event.canceled || disabled) return;

    const source = event.operation.source;
    const target = event.operation.target;
    const dragData = source?.data as CampaignKanbanDragData | undefined;
    const dropData = target?.data as CampaignKanbanDropData | undefined;
    const memberId = dragData?.memberId || String(source?.id ?? "");
    const currentStage = dragData?.currentStage || "";
    const targetStage = dropData?.stageId || String(target?.id ?? "");

    if (!memberId || !currentStage || !targetStage || currentStage === targetStage) {
      return;
    }

    onMove({ memberId, currentStage, targetStage });
  };

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <div className="relative" aria-busy={disabled}>
        {disabled && (
          <span
            role="status"
            aria-live="polite"
            className="absolute -top-6 right-0 text-[10px] font-medium text-muted-foreground"
          >
            Actualizando etapa...
          </span>
        )}
        {children}
      </div>
    </DragDropProvider>
  );
}
