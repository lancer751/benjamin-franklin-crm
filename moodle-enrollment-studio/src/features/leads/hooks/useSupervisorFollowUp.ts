import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getAllLeads } from "../services/leadService";
import { reassignCampaignMember, reassignBulkCampaignMembers } from "@/features/campaigns/services/campaignService";
import { api } from "@/core/lib/api";
import { adaptLeads, unpackLeads } from "../adapters/leadAdapter";
import { calculateSupervisorKPIs } from "../utils/leadLogic";
import { getSellers } from "@/features/users/services/userService";

export const useSupervisorFollowUp = () => {
  const queryClient = useQueryClient();

  const [activeSellerTab, setActiveSellerTab] = useState<string>("ALL");
  const [selectedLead, setSelectedLead] = useState<any>(null);

  // 1. Obtener los prospectos de la academia filtrados por el asesor activo en la base de datos
  const { data: leadsRes, isLoading: isLoadingLeads } = useQuery({
    queryKey: ["all-leads", activeSellerTab],
    queryFn: () => {
      const assignedToParam = activeSellerTab === "UNASSIGNED"
        ? "unassigned"
        : activeSellerTab === "ALL"
        ? undefined
        : activeSellerTab;

      return getAllLeads({
        ...(assignedToParam && { assigned_to: assignedToParam }),
        page: 1,
        limit: 20
      });
    },
  });

  const leads = useMemo(() => {
    const rawData = unpackLeads(leadsRes);
    return adaptLeads(rawData);
  }, [leadsRes]);

  // 1b. Obtener todos los vendedores reales
  const { data: realSellersRes } = useQuery({
    queryKey: ["real-sellers-list"],
    queryFn: getSellers,
    staleTime: 10 * 60 * 1000,
  });

  const realSellers = useMemo(() => {
    return (realSellersRes as any)?.success ? (realSellersRes as any).data : (realSellersRes || []);
  }, [realSellersRes]);

  // 2. Definir la lista de asesores usando la lista oficial de vendedores
  const sellers = useMemo(() => {
    const list = [
      {
        id: "ALL",
        name: "👥 TODOS LOS LEADS",
        email: "Vista global de prospectos",
      },
      {
        id: "UNASSIGNED",
        name: "SIN ASIGNAR ⚠️",
        email: "Prospectos entrantes sin asesor",
      },
      ...realSellers.map((seller: any) => ({
        id: seller.id,
        name: `${seller.user?.first_name || ""} ${seller.user?.last_name || ""}`.trim().toUpperCase(),
        email: seller.user?.email || "Asesor Comercial asignado",
      })),
    ];
    return list;
  }, [realSellers]);

  // Asegurar pestaña "ALL" por defecto si queda vacía
  useEffect(() => {
    if (!activeSellerTab) {
      setActiveSellerTab("ALL");
    }
  }, [activeSellerTab]);

  // 3. Mapear los prospectos devueltos al formato de miembros activos para la tabla
  const activeMembers = useMemo(() => {
    if (activeSellerTab === "ALL") {
      return leads.flatMap((lead) => {
        if (!lead.campaignsEngaging || lead.campaignsEngaging.length === 0) {
          return [
            {
              id: `unassigned-${lead.id}`,
              created_at: lead.created_at,
              status: "NEW",
              assigned_to: "UNASSIGNED",
              source: lead.phones?.[0]?.type || "WHATSAPP",
              campaing_id: lead.primary_campaign_id || "",
              campaign_id: lead.primary_campaign_id || "",
              lead,
              campaign: { id: lead.primary_campaign_id || "", name: "Bandeja de Entrada General", status: "ACTIVE" },
              campaing: { id: lead.primary_campaign_id || "", name: "Bandeja de Entrada General", status: "ACTIVE" } // Typo backward compatibility
            }
          ];
        }
        return lead.campaignsEngaging.map((member) => ({
          ...member,
          lead
        }));
      });
    }

    if (activeSellerTab === "UNASSIGNED") {
      return leads.map((lead) => ({
        id: `unassigned-${lead.id}`,
        created_at: lead.created_at,
        status: "NEW",
        assigned_to: "UNASSIGNED",
        source: lead.phones?.[0]?.type || "WHATSAPP",
        campaing_id: lead.primary_campaign_id || "",
        campaign_id: lead.primary_campaign_id || "",
        lead,
        campaign: { id: lead.primary_campaign_id || "", name: "Bandeja de Entrada General", status: "ACTIVE" },
        campaing: { id: lead.primary_campaign_id || "", name: "Bandeja de Entrada General", status: "ACTIVE" } // Typo backward compatibility
      }));
    }

    return leads.flatMap((lead) =>
      (lead.campaignsEngaging || []).map((member) => ({
        ...member,
        lead
      }))
    );
  }, [leads, activeSellerTab]);

  // Obtener interacciones del prospecto seleccionado para el Sheet lateral
  const { data: interactionsRes, isLoading: isLoadingInteractions } = useQuery({
    queryKey: ["member-interactions", selectedLead?.id],
    queryFn: async () => {
      if (!selectedLead) return null;
      const res = await api.campaigns[":campaignId"]["members"][":memberId"]["interactions"].$get({
        param: { 
          campaignId: selectedLead.campaignId || selectedLead.campaing_id || selectedLead.campaing?.id, 
          memberId: selectedLead.id 
        }
      });
      return res.json();
    },
    enabled: !!selectedLead?.id && !selectedLead.id.startsWith("unassigned-"),
  });

  // Reasignar asesor comercial mutation
  const reassignMutation = useMutation({
    mutationFn: async (newSellerId: string) => {
      if (selectedLead.id.startsWith("unassigned-")) {
        const campaignId = selectedLead.campaing_id || selectedLead.lead.primary_campaign_id;
        if (!campaignId) {
          throw new Error("El prospecto no tiene una campaña asociada.");
        }
        const res = await api.campaigns[":campaignId"].members.$post({
          param: { campaignId },
          json: {
            lead_id: selectedLead.lead.id,
            campaing_id: campaignId,
            assigned_to: newSellerId,
            source: selectedLead.lead.source || "WHATSAPP",
            is_primary: true
          }
        });
        return await res.json();
      }
      return reassignCampaignMember(
        selectedLead.campaing_id || selectedLead.campaing?.id, 
        selectedLead.id, 
        { assigned_to: newSellerId }
      );
    },
    onSuccess: (res: any) => {
      if (res.success) {
        toast.success("Prospecto reasignado al nuevo asesor comercial");
        setSelectedLead(null);
        queryClient.invalidateQueries({ queryKey: ["all-leads"] });
        queryClient.invalidateQueries({ queryKey: ["leads"] });
        queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      } else {
        toast.error(res.message || "Error al reasignar prospecto");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Error al reasignar prospecto");
    }
  });

  // Reasignar asesores de manera masiva
  const bulkReassignMutation = useMutation({
    mutationFn: async ({ campaignId, memberIds, assignedTo }: { campaignId: string; memberIds: string[]; assignedTo: string }) => {
      return reassignBulkCampaignMembers(campaignId, {
        member_ids: memberIds,
        assigned_to: assignedTo
      });
    },
    onSuccess: (res: any) => {
      if (res.success) {
        toast.success("Prospectos reasignados exitosamente al nuevo asesor comercial");
        queryClient.invalidateQueries({ queryKey: ["all-leads"] });
        queryClient.invalidateQueries({ queryKey: ["leads"] });
        queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      } else {
        toast.error(res.message || "Error al reasignar prospectos");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Error al reasignar prospectos");
    }
  });

  // Información del asesor activo
  const activeSeller = useMemo(() => {
    return sellers.find(s => s.id === activeSellerTab) || null;
  }, [sellers, activeSellerTab]);

  // KPIs dinámicos calculados desde la base de datos de leads
  const kpis = useMemo(() => {
    return calculateSupervisorKPIs(leads, sellers);
  }, [leads, sellers]);

  return {
    sellers,
    activeSellerTab,
    setActiveSellerTab,
    activeSeller,
    activeMembers,
    isLoadingLeads,
    selectedLead,
    setSelectedLead,
    interactionsRes,
    isLoadingInteractions,
    reassignMutation,
    bulkReassignMutation,
    kpis,
    realSellers,
  };
};
