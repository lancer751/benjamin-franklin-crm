import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { requireSuccess } from "../adapters/leadDetailAdapter";
import { deleteLead } from "../services/leadService";
import { leadKeys } from "../queryKeys";

export function useDeleteLead(leadId: string) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await deleteLead(leadId);
      requireSuccess(response, "No fue posible eliminar el prospecto.");
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      toast.success("Prospecto eliminado correctamente.");
      navigate("/prospectos");
    },
  });
}
