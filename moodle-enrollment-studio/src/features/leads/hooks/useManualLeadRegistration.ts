import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addLeadToCampaign,
  createLead,
  lookupLeadExact,
  type LeadLookupResponse,
} from "../services/leadService";
import {
  isValidLeadEmail,
  isValidLeadPhone,
  normalizeLeadEmail,
  normalizeLeadPhone,
  type ManualLeadData,
} from "../schemas/manualLeadSchema";
import { campaignMemberKeys, leadKeys } from "../queryKeys";
import { campaignQueryKeys } from "@/features/campaigns/queryKeys";
import { sellerKeys } from "@/features/users/queryKeys";

export class ManualLeadRegistrationError extends Error {
  constructor(
    message: string,
    public readonly code?: "LEAD_IDENTITY_CONFLICT" | "LEAD_ALREADY_IN_CAMPAIGN",
  ) {
    super(message);
  }
}

interface LookupValues {
  cellphone: string;
  email: string;
}

export type LeadLookupState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "new" }
  | { status: "existing-unassigned"; leadId: string; leadName: string; matchedBy: string | null }
  | { status: "existing-in-campaign"; leadId: string; campaignMemberId: string; leadName: string; matchedBy: string | null }
  | { status: "error"; message: string };

export const interpretLeadLookup = (lookup: LeadLookupResponse): LeadLookupState => {
  if (!lookup.success) {
    return {
      status: "error",
      message: lookup.code === "LEAD_IDENTITY_CONFLICT"
        ? "El celular y el correo pertenecen a prospectos diferentes. Verifica los datos."
        : lookup.message || "No fue posible comprobar si el prospecto ya existe.",
    };
  }
  if (!lookup.data?.found) return { status: "new" };
  if (!lookup.data.lead?.id) {
    return { status: "error", message: "El lookup encontró un prospecto sin un identificador válido." };
  }
  const leadName = [lookup.data.lead.first_name, lookup.data.lead.last_name]
    .filter((value): value is string => Boolean(value))
    .join(" ") || "Prospecto sin nombre";
  const common = { leadId: lookup.data.lead.id, leadName, matchedBy: lookup.data.matchedBy };
  return lookup.data.campaign_member_id
    ? { status: "existing-in-campaign", ...common, campaignMemberId: lookup.data.campaign_member_id }
    : { status: "existing-unassigned", ...common };
};

export function useManualLeadLookup(
  values: LookupValues,
  campaignId: string,
  sellerProfileId: string | undefined,
  enabled: boolean,
) {
  const phone = normalizeLeadPhone(values.cellphone);
  const email = normalizeLeadEmail(values.email);
  const validPhone = isValidLeadPhone(phone) ? phone : undefined;
  const validEmail = isValidLeadEmail(email) ? email : undefined;
  const canLookup = Boolean(validPhone || validEmail);
  const [debouncedLookup, setDebouncedLookup] = useState<{ phone?: string; email?: string } | null>(null);
  const [isDebouncing, setIsDebouncing] = useState(false);

  useEffect(() => {
    setDebouncedLookup(null);
    if (!enabled || !campaignId || !sellerProfileId || !canLookup) {
      setIsDebouncing(false);
      return;
    }

    setIsDebouncing(true);
    const timeoutId = window.setTimeout(() => {
      setDebouncedLookup({ phone: validPhone, email: validEmail });
      setIsDebouncing(false);
    }, 450);

    return () => window.clearTimeout(timeoutId);
  }, [campaignId, sellerProfileId, enabled, canLookup, validPhone, validEmail]);

  const lookupQuery = useQuery({
    queryKey: leadKeys.lookup({
      campaignId,
      sellerProfileId: sellerProfileId ?? "",
      phone: debouncedLookup?.phone,
      email: debouncedLookup?.email,
    }),
    queryFn: ({ signal }) => lookupLeadExact({
      phone: debouncedLookup?.phone,
      email: debouncedLookup?.email,
      campaignId,
      sellerProfileId: sellerProfileId!,
    }, signal),
    enabled: Boolean(enabled && campaignId && sellerProfileId && debouncedLookup),
  });

  const lookupIsCurrent = Boolean(
    debouncedLookup
    && debouncedLookup.phone === validPhone
    && debouncedLookup.email === validEmail,
  );

  const lookup = lookupIsCurrent ? lookupQuery.data : undefined;
  const state: LeadLookupState = !canLookup
    ? { status: "idle" }
    : !lookupIsCurrent || isDebouncing || lookupQuery.isFetching
      ? { status: "loading" }
      : lookupQuery.isError
        ? { status: "error", message: lookupQuery.error instanceof Error ? lookupQuery.error.message : "No fue posible comprobar si el prospecto ya existe." }
        : lookup
          ? interpretLeadLookup(lookup)
          : { status: "idle" };

  return {
    lookup,
    state,
    isSearching: canLookup && (!lookupIsCurrent || isDebouncing || lookupQuery.isFetching),
    isLookupError: lookupQuery.isError,
    canLookup,
  };
}

const getExistingLead = (lookup: LeadLookupResponse) => {
  if (!lookup.success && lookup.code === "LEAD_IDENTITY_CONFLICT") {
    throw new ManualLeadRegistrationError(
      "El celular y el correo pertenecen a prospectos diferentes. Verifica los datos.",
      "LEAD_IDENTITY_CONFLICT",
    );
  }
  if (lookup.data?.campaign_member_id) {
    throw new ManualLeadRegistrationError(
      "Este prospecto ya está registrado en esta campaña.",
      "LEAD_ALREADY_IN_CAMPAIGN",
    );
  }
  return lookup.data?.found ? lookup.data.lead : null;
};

export function useManualLeadRegistration(
  campaignId: string,
  sellerProfileId: string | undefined,
  assignedUserId: string | undefined,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ManualLeadData & { dni?: string }) => {
      if (!sellerProfileId || !assignedUserId) {
        throw new Error("No se identificó al asesor de ventas.");
      }
      if (!campaignId) throw new Error("No hay una campaña activa seleccionada.");

      const lookupArgs = {
        phone: data.cellphone,
        email: data.email,
        campaignId,
        sellerProfileId,
      };
      let existingLead = getExistingLead(await lookupLeadExact(lookupArgs));
      let leadId = existingLead?.id;
      let mode: "created" | "linked" = existingLead ? "linked" : "created";

      if (!leadId) {
        const leadResponse = await createLead({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          dni: data.dni,
          phones: [{ number: data.cellphone, type: "WHATSAPP", isPrincipal: true }],
          lead_status: "ACTIVE",
          gender: "NOT_SPECIFIED",
        } as any) as any;

        if (leadResponse.success && leadResponse.data?.id) {
          leadId = leadResponse.data.id;
        } else {
          const errorMessage = String(leadResponse.error || leadResponse.message || "");
          if (!errorMessage.includes("Email or principal phone number is already registered")) {
            throw new Error(errorMessage || "Error al crear los datos base del prospecto.");
          }

          existingLead = getExistingLead(await lookupLeadExact(lookupArgs));
          if (!existingLead?.id) {
            throw new Error("El prospecto ya existe, pero no fue posible recuperarlo de forma segura.");
          }
          leadId = existingLead.id;
          mode = "linked";
        }
      }

      const memberResponse = await addLeadToCampaign(campaignId, {
        lead_id: leadId,
        campaing_id: campaignId,
        assigned_to: assignedUserId,
        source: "WHATSAPP",
        is_primary: true,
      } as any) as any;

      if (!memberResponse.success) {
        if (memberResponse.code === "LEAD_ALREADY_IN_CAMPAIGN") {
          throw new ManualLeadRegistrationError(
            "Este prospecto ya está registrado en esta campaña.",
            "LEAD_ALREADY_IN_CAMPAIGN",
          );
        }
        throw new Error(memberResponse.message || memberResponse.error || "Error al asociar el prospecto a la campaña.");
      }

      return { mode, member: memberResponse.data };
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: campaignMemberKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: leadKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: campaignQueryKeys.detail(campaignId) }),
        queryClient.invalidateQueries({ queryKey: sellerKeys.details() }),
      ]);
    },
  });
}
