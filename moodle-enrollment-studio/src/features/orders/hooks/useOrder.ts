import { useQuery } from "@tanstack/react-query";
import { getOrderById } from "../services/orderService";

export function useOrder(id?: string) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrderById(id as string),
    enabled: Boolean(id),
  });
}
