import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  UserPlus, 
  UserMinus, 
  Calendar, 
  Monitor, 
  Users, 
  DollarSign, 
  TrendingUp, 
  BarChart3, 
  Loader2 
} from "lucide-react";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getCampaignById, 
  assignSellersToCampaign, 
  removeSellerFromCampaign, 
  deleteCampaign 
} from "../services/campaignService";
import { mockCampaigns } from "../mockCampaigns";
import CampaignForm from "../components/CampaignForm";
import { getSellers } from "@/features/users/services/userService";
import { translateEnum, CampaignStatusMap, CampaignPlatformMap } from "@/core/utils/dictionaries";
import { toast } from "sonner";
import ModalWrapper from "@/core/components/ModalWrapper";
import ProductStatusBadge from "@/features/products/components/shared/ProductStatusBadge";

interface AssignSellersModalProps {
  open: boolean;
  onClose: () => void;
  campaignId: string;
  assignedSellerIds: string[];
}

const AssignSellersModal = ({ open, onClose, campaignId, assignedSellerIds }: AssignSellersModalProps) => {
  const queryClient = useQueryClient();
  const [selectedSellerIds, setSelectedSellerIds] = useState<string[]>([]);

  // Obtener todos los asesores disponibles en el sistema
  const { data: sellersRes, isLoading } = useQuery({
    queryKey: ["sellers"],
    queryFn: getSellers,
    enabled: open,
  });

  const sellers = sellersRes?.success ? sellersRes.data : [];

  const assignMutation = useMutation({
    mutationFn: async (sellerIds: string[]) => {
      return assignSellersToCampaign(campaignId, { seller_ids: sellerIds });
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Asesores asignados con éxito");
        queryClient.invalidateQueries({ queryKey: ["campaign", campaignId] });
        queryClient.invalidateQueries({ queryKey: ["campaigns"] });
        queryClient.invalidateQueries({ queryKey: ["leads"] });
        queryClient.invalidateQueries({ queryKey: ["all-leads"] });
        setSelectedSellerIds([]);
        onClose();
      } else {
        toast.error(res.message || "Error al asignar asesores");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Error al asignar asesores");
    }
  });

  const handleToggleSeller = (sellerId: string) => {
    setSelectedSellerIds(prev => 
      prev.includes(sellerId) 
        ? prev.filter(id => id !== sellerId) 
        : [...prev, sellerId]
    );
  };

  const handleSave = () => {
    if (selectedSellerIds.length === 0) {
      toast.warning("Por favor, selecciona al menos un asesor para asignar.");
      return;
    }
    assignMutation.mutate(selectedSellerIds);
  };

  const footer = (
    <div className="flex gap-2">
      <Button variant="ghost" onClick={onClose} disabled={assignMutation.isPending}>
        Cancelar
      </Button>
      <Button onClick={handleSave} disabled={assignMutation.isPending || selectedSellerIds.length === 0}>
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
      icon={<UserPlus className="text-primary h-6 w-6" />}
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
                ? `${seller.user.first_name} ${seller.user.last_name}` 
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
              <p className="text-xs text-muted-foreground py-4 text-center">No hay asesores de ventas registrados en el sistema.</p>
            )}
          </div>
        </div>
      )}
    </ModalWrapper>
  );
};

const CampaignDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showConfig, setShowConfig] = useState(false);
  const [showAssignSeller, setShowAssignSeller] = useState(false);

  const isMockId = id?.startsWith("camp-mock-");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["campaign", id],
    queryFn: async () => {
      if (isMockId) {
        const mock = mockCampaigns.find(c => c.id === id);
        return { data: mock };
      }
      return getCampaignById(id!);
    },
    enabled: !!id,
  });

  const removeSellerMutation = useMutation({
    mutationFn: async (sellerId: string) => {
      return removeSellerFromCampaign(id!, sellerId);
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Asesor removido de la campaña correctamente.");
        queryClient.invalidateQueries({ queryKey: ["campaign", id] });
        queryClient.invalidateQueries({ queryKey: ["campaigns"] });
        queryClient.invalidateQueries({ queryKey: ["leads"] });
        queryClient.invalidateQueries({ queryKey: ["all-leads"] });
      } else {
        toast.error(res.message || "Error al remover al asesor.");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Error al remover al asesor.");
    }
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: async () => {
      return deleteCampaign(id!);
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Campaña eliminada correctamente.");
        navigate("/campanas");
      } else {
        toast.error(res.message || "Error al eliminar la campaña.");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Error al eliminar la campaña.");
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p>Cargando detalles de la campaña...</p>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-destructive">
        <p className="font-bold text-lg">No se pudo cargar la campaña o no existe.</p>
        <button onClick={() => navigate("/campanas")} className="btn-secondary mt-4">Volver a Campañas</button>
      </div>
    );
  }

  const campaign = data.data;
  
  // Convertir strings de presupuesto a números para cálculos y visualización
  const initialBudget = Number(campaign.initial_budget) || 0;
  const totalSpent = campaign.total_spent ? Number(campaign.total_spent) : 0;
  const spentPercent = initialBudget > 0 ? Math.round((totalSpent / initialBudget) * 100) : 0;

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "Sin fecha de fin";
    return new Date(dateString).toLocaleDateString("es-PE", { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const handleRemoveSeller = (sellerId: string, sellerName: string) => {
    if (window.confirm(`¿Estás seguro de que deseas remover a ${sellerName} de esta campaña?`)) {
      removeSellerMutation.mutate(sellerId);
    }
  };

  const handleDeleteCampaign = () => {
    if (window.confirm("¿Estás seguro de que deseas eliminar permanentemente esta campaña?")) {
      deleteCampaignMutation.mutate();
    }
  };

  // Obtener IDs de vendedores actualmente asignados
  const assignedSellerIds = campaign.sellers?.map((s: any) => s.seller_id || s.seller?.id) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/campanas")} className="mt-1">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">{campaign.campaing_name}</h1>
              <Badge className={
                campaign.status === "ACTIVE" 
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
                  : campaign.status === "PAUSED"
                  ? "bg-amber-100 text-amber-700 border-amber-200"
                  : "bg-muted text-muted-foreground"
              }>
                {translateEnum(campaign.status, CampaignStatusMap)}
              </Badge>
            </div>
            {/* Metadatos detallados */}
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
              <span className="font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md">
                UUID: {campaign.id}
              </span>
              {campaign.meta_form_id && (
                <span className="font-mono bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900 px-2 py-0.5 rounded-md flex items-center gap-1">
                  Meta Form ID: {campaign.meta_form_id}
                </span>
              )}
              <span>•</span>
              <span>Plataforma: {translateEnum(campaign.platform, CampaignPlatformMap)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button variant="outline" size="sm" onClick={() => setShowAssignSeller(true)}>
            <UserPlus size={16} className="mr-1.5" /> Asignar Vendedor
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowConfig(true)}>
            <Edit size={16} className="mr-1.5" /> Configurar Campaña
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDeleteCampaign}
            disabled={deleteCampaignMutation.isPending}
          >
            {deleteCampaignMutation.isPending ? (
              <Loader2 size={16} className="mr-1.5 animate-spin" />
            ) : (
              <Trash2 size={16} className="mr-1.5" />
            )}
            Eliminar
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: "Presupuesto", value: `$${initialBudget.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: DollarSign, sub: "Total asignado" },
          { label: "Gastado", value: `$${totalSpent.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: BarChart3, sub: `${spentPercent}% utilizado` },
          { label: "Estado", value: translateEnum(campaign.status, CampaignStatusMap), icon: TrendingUp, sub: translateEnum(campaign.platform, CampaignPlatformMap) },
          { label: "Inicio", value: formatDate(campaign.start_date), icon: Calendar, sub: "Fecha de inicio" },
          { label: "Fin", value: formatDate(campaign.end_date), icon: Calendar, sub: "Fecha de cierre" },
        ].map((kpi, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{kpi.label}</p>
                <kpi.icon size={16} className="text-primary" />
              </div>
              <p className="text-xl font-bold text-foreground mt-2">{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Product Info & Supervisor Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Info */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Producto / Curso Relacionado</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Nombre del Producto</p>
                <p className="font-semibold text-foreground">{campaign.relatedProduct?.name || "N/D"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Estado de Venta</p>
                <div className="mt-1">
                  <ProductStatusBadge status={campaign.relatedProduct?.sales_status || ""} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Supervisor Info */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Supervisor a Cargo</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Supervisor</p>
                <p className="font-semibold text-foreground">
                  {campaign.supervisor?.user
                    ? `${campaign.supervisor.user.first_name} ${campaign.supervisor.user.last_name}`
                    : "No asignado"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Correo Institucional</p>
                <p className="text-foreground text-sm font-medium break-all">
                  {campaign.supervisor?.user?.email || "No asignado"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Sellers / Vendedores Asignados */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users size={18} className="text-primary" /> Asesores de Ventas Asignados ({campaign.sellers?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!campaign.sellers || campaign.sellers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-t">
              <Users size={48} className="mb-3 opacity-20" />
              <p className="text-sm font-medium">Aún no hay asesores de venta asignados a esta campaña</p>
            </div>
          ) : (
            <div className="border-t">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Asesor</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Total de Órdenes</th>
                    <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {campaign.sellers.map((campaignSeller: any) => {
                    const seller = campaignSeller.seller;
                    if (!seller) return null;
                    const sellerName = seller.user 
                      ? `${seller.user.first_name} ${seller.user.last_name}` 
                      : `Asesor ${seller.id.slice(0, 4)}`;

                    return (
                      <tr key={campaignSeller.id || seller.id} className="border-b border-border hover:bg-muted/5 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                            {sellerName.split(" ").map(n => n[0]).join("")}
                          </div>
                          <span>{sellerName}</span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {seller.total_orders || 0}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                            onClick={() => handleRemoveSeller(seller.id, sellerName)}
                            disabled={removeSellerMutation.isPending}
                          >
                            <UserMinus size={16} />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Members / Leads Table */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Leads / Prospectos de la Campaña</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!campaign.members || campaign.members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-t">
              <Users size={48} className="mb-3 opacity-20" />
              <p className="text-sm font-medium">Aún no hay leads registrados en esta campaña</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Prospecto</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Email</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Teléfono</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Estado</th>
                </tr>
              </thead>
              <tbody>
                {campaign.members.map((member: any) => (
                  <tr key={member.id} className="border-b border-border hover:bg-muted/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">
                      {`${member.first_name || ""} ${member.middle_name || ""} ${member.last_name || ""}`.trim() || "S/N"}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{member.email || "N/D"}</td>
                    <td className="px-6 py-4 text-muted-foreground">{member.phone || "N/D"}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={member.lead_status === 'ACTIVE' ? "text-emerald-600 border-emerald-200 bg-emerald-50/50" : ""}>
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
      />
    </div>
  );
};

export default CampaignDetailView;
