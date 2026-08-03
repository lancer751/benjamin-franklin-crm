import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  createOrder,
  mapOrderApiError,
} from "../services/orderService";
import type { CreateOrderPayload } from "../types";

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => createOrder(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.setQueryData(["order", response.data.id], response);
      toast.success("Orden creada correctamente");
      navigate(`/ordenes/${response.data.id}`);
    },
    onError: (error) => {
      console.error("Create order failed", error);
      toast.error(mapOrderApiError(error));
    },
  });
}
