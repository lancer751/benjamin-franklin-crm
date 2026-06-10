import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Trash2, UserPlus, Calendar, Monitor, Users, DollarSign, TrendingUp, BarChart3, Loader2 } from "lucide-react";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getCampaignById } from "../services/campaignService";
import { mockCampaigns } from "../mockCampaigns";
import CampaignForm from "../components/CampaignForm";

const CampaignDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showConfig, setShowConfig] = useState(false);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/campanas")}>
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{campaign.campaing_name}</h1>
            <Badge className={campaign.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-muted text-muted-foreground"}>
              {campaign.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">ID: {campaign.id} • Plataforma: {campaign.platform}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Este botón usará la ruta /campaignsellers en el futuro */}
          <Button variant="outline" size="sm"><UserPlus size={16} className="mr-1" /> Asignar Vendedor</Button>
          <Button variant="outline" size="sm" onClick={() => setShowConfig(true)}><Edit size={16} className="mr-1" /> Configurar Campaña</Button>
          <Button variant="destructive" size="sm"><Trash2 size={16} className="mr-1" /> Eliminar</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: "Presupuesto", value: `$${initialBudget.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: DollarSign, sub: "Total asignado" },
          { label: "Gastado", value: `$${totalSpent.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: BarChart3, sub: `${spentPercent}% utilizado` },
          { label: "Estado", value: campaign.status, icon: TrendingUp, sub: campaign.platform },
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

      {/* Product Info */}
      <Card>
        <CardHeader className="flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg">Producto / Curso Relacionado</CardTitle>
          <Button variant="outline" size="sm"><Edit size={14} className="mr-1" /> Editar Producto</Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Nombre del Producto</p>
              <p className="font-semibold text-foreground">{campaign.relatedProduct?.name || "N/D"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Slug / Identificador</p>
              <p className="text-foreground font-mono text-sm">{campaign.relatedProduct?.slug || "N/D"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Estado de Venta</p>
              <Badge variant="secondary" className="font-medium">
                {campaign.relatedProduct?.sales_status || "N/D"}
              </Badge>
            </div>
          </div>
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
    </div>
  );
};

export default CampaignDetailView;
