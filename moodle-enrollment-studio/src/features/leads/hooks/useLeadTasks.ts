import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { requireSuccess, taskDateInput, unwrapDetailList } from "../adapters/leadDetailAdapter";
import type { LeadTask } from "../components/lead-detail/leadDetail.types";
import type { TaskFormValues } from "../schemas/taskFormSchema";
import { createMemberTask, deleteMemberTask, getMemberTasks, updateMemberTask, type MemberTaskUpdatePayload } from "../services/leadService";
import { mapTaskFormToPayload } from "../utils/leadActionPayloadMappers";

export function useLeadTasks(campaignId: string, memberId: string, creatorUserId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["lead-tasks", campaignId, memberId] as const;
  const query = useQuery({ queryKey, queryFn: () => getMemberTasks(campaignId, memberId), enabled: Boolean(campaignId && memberId) });
  const refresh = () => queryClient.invalidateQueries({ queryKey });
  const createMutation = useMutation({
    mutationFn: async (data: TaskFormValues) => {
      if (!creatorUserId) throw new Error("No se encontró el identificador del usuario autenticado.");
      const payload = mapTaskFormToPayload(data);
      const response = await createMemberTask(campaignId, memberId, payload, creatorUserId);
      requireSuccess(response, "No se pudo crear la tarea. Inténtalo nuevamente.");
    },
    onSuccess: async () => { await refresh(); toast.success("Tarea creada correctamente."); },
  });
  const updateMutation = useMutation({
    mutationFn: async ({ taskId, payload }: { taskId: string; payload: MemberTaskUpdatePayload }) => {
      const response = await updateMemberTask(campaignId, memberId, taskId, payload);
      requireSuccess(response, "No fue posible actualizar la tarea.");
    },
    onSuccess: async () => { await refresh(); toast.success("Tarea actualizada correctamente."); },
  });
  const deleteMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await deleteMemberTask(campaignId, memberId, taskId);
      requireSuccess(response, "No fue posible eliminar la tarea.");
    },
    onSuccess: async () => { await refresh(); toast.success("Tarea eliminada correctamente."); },
  });
  const updateFromForm = (task: LeadTask, data: TaskFormValues, done: () => void) => {
    const mapped = mapTaskFormToPayload(data);
    const payload: MemberTaskUpdatePayload = {};
    if ((task.title || "") !== mapped.title) payload.title = mapped.title;
    if ((task.content || "") !== mapped.content) payload.content = mapped.content;
    const currentDate = taskDateInput(task.due_date);
    if (currentDate !== data.due_date) payload.due_date = mapped.due_date;
    if (task.id && Object.keys(payload).length > 0) updateMutation.mutate({ taskId: task.id, payload }, { onSuccess: done });
    else done();
  };
  return { query, tasks: unwrapDetailList<LeadTask>(query.data, "tasks"), createMutation, updateMutation, deleteMutation, updateFromForm };
}
