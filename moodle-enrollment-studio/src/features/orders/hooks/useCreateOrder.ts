import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  createOrder,
  mapOrderApiError,
} from "../services/orderService";
import type { CreateOrderPayload } from "../types";
import { orderQueryKeys } from "../queryKeys";

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => createOrder(payload),
    onSuccess: async (response) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: orderQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: ["lead"] }),
        queryClient.invalidateQueries({ queryKey: ["campaign-members"] }),
        queryClient.invalidateQueries({ queryKey: ["seller-detail"] }),
        queryClient.invalidateQueries({ queryKey: ["team-follow-up"] }),
        queryClient.invalidateQueries({ queryKey: orderQueryKeys.leadContexts() }),
      ]);
      queryClient.setQueryData(orderQueryKeys.detail(response.data.id), response);
      toast.success("Orden creada correctamente");
      navigate(`/ordenes/${response.data.id}`);
    },
    onError: (error) => {
      toast.error(mapOrderApiError(error));
    },
  });
}
