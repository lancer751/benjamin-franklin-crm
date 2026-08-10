import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  mapOrderApiError,
  updateOrder,
} from "../services/orderService";
import type { UpdateOrderPayload } from "../types";
import { orderQueryKeys } from "../queryKeys";
import { paymentsKeys } from "@/features/payments/queryKeys";
import { campaignMemberKeys, leadKeys } from "@/features/leads/queryKeys";
import { sellerKeys } from "@/features/users/queryKeys";

export function useUpdateOrder(id: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: UpdateOrderPayload) => updateOrder(id, payload),
    onSuccess: async (response) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: orderQueryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: paymentsKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: sellerKeys.details() }),
        queryClient.invalidateQueries({ queryKey: leadKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: campaignMemberKeys.lists() }),
      ]);
      queryClient.setQueryData(orderQueryKeys.detail(id), response);
      toast.success("Orden actualizada correctamente");
      navigate(`/ordenes/${id}`);
    },
    onError: (error) => {
      toast.error(mapOrderApiError(error));
    },
  });
}
