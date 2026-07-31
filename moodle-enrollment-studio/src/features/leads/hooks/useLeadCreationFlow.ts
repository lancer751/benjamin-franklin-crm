import { useEffect, useMemo, useState } from "react";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, type UseFormReturn } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { getCampaigns } from "@/features/campaigns/services/campaignService";
import { getSellerCampaigns } from "@/features/users/services/userService";
import {
  addLeadToCampaign,
  createLead,
  createMemberInteraction,
  lookupLeadExact,
  type LeadLookupResponse,
} from "../services/leadService";
import { useManualLeadLookup } from "./useManualLeadRegistration";
import { mapInteractionFormToPayload } from "../utils/leadActionPayloadMappers";
import {
  adaptAllowedCampaigns,
  adaptSellerCampaigns,
  buildCreateLeadPayload,
} from "../adapters/leadQuickFormAdapter";
import {
  defaultLeadQuickFormValues,
  leadQuickFormSchema,
  type LeadQuickFormData,
  type LeadQuickFormInput,
} from "../schemas/leadQuickFormSchema";

interface PartialProgress {
  leadId: string;
  memberId?: string;
}

export type LeadQuickFormApi = UseFormReturn<LeadQuickFormInput, unknown, LeadQuickFormData>;

const isConflictLookup = (lookup?: LeadLookupResponse) => (
  lookup?.success === false && lookup.code === "LEAD_IDENTITY_CONFLICT"
);

const duplicateLeadMessage = (message: string) => (
  /already registered|ya (?:está|existe)|unique|duplicad/i.test(message)
);

export function useLeadCreationFlow() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const role = user?.role?.name ?? "";
  const isSalesRep = role === "SALES_REP";
  const canChooseSeller = role === "ADMIN" || role === "SALES_SUPERVISOR" || role === "MARKETING";
  const authenticatedSellerProfileId = user?.seller?.id || "";
  const authenticatedUserId = user?.id || "";
  const [partialProgress, setPartialProgress] = useState<PartialProgress | null>(null);
  const [flowError, setFlowError] = useState("");

  const form = useForm<LeadQuickFormInput, unknown, LeadQuickFormData>({
    resolver: standardSchemaResolver(leadQuickFormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: defaultLeadQuickFormValues,
  });

  const values = form.watch();
  const campaignId = values.campaignId;
  const selectedAssignedUserId = isSalesRep ? authenticatedUserId : values.sellerId;

  const sellerCampaignsQuery = useQuery({
    queryKey: ["seller-campaigns", authenticatedSellerProfileId],
    queryFn: () => getSellerCampaigns(authenticatedSellerProfileId),
    enabled: isSalesRep && Boolean(authenticatedSellerProfileId),
  });
  const allowedCampaignsQuery = useQuery({
    queryKey: ["campaigns", "lead-quick-form", 1, 100],
    queryFn: () => getCampaigns({ page: "1", limit: "100" }),
    enabled: Boolean(user) && !isSalesRep,
  });

  const campaigns = useMemo(
    () => isSalesRep
      ? adaptSellerCampaigns(sellerCampaignsQuery.data)
      : adaptAllowedCampaigns(allowedCampaignsQuery.data),
    [allowedCampaignsQuery.data, isSalesRep, sellerCampaignsQuery.data],
  );
  const selectedCampaign = campaigns.find((campaign) => campaign.id === campaignId);
  const sellerOptions = canChooseSeller ? selectedCampaign?.sellers || [] : [];

  useEffect(() => {
    if (isSalesRep && authenticatedUserId) {
      form.setValue("sellerId", authenticatedUserId);
    }
  }, [authenticatedUserId, form, isSalesRep]);

  useEffect(() => {
    setPartialProgress(null);
    setFlowError("");
  }, [campaignId, selectedAssignedUserId, values.cellphone, values.email]);

  const selectedSeller = sellerOptions.find((seller) => seller.userId === selectedAssignedUserId);
  const selectedSellerProfileId = isSalesRep
    ? authenticatedSellerProfileId
    : selectedSeller?.sellerProfileId || "";

  const lookupState = useManualLeadLookup(
    { cellphone: values.cellphone, email: values.email },
    campaignId,
    selectedSellerProfileId,
    Boolean(campaignId && selectedSellerProfileId),
  );
  const lookup = lookupState.lookup;
  const hasIdentityConflict = isConflictLookup(lookup);
  const existingLead = lookup?.success && lookup.data?.found ? lookup.data.lead : null;
  const existingMemberId = lookup?.success ? lookup.data?.campaign_member_id || null : null;

  const registrationMutation = useMutation({
    mutationFn: async (data: LeadQuickFormData) => {
      const assignedUserId = isSalesRep ? authenticatedUserId : data.sellerId;
      const sellerProfileId = isSalesRep
        ? authenticatedSellerProfileId
        : sellerOptions.find((seller) => seller.userId === assignedUserId)?.sellerProfileId || "";
      if (!assignedUserId || !sellerProfileId) {
        throw new Error("Selecciona un asesor asignado a la campaña.");
      }

      const lookupArgs = {
        phone: data.cellphone,
        email: data.email,
        campaignId: data.campaignId,
        sellerProfileId,
      };
      const currentLookup = await lookupLeadExact(lookupArgs);
      if (isConflictLookup(currentLookup)) {
        throw new Error("El celular y el correo pertenecen a prospectos diferentes. Verifica los datos.");
      }

      let leadId = partialProgress?.leadId || currentLookup.data?.lead?.id;
      let memberId = partialProgress?.memberId || currentLookup.data?.campaign_member_id || undefined;
      let createdThisAttempt = false;

      if (!leadId) {
        let leadResponse: {
          success?: boolean;
          data?: { id?: string };
          message?: string;
          error?: string;
        } | undefined;
        try {
          const payload = buildCreateLeadPayload(data) as Parameters<typeof createLead>[0];
          leadResponse = await createLead(payload) as unknown as typeof leadResponse;
        } catch {
          const recoveredLookup = await lookupLeadExact(lookupArgs);
          if (recoveredLookup.data?.lead?.id) {
            leadId = recoveredLookup.data.lead.id;
            memberId = recoveredLookup.data.campaign_member_id || undefined;
          } else {
            throw new Error("No se pudo crear el prospecto.");
          }
        }
        if (leadResponse?.success && leadResponse.data?.id) {
          leadId = leadResponse.data.id;
          createdThisAttempt = true;
        } else if (!leadId) {
          const message = leadResponse?.message || leadResponse?.error || "No se pudo crear el prospecto.";
          if (!duplicateLeadMessage(message)) throw new Error(message);
          const recoveredLookup = await lookupLeadExact(lookupArgs);
          if (isConflictLookup(recoveredLookup) || !recoveredLookup.data?.lead?.id) {
            throw new Error("El prospecto ya existe, pero no fue posible recuperarlo de forma segura.");
          }
          leadId = recoveredLookup.data.lead.id;
          memberId = recoveredLookup.data.campaign_member_id || undefined;
        }
      }

      if (!memberId) {
        let memberResponse: { success?: boolean; data?: { id?: string }; message?: string; error?: string } | undefined;
        try {
          memberResponse = await addLeadToCampaign(data.campaignId, {
            lead_id: leadId,
            campaing_id: data.campaignId,
            assigned_to: assignedUserId,
            source: data.source,
            is_primary: true,
          }) as typeof memberResponse;
        } catch {
          const recoveredLookup = await lookupLeadExact(lookupArgs);
          memberId = recoveredLookup.data?.campaign_member_id || undefined;
        }

        if (memberResponse?.success && memberResponse.data?.id) {
          memberId = memberResponse.data.id;
        } else if (!memberId) {
          const recoveredLookup = await lookupLeadExact(lookupArgs);
          memberId = recoveredLookup.data?.campaign_member_id || undefined;
          if (!memberId) {
            setPartialProgress({ leadId });
            throw new Error(createdThisAttempt
              ? "El prospecto fue creado, pero no se pudo asociar a la campaña."
              : memberResponse?.message || memberResponse?.error || "No se pudo asociar el prospecto a la campaña.");
          }
        }
      }

      try {
        const interactionPayload = mapInteractionFormToPayload({
          notes: data.notes,
          type: data.interactionType,
        });
        const interactionResponse = await createMemberInteraction(
          data.campaignId,
          memberId,
          interactionPayload.notes,
          interactionPayload.type,
          authenticatedUserId,
        ) as { success?: boolean };
        if (!interactionResponse.success) throw new Error("Interaction request failed");
      } catch {
        setPartialProgress({ leadId, memberId });
        throw new Error("El prospecto fue registrado y asociado a la campaña, pero no se pudo guardar la interacción inicial.");
      }

      return { leadId, memberId };
    },
    onMutate: () => setFlowError(""),
    onError: (error) => setFlowError(error instanceof Error ? error.message : "No se pudo registrar el prospecto."),
    onSuccess: async ({ leadId }) => {
      setPartialProgress(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["leads"] }),
        queryClient.invalidateQueries({ queryKey: ["campaign-members", campaignId] }),
        queryClient.invalidateQueries({ queryKey: ["campaign-members-seller", campaignId, selectedSellerProfileId] }),
        queryClient.invalidateQueries({ queryKey: ["lead", leadId] }),
      ]);
      toast.success("Prospecto registrado correctamente.");
      navigate(`/prospectos/${leadId}`);
    },
  });

  const schemaIsValid = leadQuickFormSchema.safeParse(values).success;
  const sellerIsValid = isSalesRep
    ? Boolean(authenticatedUserId && authenticatedSellerProfileId)
    : Boolean(values.sellerId && sellerOptions.some((seller) => seller.userId === values.sellerId));
  const canSubmit = schemaIsValid
    && sellerIsValid
    && !hasIdentityConflict
    && !lookupState.isSearching
    && !registrationMutation.isPending;
  const actionLabel = partialProgress?.memberId
    ? "Reintentar interacción"
    : existingMemberId
      ? "Registrar interacción"
      : existingLead
        ? "Añadir a campaña"
        : "Registrar prospecto";

  return {
    form,
    role,
    isSalesRep,
    canChooseSeller,
    campaigns,
    sellerOptions,
    isLoadingCampaigns: isSalesRep ? sellerCampaignsQuery.isLoading : allowedCampaignsQuery.isLoading,
    campaignError: isSalesRep ? sellerCampaignsQuery.isError : allowedCampaignsQuery.isError,
    lookup,
    existingLead,
    existingMemberId,
    hasIdentityConflict,
    isSearching: lookupState.isSearching,
    isLookupError: lookupState.isLookupError,
    hasLookupCriteria: lookupState.canLookup,
    flowError,
    actionLabel,
    canSubmit,
    isPending: registrationMutation.isPending,
    hasPartialInteraction: Boolean(partialProgress?.memberId),
    setCampaign: (id: string) => {
      form.setValue("campaignId", id, { shouldValidate: true });
      if (!isSalesRep) form.setValue("sellerId", "", { shouldValidate: true });
    },
    submit: form.handleSubmit((data) => registrationMutation.mutate(data)),
    cancel: () => navigate("/prospectos"),
  };
}

export type LeadCreationController = ReturnType<typeof useLeadCreationFlow>;
