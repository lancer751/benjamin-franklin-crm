import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  mapOrderApiError,
  updateOrder,
} from "../services/orderService";
import type { UpdateOrderPayload } from "../types";
import { orderQueryKeys } from "../queryKeys";

export function useUpdateOrder(id: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: UpdateOrderPayload) => updateOrder(id, payload),
    onSuccess: async (response) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: orderQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: ["payments"] }),
        queryClient.invalidateQueries({ queryKey: ["seller-detail"] }),
        queryClient.invalidateQueries({ queryKey: ["team-follow-up"] }),
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
