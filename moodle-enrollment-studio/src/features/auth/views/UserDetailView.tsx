import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, Loader2, User, Phone, Mail, Calendar, 
  Target, Briefcase, TrendingUp, ShoppingCart, CheckCircle,
  XCircle, Percent, Clock, ShieldCheck, Users, CheckSquare, Square, Users2
} from "lucide-react";
import { getUserById, getSellerProfileById, getSupervisorById } from "../services/userService";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import { Skeleton } from "@/core/components/ui/skeleton";
import { Progress } from "@/core/components/ui/progress";
import { translateEnum, RoleTranslationsMap } from "@/core/utils/dictionaries";

export default function UserDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 1. Consulta del usuario base
  const { data: userResponse, isLoading: isLoadingUser } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUserById(id as string),
    enabled: !!id,
  });
  
  const user = userResponse?.success ? userResponse.data : null;
  const isSales = user?.role?.name === "SALES_REP";
  const isSupervisor = user?.role?.name === "SALES_SUPERVISOR";

  // 2. Consulta del perfil de vendedor (Solo si es SALES_REP y hay id)
  const { data: sellerResponse, isLoading: isLoadingSeller } = useQuery({
    queryKey: ["sellerProfile", id],
    queryFn: () => getSellerProfileById(id as string),
    enabled: !!id && isSales,
  });

  // 3. Consulta del perfil de supervisor (Solo si es SALES_SUPERVISOR y hay id)
  const { data: supervisorResponse, isLoading: isLoadingSupervisor } = useQuery({
    queryKey: ["supervisorProfile", id],
    queryFn: () => getSupervisorById(id as string),
    enabled: !!id && isSupervisor,
  });

  const seller = sellerResponse?.success ? sellerResponse.data : null;
  const supervisor = supervisorResponse?.success ? supervisorResponse.data : null;

  if (!isLoadingUser && !user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p>Usuario no encontrado.</p>
        <Button variant="link" onClick={() => navigate("/usuarios")}>Volver a la lista</Button>
      </div>
    );
  }

  const hasNoActivity = seller && (!seller.orders?.length && !seller.campaignMembers?.length && !seller.campaign_members?.length);

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto fade-in pb-10">
      
      {/* HEADER SECTION */}
      <div className="flex items-center gap-4 border-b border-border/50 pb-6">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="shrink-0 h-9 w-9">
          <ArrowLeft size={16} />
        </Button>
        <div className="flex-1 flex items-center justify-between">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            {isLoadingUser ? (
              <Skeleton className="h-8 w-64" />
            ) : (
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {user?.first_name} {user?.middle_name} {user?.last_name}
              </h1>
            )}
            
            <div className="flex gap-2">
              {isLoadingUser ? (
                <>
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-20" />
                </>
              ) : (
                <>
                  <Badge
                    variant="outline"
                    className={
                      user?.role?.name === "ADMIN" ? "border-red-200 text-red-700 bg-red-50/50"
                      : user?.role?.name === "SALES_REP" ? "border-blue-200 text-blue-700 bg-blue-50/50"
                      : user?.role?.name === "MARKETING" ? "border-emerald-200 text-emerald-700 bg-emerald-50/50"
                      : "border-gray-200 text-gray-700 bg-gray-50/50"
                    }
                  >
                    {translateEnum(user?.role?.name, RoleTranslationsMap)}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={
                      user?.is_active
                        ? "bg-green-100 text-green-700 shadow-none border-transparent"
                        : "bg-zinc-100 text-zinc-600 shadow-none border-transparent"
                    }
                  >
                    {user?.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        
        {/* INFO PERSONAL (Ocupa 1 columna) */}
        <Card className="shadow-sm border-border/60 md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <User size={16} className="text-primary" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingUser ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Email</span>
                  <div className="flex items-center gap-2 text-sm text-foreground font-medium bg-muted/30 p-2.5 rounded-lg border border-border/50 break-all">
                    <Mail size={14} className="text-muted-foreground shrink-0" />
                    {user?.email}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Celular</span>
                  <div className="flex items-center gap-2 text-sm text-foreground font-medium bg-muted/30 p-2.5 rounded-lg border border-border/50">
                    <Phone size={14} className="text-muted-foreground shrink-0" />
                    {user?.cellphone || "No especificado"}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Fecha de Registro</span>
                  <div className="flex items-center gap-2 text-sm text-foreground font-medium bg-muted/30 p-2.5 rounded-lg border border-border/50">
                    <Calendar size={14} className="text-muted-foreground shrink-0" />
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString("es-PE", { year: 'numeric', month: 'long', day: 'numeric' }) : "No disponible"}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* DASHBOARD DE VENTAS, SUPERVISIÓN O EMPTY STATE (Ocupa 2 columnas) */}
        {isLoadingUser || (isSales && isLoadingSeller) || (isSupervisor && isLoadingSupervisor) ? (
           <div className="md:col-span-2 space-y-6">
             <Card className="shadow-sm border-border/60 h-full">
               <CardHeader className="pb-4">
                 <CardTitle className="text-sm font-semibold flex items-center gap-2">
                   <Briefcase size={16} className="text-amber-600" />
                   <Skeleton className="h-5 w-40" />
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
                   {[1, 2, 3, 4].map((i) => (
                     <Skeleton key={i} className="h-24 w-full rounded-xl" />
                   ))}
                 </div>
                 <Skeleton className="h-24 w-full rounded-xl" />
               </CardContent>
             </Card>
           </div>
        ) : isSales && seller ? (
          <div className="md:col-span-2 space-y-6">
            <Card className="shadow-sm border-border/60 h-full bg-muted/30">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Briefcase size={16} className="text-amber-600" />
                  Rendimiento del Vendedor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* KPI: Meta de Ventas */}
                  <div className="flex flex-col p-4 rounded-xl border border-border/50 bg-card">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Target size={16} className="text-blue-500" />
                      <span className="text-sm font-medium">Meta de Ventas</span>
                    </div>
                    <span className="text-2xl font-bold text-foreground">
                      {seller.sales_target || 0}
                    </span>
                  </div>

                  {/* KPI: Ventas Totales */}
                  <div className="flex flex-col p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                    <div className="flex items-center gap-2 text-emerald-700 mb-2">
                      <TrendingUp size={16} />
                      <span className="text-sm font-medium">Ventas Totales</span>
                    </div>
                    <span className="text-2xl font-bold text-emerald-700">
                      {seller.total_sales || 0}
                    </span>
                  </div>

                  {/* KPI: Órdenes Completadas */}
                  <div className="flex flex-col p-4 rounded-xl border border-border/50 bg-card">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <CheckCircle size={16} className="text-emerald-500" />
                      <span className="text-sm font-medium">Órdenes Completadas</span>
                    </div>
                    <span className="text-2xl font-bold text-foreground">
                      {seller.completed_orders || "0"}
                    </span>
                  </div>

                  {/* KPI: Tasa de Retorno */}
                  <div className="flex flex-col p-4 rounded-xl border border-border/50 bg-card">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Percent size={16} className="text-orange-500" />
                      <span className="text-sm font-medium">Tasa de Retorno</span>
                    </div>
                    <span className="text-2xl font-bold text-foreground">
                      {seller.return_rate || "0"}%
                    </span>
                  </div>
                </div>

                {/* VISUALIZADOR DE PROGRESO */}
                <div className="mt-8 bg-card p-4 rounded-xl border border-border/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-foreground">Progreso de Ventas</span>
                    <span className="text-sm font-bold text-emerald-600">
                      {seller.total_sales || 0} / {seller.sales_target || 0}
                    </span>
                  </div>
                  <Progress 
                    value={
                      seller.sales_target && seller.sales_target > 0 
                        ? Math.min(((seller.total_sales || 0) / seller.sales_target) * 100, 100)
                        : 0
                    } 
                    className="h-2.5" 
                  />
                  <p className="text-xs text-muted-foreground mt-2 text-right">
                    {seller.sales_target && seller.sales_target > 0 
                      ? `${Math.round(((seller.total_sales || 0) / seller.sales_target) * 100)}% alcanzado`
                      : "Meta no definida"}
                  </p>
                </div>

                {/* MENSAJE DE ACTIVIDAD RECIENTE */}
                {hasNoActivity && (
                  <div className="mt-8">
                    <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-xl bg-background/50">
                      <ShoppingCart className="h-8 w-8 text-muted-foreground/40 mb-3" />
                      <p className="text-sm font-medium text-foreground">Sin actividad reciente</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        No hay registros de órdenes o campañas en este momento.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : isSupervisor && supervisor ? (
          <div className="md:col-span-2 space-y-6">
            <Card className="shadow-sm border-border/60 h-full bg-muted/30">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <ShieldCheck size={16} className="text-primary" />
                  Dashboard de Supervisión
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* KPI 1: Equipo a Cargo */}
                  <div className="flex flex-col p-4 rounded-xl border border-border/50 bg-card">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Users size={16} className="text-blue-500" />
                      <span className="text-sm font-medium">Equipo a Cargo</span>
                    </div>
                    <span className="text-xl font-bold text-foreground">
                      {supervisor.team_name || "Sin equipo asignado"}
                    </span>
                  </div>

                  {/* KPI 2: Vendedores Activos */}
                  <div className="flex flex-col p-4 rounded-xl border border-border/50 bg-card">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Users2 size={16} className="text-amber-500" />
                      <span className="text-sm font-medium">Vendedores Activos</span>
                    </div>
                    <span className="text-2xl font-bold text-foreground">
                      {supervisor.assignedSellers?.filter((s: any) => s.user?.is_active).length || 0} / {supervisor.max_sellers || 0}
                    </span>
                  </div>

                  {/* KPI 3: Ventas Totales del Equipo */}
                  <div className="flex flex-col p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                    <div className="flex items-center gap-2 text-emerald-700 mb-2">
                      <TrendingUp size={16} />
                      <span className="text-sm font-medium">Ventas Totales (Equipo)</span>
                    </div>
                    <span className="text-2xl font-bold text-emerald-700">
                      {supervisor.total_team_sales || 0}
                    </span>
                  </div>

                  {/* KPI 4: Conversión del Equipo */}
                  <div className="flex flex-col p-4 rounded-xl border border-border/50 bg-card">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Percent size={16} className="text-indigo-500" />
                      <span className="text-sm font-medium">Conversión del Equipo</span>
                    </div>
                    <span className="text-2xl font-bold text-foreground">
                      {supervisor.team_conversion_rate || 0}%
                    </span>
                  </div>

                  {/* KPI 5: Órdenes del Equipo */}
                  <div className="flex flex-col p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                    <div className="flex items-center gap-2 text-emerald-700 mb-2">
                      <ShoppingCart size={16} />
                      <span className="text-sm font-medium">Órdenes del Equipo</span>
                    </div>
                    <span className="text-2xl font-bold text-emerald-700">
                      {supervisor.completed_team_orders || 0} / {supervisor.total_team_orders || 0}
                    </span>
                  </div>

                  {/* KPI 6: Tiempo de Respuesta Promedio */}
                  <div className="flex flex-col p-4 rounded-xl border border-border/50 bg-card">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Clock size={16} className="text-amber-500" />
                      <span className="text-sm font-medium">Tiempo de Respuesta</span>
                    </div>
                    <span className="text-2xl font-bold text-foreground">
                      {supervisor.avg_team_response_time || 0} min
                    </span>
                  </div>
                </div>

                {/* PRIVILEGIOS DE GESTIÓN */}
                <div className="bg-card p-4 rounded-xl border border-border/50">
                  <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <CheckSquare size={16} className="text-primary" />
                    Privilegios de Gestión
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { label: "Asignar Leads", value: supervisor.can_assign_leads },
                      { label: "Aprobar Descuentos", value: supervisor.can_approve_discounts },
                      { label: "Cancelar Órdenes", value: supervisor.can_cancel_orders },
                      { label: "Reasignar Leads", value: supervisor.can_reassign_leads },
                      { label: "Ver Ventas Globales", value: supervisor.can_view_all_team_sales },
                    ].map((priv, idx) => (
                      <Badge 
                        key={idx}
                        variant={priv.value ? "secondary" : "outline"}
                        className={priv.value ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "opacity-60"}
                      >
                        {priv.value ? <ShieldCheck size={12} className="mr-1" /> : <Square size={12} className="mr-1" />}
                        {priv.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* TABLA DE VENDEDORES */}
                <div className="bg-card p-4 rounded-xl border border-border/50">
                  <h4 className="text-sm font-semibold mb-4">Vendedores Asignados</h4>
                  {supervisor.assignedSellers && supervisor.assignedSellers.length > 0 ? (
                    <div className="overflow-hidden border rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b">
                          <tr>
                            <th className="px-4 py-2 text-left font-medium text-muted-foreground">Nombre del Vendedor</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {supervisor.assignedSellers.map((s: any, idx: number) => (
                            <tr key={idx} className="hover:bg-muted/30 transition-colors">
                              <td className="px-4 py-2.5 font-medium">
                                {s.user ? `${s.user.first_name} ${s.user.last_name}` : s.full_name || "Vendedor desconocido"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4 italic">
                      No hay vendedores asignados a este supervisor.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="md:col-span-2 h-full flex flex-col">
            <Card className="flex-1 flex flex-col items-center justify-center text-center p-6 border-dashed border-2 border-border/60 bg-muted/20 shadow-none min-h-[350px]">
              <div className="h-14 w-14 rounded-full bg-background flex items-center justify-center mb-4 shadow-sm border border-border/50">
                <Target className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Perfil Administrativo/Supervisión
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                El rol actual ({translateEnum(user?.role?.name, RoleTranslationsMap)}) tiene acceso a métricas globales desde sus módulos, pero no genera reportes de ventas individuales.
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}