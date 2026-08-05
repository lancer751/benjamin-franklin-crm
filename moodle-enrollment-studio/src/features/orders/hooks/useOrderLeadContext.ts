import { useQuery } from "@tanstack/react-query";
import { getLeadById } from "@/features/leads/services/leadService";
import {
  adaptLeadToOrderContext,
  filterOrderLeadContextByAssignee,
} from "../services/orderLeadContextAdapter";
import { orderQueryKeys } from "../queryKeys";

export function useOrderLeadContext(leadId: string, assignedTo?: string) {
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
    select: (context) => filterOrderLeadContextByAssignee(context, assignedTo),
    enabled: Boolean(leadId),
    retry: false,
  });
}
