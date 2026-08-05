import { useQuery } from "@tanstack/react-query";
import { getLeadById } from "@/features/leads/services/leadService";
import { adaptLeadToOrderContext } from "../services/orderLeadContextAdapter";
import { orderQueryKeys } from "../queryKeys";

export function useOrderLeadContext(leadId: string) {
  return useQuery({
    queryKey: orderQueryKeys.leadContext(leadId),
    queryFn: async () => {
      const response = await getLeadById(leadId);
      const context = adaptLeadToOrderContext(response);
      if (!context) {
        throw new Error("Invalid lead detail response");
      }
      return context;
    },
    enabled: Boolean(leadId),
    retry: false,
  });
}
