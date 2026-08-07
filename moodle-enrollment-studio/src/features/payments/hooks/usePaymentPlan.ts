import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { orderQueryKeys } from "@/features/orders/queryKeys";
import { paymentPlanKeys } from "../queryKeys";
import { mapPaymentApiError } from "../services/paymentService";
import {
  createPaymentSchedule,
  deletePaymentSchedule,
  type PaymentSchedulePayload,
  updatePaymentSchedule,
} from "../services/paymentPlanService";

function useInvalidateSchedule(orderId: string, detailId: string) {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: orderQueryKeys.detail(orderId) });
    void queryClient.invalidateQueries({ queryKey: paymentPlanKeys.detail(orderId, detailId) });
  };
}

export function useSavePaymentSchedule(orderId: string, detailId: string, editing: boolean) {
  const invalidate = useInvalidateSchedule(orderId, detailId);
  return useMutation({
    mutationFn: (payload: PaymentSchedulePayload) => editing
      ? updatePaymentSchedule(orderId, detailId, payload)
      : createPaymentSchedule(orderId, detailId, payload),
    onSuccess: () => { invalidate(); toast.success(editing ? "Cronograma actualizado." : "Cronograma creado."); },
    onError: (error) => toast.error(mapPaymentApiError(error)),
  });
}

export function useDeletePaymentSchedule(orderId: string, detailId: string) {
  const invalidate = useInvalidateSchedule(orderId, detailId);
  return useMutation({
    mutationFn: () => deletePaymentSchedule(orderId, detailId),
    onSuccess: () => { invalidate(); toast.success("Cronograma cancelado."); },
    onError: (error) => toast.error(mapPaymentApiError(error)),
  });
}
