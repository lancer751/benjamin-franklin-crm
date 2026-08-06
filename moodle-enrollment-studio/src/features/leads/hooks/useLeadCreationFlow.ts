import { useEffect, useMemo, useState } from "react";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, type UseFormReturn } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { getCampaignById, getCampaigns } from "@/features/campaigns/services/campaignService";
import { getSellerCampaigns, getSellers } from "@/features/users/services/userService";
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
  type LeadQuickCampaignOption,
  type LeadQuickSellerOption,
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
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const role = user?.role?.name ?? "";
  const isSalesRep = role === "SALES_REP";
  const canChooseSeller = role === "ADMIN"
    || role === "SALES_SUPERVISOR"
    || role === "SUPERVISOR"
    || role === "MARKETING";
  const authenticatedSellerProfileId = user?.seller?.id || "";
  const authenticatedUserId = user?.id || "";

  const urlCampaignId = searchParams.get("campaignId")?.trim() || "";
  const rawReturnTo = searchParams.get("returnTo")?.trim() || "";
  const safeReturnTo = rawReturnTo.startsWith("/") && !rawReturnTo.startsWith("//") ? rawReturnTo : "";
  const isContextualMode = Boolean(urlCampaignId);

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

  // Contextual Campaign Fetch
  const contextualCampaignQuery = useQuery({
    queryKey: ["campaign", urlCampaignId],
    queryFn: () => getCampaignById(urlCampaignId),
    enabled: isContextualMode && Boolean(user),
  });

  const contextualCampaignData = useMemo(() => {
    if (!contextualCampaignQuery.data) return null;
    const res = contextualCampaignQuery.data as Record<string, unknown>;
    return (res.data as Record<string, unknown>) || res;
  }, [contextualCampaignQuery.data]);

  const contextualCampaignName = useMemo(() => {
    if (!contextualCampaignData) return "Campaña";
    return (contextualCampaignData.name as string) || "Campaña";
  }, [contextualCampaignData]);

  const contextualSellers: LeadQuickSellerOption[] = useMemo(() => {
    if (!contextualCampaignData || !Array.isArray(contextualCampaignData.sellersOnCampaign)) return [];
    return contextualCampaignData.sellersOnCampaign.flatMap((cs: unknown) => {
      if (typeof cs !== "object" || cs === null) return [];
      const assignment = cs as Record<string, unknown>;
      const seller = typeof assignment.seller === "object" && assignment.seller !== null
        ? (assignment.seller as Record<string, unknown>)
        : {};
      const userObj = typeof seller.user === "object" && seller.user !== null
        ? (seller.user as Record<string, unknown>)
        : {};
      if (userObj.is_active === false) return [];
      const userId = typeof userObj.id === "string" ? userObj.id : typeof seller.user_id === "string" ? seller.user_id : "";
      const sellerProfileId = typeof assignment.seller_id === "string" ? assignment.seller_id : typeof seller.id === "string" ? seller.id : "";
      if (!userId || !sellerProfileId) return [];
      const firstName = typeof userObj.first_name === "string" ? userObj.first_name : "";
      const lastName = typeof userObj.last_name === "string" ? userObj.last_name : "";
      const name = `${firstName} ${lastName}`.trim() || "Asesor sin nombre";
      return [{ userId, sellerProfileId, name }];
    }).sort((first, second) => first.name.localeCompare(second.name, "es"));
  }, [contextualCampaignData]);

  // Global Queries (only if not in contextual mode)
  const sellerCampaignsQuery = useQuery({
    queryKey: ["seller-campaigns", authenticatedSellerProfileId],
    queryFn: () => getSellerCampaigns(authenticatedSellerProfileId),
    enabled: !isContextualMode && isSalesRep && Boolean(authenticatedSellerProfileId),
  });
  const allowedCampaignsQuery = useQuery({
    queryKey: ["campaigns", "lead-quick-form", 1, 100],
    queryFn: () => getCampaigns({ page: "1", limit: "100" }),
    enabled: !isContextualMode && Boolean(user) && !isSalesRep,
  });
  const sellersQuery = useQuery({
    queryKey: ["users", "sellers", "campaign-assignment"],
    queryFn: getSellers,
    enabled: !isContextualMode && Boolean(user) && canChooseSeller && !isSalesRep,
  });

  const campaigns = useMemo<LeadQuickCampaignOption[]>(() => {
    if (isContextualMode) {
      return [{
        id: urlCampaignId,
        name: contextualCampaignName,
        platform: "",
        sellers: contextualSellers,
      }];
    }
    return isSalesRep
      ? adaptSellerCampaigns(sellerCampaignsQuery.data)
      : adaptAllowedCampaigns(allowedCampaignsQuery.data, sellersQuery.data);
  }, [allowedCampaignsQuery.data, isContextualMode, isSalesRep, sellerCampaignsQuery.data, sellersQuery.data, urlCampaignId, contextualCampaignName, contextualSellers]);

  const selectedCampaign = campaigns.find((campaign) => campaign.id === campaignId);

  const sellerOptions = useMemo<LeadQuickSellerOption[]>(() => {
    if (isContextualMode) return contextualSellers;
    return canChooseSeller ? selectedCampaign?.sellers || [] : [];
  }, [canChooseSeller, isContextualMode, contextualSellers, selectedCampaign?.sellers]);

  const isLoadingSellers = isContextualMode
    ? contextualCampaignQuery.isLoading
    : (canChooseSeller && Boolean(campaignId) && (allowedCampaignsQuery.isLoading || sellersQuery.isLoading));

  const sellerOptionsError = isContextualMode
    ? (contextualCampaignQuery.isError || (!contextualCampaignQuery.isLoading && !contextualCampaignData))
    : (canChooseSeller && Boolean(campaignId) && (allowedCampaignsQuery.isError || sellersQuery.isError));

  // Initialize campaign value in contextual mode
  useEffect(() => {
    if (urlCampaignId) {
      form.setValue("campaignId", urlCampaignId, { shouldValidate: true });
    }
  }, [urlCampaignId, form]);

  useEffect(() => {
    if (isSalesRep && authenticatedUserId) {
      form.setValue("sellerId", authenticatedUserId, { shouldValidate: true });
    }
  }, [authenticatedUserId, form, isSalesRep]);

  // Contextual single seller auto-selection & validation
  useEffect(() => {
    if (isContextualMode && !contextualCampaignQuery.isLoading && canChooseSeller && !isSalesRep) {
      if (contextualSellers.length === 1) {
        const singleSeller = contextualSellers[0];
        if (form.getValues("sellerId") !== singleSeller.userId) {
          form.setValue("sellerId", singleSeller.userId, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }
        form.clearErrors("sellerId");
        return;
      }
      if (contextualSellers.length > 1) {
        const currentSellerId = form.getValues("sellerId") || "";
        if (currentSellerId && !contextualSellers.some((seller) => seller.userId === currentSellerId)) {
          form.setValue("sellerId", "", { shouldDirty: true });
          form.clearErrors("sellerId");
        }
      }
      return;
    }

    if (!isContextualMode && canChooseSeller && campaignId && !isLoadingSellers && !sellerOptionsError) {
      const currentSellerId = form.getValues("sellerId") || "";
      if (sellerOptions.length === 1) {
        const onlySeller = sellerOptions[0];
        if (currentSellerId !== onlySeller.userId) {
          form.setValue("sellerId", onlySeller.userId, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }
        form.clearErrors("sellerId");
        return;
      }
      if (currentSellerId && !sellerOptions.some((seller) => seller.userId === currentSellerId)) {
        form.setValue("sellerId", "", { shouldDirty: true });
        form.clearErrors("sellerId");
      }
    }
  }, [campaignId, canChooseSeller, contextualCampaignQuery.isLoading, contextualSellers, form, isContextualMode, isLoadingSellers, isSalesRep, sellerOptions, sellerOptionsError]);

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
      const targetCampaignId = campaignId || urlCampaignId;
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["leads"] }),
        queryClient.invalidateQueries({ queryKey: ["all-leads"] }),
        queryClient.invalidateQueries({ queryKey: ["campaign-members", targetCampaignId] }),
        queryClient.invalidateQueries({ queryKey: ["team-follow-up", "campaign-members", targetCampaignId] }),
        queryClient.invalidateQueries({ queryKey: ["campaign-members-seller", targetCampaignId, selectedSellerProfileId] }),
        queryClient.invalidateQueries({ queryKey: ["campaign", targetCampaignId] }),
        queryClient.invalidateQueries({ queryKey: ["campaigns"] }),
        queryClient.invalidateQueries({ queryKey: ["lead", leadId] }),
      ]);
      toast.success("Prospecto registrado correctamente.");
      if (safeReturnTo) {
        navigate(safeReturnTo);
      } else if (isContextualMode && targetCampaignId) {
        navigate(`/campanas/${targetCampaignId}`);
      } else {
        navigate(`/prospectos/${leadId}`);
      }
    },
  });

  const schemaIsValid = leadQuickFormSchema.safeParse(values).success;
  const sellerIsValid = isSalesRep
    ? Boolean(authenticatedUserId && authenticatedSellerProfileId)
    : Boolean(values.sellerId && sellerOptions.some((seller) => seller.userId === values.sellerId));
  const canSubmit = schemaIsValid
    && sellerIsValid
    && !isLoadingSellers
    && !sellerOptionsError
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
    isContextualMode,
    contextualCampaignName,
    safeReturnTo,
    campaigns,
    sellerOptions,
    isLoadingSellers,
    sellerOptionsError,
    isLoadingCampaigns: isContextualMode ? contextualCampaignQuery.isLoading : (isSalesRep ? sellerCampaignsQuery.isLoading : allowedCampaignsQuery.isLoading),
    campaignError: isContextualMode ? contextualCampaignQuery.isError : (isSalesRep ? sellerCampaignsQuery.isError : allowedCampaignsQuery.isError),
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
      form.setValue("campaignId", id, { shouldDirty: true, shouldValidate: true });
      if (!isSalesRep && !isContextualMode) {
        form.setValue("sellerId", "", { shouldDirty: true });
        form.clearErrors("sellerId");
      }
    },
    submit: form.handleSubmit((data) => registrationMutation.mutate(data)),
    cancel: () => {
      if (safeReturnTo) {
        navigate(safeReturnTo);
      } else if (isContextualMode && urlCampaignId) {
        navigate(`/campanas/${urlCampaignId}`);
      } else {
        navigate("/prospectos");
      }
    },
  };
}

export type LeadCreationController = ReturnType<typeof useLeadCreationFlow>;
