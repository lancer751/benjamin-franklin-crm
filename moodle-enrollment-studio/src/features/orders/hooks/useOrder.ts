import { useQuery } from "@tanstack/react-query";
import { getOrderById } from "../services/orderService";
import { orderQueryKeys } from "../queryKeys";

export function useOrder(id?: string) {
  return useQuery({
    queryKey: orderQueryKeys.detail(id ?? ""),
    queryFn: () => getOrderById(id as string),
    enabled: Boolean(id),
  });
}
