import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, Users, BookOpen, UserMinus } from "lucide-react";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import CampaignForm from "@/features/campaigns/components/CampaignForm";
import { getSellers } from "@/features/users/services/userService";
import { toast } from "sonner";
import ModalWrapper from "@/core/components/ModalWrapper";
import { useCampaignDetail } from "@/features/campaigns/hooks/useCampaignDetail";
import { CampaignDetailHeader } from "@/features/campaigns/components/CampaignDetailHeader";
import ProductStatusBadge from "@/features/products/components/shared/ProductStatusBadge";
import { ModalityMap, translateEnum } from "@/core/utils/dictionaries";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/core/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";

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

  const sellers = (sellersRes as any)?.success ? (sellersRes as any).data : [];

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
  const queryClient = useQueryClient();

  const {
    campaign,
    isLoading,
    isError,
    showConfig,
    setShowConfig,
    showAssignSeller,
    setShowAssignSeller,
    assignSellersMutation,
    retireAndReassignSellerMutation,
    deleteCampaignMutation,
  } = useCampaignDetail(id);

  const [sellerToRemove, setSellerToRemove] = useState<any>(null);
  const [newAssigneeId, setNewAssigneeId] = useState<string>("");

  // Obtener IDs de vendedores actualmente asignados
  const sellersList = useMemo(() => {
    if (!campaign) return [];
    return campaign.sellersOnCampaign || campaign.sellers || [];
  }, [campaign]);

  const assignedSellerIds = useMemo(() => {
    return sellersList.map((s: any) => s.seller_id || s.seller?.id || s.id) || [];
  }, [sellersList]);

  const otherSellers = useMemo(() => {
    if (!sellerToRemove) return [];
    return sellersList
      .map((cs: any) => cs.seller || cs)
      .filter((s: any) => s && s.id !== sellerToRemove.id);
  }, [sellersList, sellerToRemove]);

  const campaignMetrics = useMemo(() => {
    if (!campaign) {
      return {
        totalOrders: 0,
        totalLeads: 0,
        cashPrice: 0,
        conversionRate: "0.0",
        totalRevenue: 0,
      };
    }

    const totalOrders = campaign.sellersOnCampaign?.reduce(
      (acc: number, curr: any) => acc + (curr.seller?.total_orders || 0),
      0
    ) || 0;

    const totalLeads = campaign._count?.leadsOnCampaign || 0;

    const cashPrice = parseFloat(campaign.relatedProduct?.prices?.[0]?.cash_price || "0");

    const conversionRate = totalLeads > 0 
      ? ((totalOrders / totalLeads) * 100).toFixed(1) 
      : "0.0";

    const totalRevenue = totalOrders * cashPrice;

    return {
      totalOrders,
      totalLeads,
      cashPrice,
      conversionRate,
      totalRevenue,
    };
  }, [campaign]);

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

  const handleRemoveSeller = (seller: any) => {
    setSellerToRemove(seller);
    setNewAssigneeId("");
  };

  const handleConfirmRetiro = () => {
    if (!sellerToRemove || !newAssigneeId) {
      toast.error("Por favor, selecciona un asesor para reasignar los prospectos.");
      return;
    }

    retireAndReassignSellerMutation.mutate(
      {
        sellerId: sellerToRemove.id,
        targetSellerId: newAssigneeId,
      },
      {
        onSuccess: () => {
          setSellerToRemove(null);
          setNewAssigneeId("");
        },
      }
    );
  };

  const handlePublishReport = () => {
    toast.success("¡Reporte de campaña compilado y publicado con éxito!");
  };

  const supervisor = campaign.assignedSupervisor || campaign.supervisor;
  const supervisorUser = supervisor?.user;
  const supervisorName = supervisorUser
    ? `${supervisorUser.first_name || ""} ${supervisorUser.last_name || ""}`.trim()
    : "No asignado";
  const supervisorEmail = supervisorUser?.email || "No asignado";

  const attendanceModeLabels: Record<string, string> = {
    VIRTUAL: "Virtual",
    PRESENCIAL: "Presencial",
    HEREDADO: "Heredado",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <CampaignDetailHeader
        campaign={campaign}
        onConfigClick={() => setShowConfig(true)}
        onPublishReportClick={handlePublishReport}
      />

      {/* Grid Principal Asimétrico */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        {/* COLUMNA IZQUIERDA: FICHA DEL CURSO RELACIONADO (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden flex flex-col">
            {campaign.relatedProduct?.image_url ? (
              <img
                src={campaign.relatedProduct.image_url}
                alt={campaign.relatedProduct.name || "Curso"}
                className="w-full h-40 object-cover"
              />
            ) : (
              <div className="w-full h-40 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-400">
                <BookOpen size={40} className="stroke-[1.5]" />
              </div>
            )}
            <CardContent className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    Producto Relacionado
                  </span>
                  {campaign.relatedProduct?.sales_status && (
                    <ProductStatusBadge status={campaign.relatedProduct.sales_status} />
                  )}
                </div>
                <h3 className="font-bold text-slate-800 text-lg leading-tight mb-4">
                  {campaign.relatedProduct?.name || "Sin producto relacionado"}
                </h3>
              </div>

              <div className="border-t border-slate-100 pt-3 mt-3">
                <h4 className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-2">
                  COSTOS DE LA CAMPAÑA
                </h4>
                <div className="space-y-1 divide-y divide-slate-50">
                  {campaign.relatedProduct?.prices && campaign.relatedProduct.prices.length > 0 ? (
                    campaign.relatedProduct.prices.map((price: any, idx: number) => {
                      const rawMode = price.attendance_mode === "HEREDADO"
                        ? campaign.relatedProduct?.edition?.modality || ""
                        : price.attendance_mode || "";
                      const translatedMode = translateEnum(rawMode, ModalityMap) || rawMode;
                      return (
                        <div key={idx} className="flex justify-between items-center py-2 first:pt-0 last:pb-0">
                          <span className="text-slate-600 font-medium text-sm">
                            {translatedMode}:
                          </span>
                          <span className="text-slate-900 font-bold text-sm">
                            S/ {Number(price.cash_price).toFixed(2)} Contado
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-500 py-2 text-center">
                      No hay precios configurados para este producto.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supervisor a Cargo */}
          <Card className="rounded-2xl border border-slate-100 bg-white shadow-sm p-5">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              SUPERVISOR A CARGO
            </span>
            <div className="mt-2">
              <p className="font-bold text-slate-800 text-sm">
                {supervisorName}
              </p>
              <p className="text-xs text-slate-500 font-medium">
                {supervisorEmail}
              </p>
            </div>
          </Card>
        </div>

        {/* COLUMNA DERECHA: EQUIPO DE VENTAS ASIGNADO & CARDS ANALÍTICAS (lg:col-span-8) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <Card className="rounded-2xl border border-slate-100 bg-white shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Users size={18} className="text-slate-950" />
                Asesores de Ventas Asignados ({sellersList.length})
              </h3>
              <button
                onClick={() => setShowAssignSeller(true)}
                className="text-primary hover:underline text-xs font-bold"
              >
                + Asignar Asesor
              </button>
            </div>

            <div className="overflow-x-auto">
              {sellersList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400 border-t border-slate-100">
                  <Users size={40} className="mb-2 opacity-25" />
                  <p className="text-sm">Aún no hay asesores asignados a esta campaña.</p>
                </div>
              ) : (
                <table className="w-full text-sm border-t border-slate-100">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-left">
                      <th className="py-3 text-xs font-bold uppercase tracking-wider">Asesor</th>
                      <th className="py-3 text-xs font-bold uppercase tracking-wider">Asignación</th>
                      <th className="py-3 text-xs font-bold uppercase tracking-wider">Total de Órdenes</th>
                      <th className="py-3 text-right text-xs font-bold uppercase tracking-wider">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {sellersList.map((campaignSeller: any) => {
                      const seller = campaignSeller.seller || campaignSeller;
                      if (!seller) return null;
                      const sellerId = seller.id;
                      const sellerName = seller.user
                        ? `${seller.user.first_name || ""} ${seller.user.last_name || ""}`.trim()
                        : `Asesor ${sellerId?.slice(0, 4) || ""}`;
                      const initials = sellerName
                        ? sellerName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
                        : "AS";
                      const assignedAt = campaignSeller.assigned_at || campaignSeller.createdAt || null;
                      const formattedDate = assignedAt
                        ? new Date(assignedAt).toLocaleDateString("es-PE", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "N/D";
                      const totalOrders = seller.total_orders || 0;

                      return (
                        <tr key={campaignSeller.id || sellerId} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 font-medium text-slate-800 flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-700">
                              {initials}
                            </div>
                            <span className="font-semibold">{sellerName}</span>
                          </td>
                          <td className="py-3 text-slate-500 text-xs font-medium">
                            {formattedDate}
                          </td>
                          <td className="py-3 text-slate-500 font-semibold">
                            {totalOrders}
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => handleRemoveSeller(seller)}
                              disabled={retireAndReassignSellerMutation.isPending}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors inline-flex items-center justify-center disabled:opacity-50"
                            >
                              <UserMinus size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </Card>

          {/* Cards Analíticas Inferiores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Tasa de Conversión */}
            <Card className="rounded-2xl border border-slate-100 bg-white shadow-sm p-5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Tasa de Conversión
              </p>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-slate-900">
                  {campaignMetrics.conversionRate}%
                </span>
                <span className="text-[10px] font-semibold text-slate-400 mt-1">
                  {campaignMetrics.totalOrders} ventas logradas
                </span>
              </div>
            </Card>

            {/* Card 2: Ingresos Generados */}
            <Card className="rounded-2xl border border-slate-100 bg-white shadow-sm p-5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Ingresos Generados
              </p>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-slate-900">
                  S/ {campaignMetrics.totalRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 mt-1">
                  {campaign.is_organic ? (
                    "Tráfico Orgánico"
                  ) : (
                    `Inversión: S/ ${parseFloat(campaign.initial_budget || "0").toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
                  )}
                </span>
              </div>
            </Card>

            {/* Card 3: Leads Activos */}
            <Card className="rounded-2xl border border-slate-100 bg-white shadow-sm p-5 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Leads Activos
                </p>
                <span className="text-2xl font-bold text-slate-900">
                  {campaignMetrics.totalLeads}
                </span>
              </div>
              
              {/* Mini gráfico de barras vertical estético */}
              <div className="flex items-end gap-1 h-9">
                <div className="bg-slate-100 hover:bg-slate-200 h-[25%] w-2 rounded-sm transition-all"></div>
                <div className="bg-slate-200 hover:bg-slate-300 h-[50%] w-2 rounded-sm transition-all"></div>
                <div className="bg-slate-300 hover:bg-slate-400 h-[35%] w-2 rounded-sm transition-all"></div>
                <div className="bg-slate-200 hover:bg-slate-300 h-[70%] w-2 rounded-sm transition-all"></div>
                <div className="bg-slate-950 h-[90%] w-2 rounded-sm transition-all"></div>
              </div>
            </Card>
          </div>
        </div>
      </div>

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

      {/* Modal de confirmación de retiro y reasignación obligatoria */}
      <Dialog open={!!sellerToRemove} onOpenChange={(open) => { if (!open) setSellerToRemove(null); }}>
        <DialogContent className="max-w-md bg-white rounded-xl shadow-lg border border-slate-100">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-bold text-lg">Retirar Asesor de Campaña</DialogTitle>
            <DialogDescription className="text-slate-500 text-sm mt-1">
              ¿Estás seguro de retirar a <strong>{sellerToRemove?.user?.first_name || "este asesor"}</strong> de esta campaña?
              Para proceder, debes reasignar de forma obligatoria los leads que tiene asignados en esta campaña.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Asesor de Ventas Destino
            </label>
            <Select value={newAssigneeId} onValueChange={setNewAssigneeId}>
              <SelectTrigger className="w-full border-slate-200 rounded-lg">
                <SelectValue placeholder="Seleccionar asesor para reasignar" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {otherSellers.map((s: any) => {
                  const sName = `${s.user?.first_name || ""} ${s.user?.last_name || ""}`.trim();
                  return (
                    <SelectItem key={s.id} value={s.id}>
                      {sName || `Asesor ${s.id.slice(0, 4)}`}
                    </SelectItem>
                  );
                })}
                {otherSellers.length === 0 && (
                  <p className="text-xs text-muted-foreground p-2 text-center">
                    No hay otros asesores en esta campaña para reasignar.
                  </p>
                )}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setSellerToRemove(null)}
              disabled={retireAndReassignSellerMutation.isPending}
              className="border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmRetiro}
              disabled={retireAndReassignSellerMutation.isPending || !newAssigneeId || otherSellers.length === 0}
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-1.5"
            >
              {retireAndReassignSellerMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Reasignando...
                </>
              ) : (
                "Confirmar Retiro y Reasignar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CampaignDetailView;
