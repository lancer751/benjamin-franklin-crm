import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import type { CampaignMemberStatus } from "@/core/constants/campaignMemberStatus";
import { adaptLeadInteraction, adaptLeadInteractionsResponse } from "../adapters/leadInteractionAdapter";
import { requireSuccess, unwrapDetailList } from "../adapters/leadDetailAdapter";
import type { TeamFollowUpMemberRow } from "../adapters/teamFollowUpAdapter";
import { leadDrawerCapabilities } from "../components/lead-detail/leadDetail.capabilities";
import type { LeadTask } from "../components/lead-detail/leadDetail.types";
import {
  createMemberInteraction,
  createMemberTask,
  deleteMemberTask,
  getMemberInteractions,
  getMemberTasks,
  updateMemberTask,
} from "../services/leadService";
import { useCampaignMemberStatus } from "./useCampaignMemberStatus";
import { mapInteractionFormToPayload, mapTaskFormToPayload } from "../utils/leadActionPayloadMappers";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

type InteractionPayload = ReturnType<typeof mapInteractionFormToPayload>;
type TaskPayload = ReturnType<typeof mapTaskFormToPayload>;

export function useSupervisorMemberDrawer(member: TeamFollowUpMemberRow | null) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const campaignId = member?.campaignId ?? "";
  const memberId = member?.id ?? "";
  const leadId = member?.leadId ?? "";
  const creatorUserId = user?.id ?? "";
  const capabilities = useMemo(
    () => leadDrawerCapabilities(user?.role?.name),
    [user?.role?.name],
  );
  const interactionsKey = ["lead-interactions", campaignId, memberId] as const;
  const tasksKey = ["lead-tasks", campaignId, memberId] as const;

  const interactionsQuery = useQuery({
    queryKey: interactionsKey,
    queryFn: () => getMemberInteractions(campaignId, memberId),
    enabled: Boolean(campaignId && memberId),
  });
  const tasksQuery = useQuery({
    queryKey: tasksKey,
    queryFn: () => getMemberTasks(campaignId, memberId),
    enabled: Boolean(campaignId && memberId),
  });

  const refreshMemberLists = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["team-follow-up", "campaign-members"] }),
      queryClient.invalidateQueries({ queryKey: ["campaign-members", campaignId] }),
      queryClient.invalidateQueries({ queryKey: ["campaign-members-seller", campaignId] }),
    ]);
  };

  const createInteractionMutation = useMutation({
    mutationFn: async (payload: InteractionPayload) => {
      if (!creatorUserId) throw new Error("No se encontró el usuario autenticado.");
      const response = await createMemberInteraction(
        campaignId,
        memberId,
        payload.notes,
        payload.type,
        creatorUserId,
      );
      requireSuccess(response, "No se pudo registrar la gestión.");
      return adaptLeadInteraction(response);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: interactionsKey }),
        refreshMemberLists(),
      ]);
      toast.success("Interacción registrada correctamente.");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "No se pudo registrar la gestión.")),
  });

  const createTaskMutation = useMutation({
    mutationFn: async (payload: TaskPayload) => {
      if (!creatorUserId) throw new Error("No se encontró el usuario autenticado.");
      const response = await createMemberTask(campaignId, memberId, payload, creatorUserId);
      requireSuccess(response, "No se pudo crear la tarea.");
      return response;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tasksKey });
      toast.success("Tarea creada correctamente.");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "No se pudo crear la tarea.")),
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: Parameters<typeof updateMemberTask>[3] }) =>
      updateMemberTask(campaignId, memberId, taskId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tasksKey });
      toast.success("Tarea actualizada correctamente.");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "No se pudo actualizar la tarea.")),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: ({ campaignId: targetCampaignId, memberId: targetMemberId, taskId }: { campaignId: string; memberId: string; taskId: string }) =>
      deleteMemberTask(targetCampaignId, targetMemberId, taskId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tasksKey });
      toast.success("Tarea eliminada correctamente.");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "No se pudo eliminar la tarea.")),
  });

  const statusMutation = useCampaignMemberStatus(leadId);
  const changeStatus = (targetMemberId: string, status: CampaignMemberStatus) => {
    statusMutation.mutate(
      { campaignId, memberId: targetMemberId, status },
      { onSuccess: () => void refreshMemberLists() },
    );
  };

  return {
    capabilities,
    interactions: adaptLeadInteractionsResponse(interactionsQuery.data),
    interactionsQuery,
    tasks: unwrapDetailList<LeadTask>(tasksQuery.data, "tasks"),
    tasksQuery,
    createInteractionMutation,
    createTaskMutation,
    updateTaskMutation,
    deleteTaskMutation,
    statusMutation,
    changeStatus,
  };
}
