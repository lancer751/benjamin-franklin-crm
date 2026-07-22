import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { requireSuccess, unwrapDetailList } from "../adapters/leadDetailAdapter";
import type { LeadTask } from "../components/lead-detail/leadDetail.types";
import type { TaskFormData } from "../schemas/leadDetailActionSchemas";
import { createMemberTask, deleteMemberTask, getMemberTasks, updateMemberTask, type MemberTaskUpdatePayload } from "../services/leadService";

const dueDatePayload = (value: string) => value ? new Date(`${value}T12:00:00`).toISOString() : null;

export function useLeadTasks(campaignId: string, memberId: string, sellerId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["lead-tasks", campaignId, memberId] as const;
  const query = useQuery({ queryKey, queryFn: () => getMemberTasks(campaignId, memberId), enabled: Boolean(campaignId && memberId) });
  const refresh = () => queryClient.invalidateQueries({ queryKey });
  const createMutation = useMutation({
    mutationFn: async (data: TaskFormData) => {
      if (!sellerId) throw new Error("No se encontró un asesor válido para crear la tarea.");
      const response = await createMemberTask(campaignId, memberId, { ...data, due_date: dueDatePayload(data.due_date), is_done: false }, sellerId);
      requireSuccess(response, "No fue posible crear la tarea.");
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
  const updateFromForm = (task: LeadTask, data: TaskFormData, done: () => void) => {
    const payload: MemberTaskUpdatePayload = {};
    if ((task.title || "") !== data.title) payload.title = data.title;
    if ((task.content || "") !== data.content) payload.content = data.content;
    const currentDate = task.due_date ? new Date(task.due_date).toISOString().slice(0, 10) : "";
    if (currentDate !== data.due_date) payload.due_date = dueDatePayload(data.due_date);
    if (task.id && Object.keys(payload).length > 0) updateMutation.mutate({ taskId: task.id, payload }, { onSuccess: done });
    else done();
  };
  return { query, tasks: unwrapDetailList<LeadTask>(query.data, "tasks"), createMutation, updateMutation, deleteMutation, updateFromForm };
}
