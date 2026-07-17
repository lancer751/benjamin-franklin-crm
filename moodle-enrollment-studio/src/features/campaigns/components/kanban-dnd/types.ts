export interface CampaignKanbanDragData {
  memberId: string;
  currentStage: string;
}

export interface CampaignKanbanDropData {
  stageId: string;
}

export interface CampaignKanbanMovePayload {
  memberId: string;
  currentStage: string;
  targetStage: string;
}

export interface KanbanDragState {
  isDragging: boolean;
  disabled: boolean;
}
