import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, Users } from "lucide-react";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import CampaignForm from "../components/CampaignForm";
import { getSellers } from "@/features/users/services/userService";
import { toast } from "sonner";
import ModalWrapper from "@/core/components/ModalWrapper";
import { useCampaignDetail } from "../hooks/useCampaignDetail";
import { CampaignDetailHeader } from "../components/CampaignDetailHeader";
import { CampaignDetailStats } from "../components/CampaignDetailStats";
import { CampaignRelationsGrid } from "../components/CampaignRelationsGrid";
import { CampaignSellersTable } from "../components/CampaignSellersTable";

interface AssignSellersModalProps {
  open: boolean;
  onClose: () => void;
  campaignId: string;
  assignedSellerIds: string[];
  assignMutation: any;
}

const AssignSellersModal = ({
  open,
  onClose,
  campaignId,
  assignedSellerIds,
  assignMutation,
}: AssignSellersModalProps) => {
  const [selectedSellerIds, setSelectedSellerIds] = useState<string[]>([]);

  // Obtener todos los asesores disponibles en el sistema
  const { data: sellersRes, isLoading } = useQuery({
    queryKey: ["sellers"],
    queryFn: getSellers,
    enabled: open,
  });

  const sellers = sellersRes?.success ? sellersRes.data : [];

  const handleToggleSeller = (sellerId: string) => {
    setSelectedSellerIds((prev) =>
      prev.includes(sellerId)
        ? prev.filter((id) => id !== sellerId)
        : [...prev, sellerId]
    );
  };

  const handleSave = () => {
    if (selectedSellerIds.length === 0) {
      toast.warning("Por favor, selecciona al menos un asesor para asignar.");
      return;
    }
    assignMutation.mutate(selectedSellerIds, {
      onSuccess: (res: any) => {
        if (res?.success) {
          setSelectedSellerIds([]);
          onClose();
        }
      },
    });
  };

  const footer = (
    <div className="flex gap-2">
      <Button variant="ghost" onClick={onClose} disabled={assignMutation.isPending}>
        Cancelar
      </Button>
      <Button
        onClick={handleSave}
        disabled={assignMutation.isPending || selectedSellerIds.length === 0}
      >
        {assignMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Asignando...
          </>
        ) : (
          "Asignar"
        )}
      </Button>
    </div>
  );

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title="Asignar Asesores de Ventas"
      subtitle="Selecciona los asesores que deseas incorporar a esta campaña para atender el flujo de leads."
      icon={<UserPlusIcon />}
      footer={footer}
      maxWidth="max-w-md"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span>Cargando asesores disponibles...</span>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="max-h-60 overflow-y-auto border border-border p-3.5 rounded-xl bg-slate-50/20 divide-y divide-border">
            {sellers.map((seller: any) => {
              const isAlreadyAssigned = assignedSellerIds.includes(seller.id);
              const isChecked = selectedSellerIds.includes(seller.id) || isAlreadyAssigned;
              const sellerName = seller.user
                ? `${seller.user.first_name || ""} ${seller.user.last_name || ""}`.trim()
                : `Asesor ${seller.id.slice(0, 4)}`;

              return (
                <label
                  key={seller.id}
                  className={`flex items-center justify-between py-2.5 first:pt-0 last:pb-0 text-sm select-none cursor-pointer ${
                    isAlreadyAssigned ? "opacity-60 cursor-not-allowed" : "hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={isAlreadyAssigned}
                      onChange={() => {
                        if (!isAlreadyAssigned) {
                          handleToggleSeller(seller.id);
                        }
                      }}
                      className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4 transition-colors disabled:cursor-not-allowed"
                    />
                    <span className="font-medium text-slate-700">{sellerName}</span>
                  </div>
                  {isAlreadyAssigned && (
                    <Badge variant="outline" className="bg-slate-100 text-slate-500 border-slate-200">
                      Asignado
                    </Badge>
                  )}
                </label>
              );
            })}
            {sellers.length === 0 && (
              <p className="text-xs text-muted-foreground py-4 text-center">
                No hay asesores de ventas registrados en el sistema.
              </p>
            )}
          </div>
        </div>
      )}
    </ModalWrapper>
  );
};

// Helper internal icons to keep bundle clean
const UserPlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-primary h-6 w-6"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" x2="19" y1="8" y2="14" />
    <line x1="22" x2="16" y1="11" y2="11" />
  </svg>
);

const CampaignDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    campaign,
    isLoading,
    isError,
    showConfig,
    setShowConfig,
    showAssignSeller,
    setShowAssignSeller,
    assignSellersMutation,
    removeSellerMutation,
    deleteCampaignMutation,
  } = useCampaignDetail(id);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p>Cargando detalles de la campaña...</p>
      </div>
    );
  }

  if (isError || !campaign) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-destructive">
        <p className="font-bold text-lg">No se pudo cargar la campaña o no existe.</p>
        <button onClick={() => navigate("/campanas")} className="btn-secondary mt-4">
          Volver a Campañas
        </button>
      </div>
    );
  }

  const handleDeleteCampaign = () => {
    if (window.confirm("¿Estás seguro de que deseas eliminar permanentemente esta campaña?")) {
      deleteCampaignMutation.mutate();
    }
  };

  const handleRemoveSeller = (sellerId: string, sellerName: string) => {
    if (window.confirm(`¿Estás seguro de que deseas remover a ${sellerName} de esta campaña?`)) {
      removeSellerMutation.mutate(sellerId);
    }
  };

  // Obtener IDs de vendedores actualmente asignados
  const sellersList = campaign.sellersOnCampaign || campaign.sellers || [];
  const assignedSellerIds = sellersList.map((s: any) => s.seller_id || s.seller?.id || s.id) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <CampaignDetailHeader
        campaign={campaign}
        onAssignSellerClick={() => setShowAssignSeller(true)}
        onConfigClick={() => setShowConfig(true)}
        onDeleteClick={handleDeleteCampaign}
        isDeleting={deleteCampaignMutation.isPending}
      />

      {/* KPIs */}
      <CampaignDetailStats campaign={campaign} />

      {/* Product Info & Supervisor Info Grid */}
      <CampaignRelationsGrid campaign={campaign} />

      {/* Assigned Sellers / Vendedores Asignados */}
      <CampaignSellersTable
        campaign={campaign}
        onRemoveSeller={handleRemoveSeller}
        isRemoving={removeSellerMutation.isPending}
      />

      {/* Members / Leads Table */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Leads / Prospectos de la Campaña</CardTitle>
        </CardHeader>
        <CardContent className="p-0 border-t">
          {!campaign.members || campaign.members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center text-muted-foreground bg-card">
              <Users size={48} className="mb-4 opacity-25 text-primary" />
              <p className="text-sm font-medium max-w-md">
                Se identificaron {campaign._count?.leadsOnCampaign || 0} leads captados en esta campaña.
                Accede al Seguimiento de Equipo para auditar su gestión en tiempo real.
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Prospecto
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Teléfono
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {campaign.members.map((member: any) => (
                  <tr
                    key={member.id}
                    className="border-b border-border hover:bg-muted/5 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-foreground">
                      {`${member.first_name || ""} ${member.middle_name || ""} ${
                        member.last_name || ""
                      }`.trim() || "S/N"}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{member.email || "N/D"}</td>
                    <td className="px-6 py-4 text-muted-foreground">{member.phone || "N/D"}</td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={
                          member.lead_status === "ACTIVE"
                            ? "text-emerald-600 border-emerald-200 bg-emerald-50/50"
                            : ""
                        }
                      >
                        {member.lead_status || "N/D"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Formulario de Configuración de Campaña */}
      <CampaignForm
        open={showConfig}
        onClose={() => setShowConfig(false)}
        initialData={campaign}
      />

      {/* Modal para Asignar Vendedores */}
      <AssignSellersModal
        open={showAssignSeller}
        onClose={() => setShowAssignSeller(false)}
        campaignId={campaign.id}
        assignedSellerIds={assignedSellerIds}
        assignMutation={assignSellersMutation}
      />
    </div>
  );
};

export default CampaignDetailView;
