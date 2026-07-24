import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  mapOrderApiError,
  updateOrder,
} from "../services/orderService";
import type { UpdateOrderPayload } from "../types";

export function useUpdateOrder(id: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: UpdateOrderPayload) => updateOrder(id, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.setQueryData(["order", id], response);
      toast.success("Orden actualizada correctamente");
      navigate(`/ordenes/${id}`);
    },
    onError: (error) => {
      console.error("Update order failed", error);
      toast.error(mapOrderApiError(error));
    },
  });
}
