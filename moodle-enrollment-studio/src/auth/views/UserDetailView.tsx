import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, Loader2, User, Phone, Mail, Calendar, 
  Target, Briefcase, TrendingUp, ShoppingCart, CheckCircle 
} from "lucide-react";
import { getUserById } from "../services/userService";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";

export default function UserDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 1. Única consulta: El backend ya nos trae los datos del vendedor aquí
  const { data: response, isLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUserById(id as string),
    enabled: !!id,
  });
  
  // Extraemos la data de forma segura
  const user = response?.success ? response.data : null;
  const isSales = user?.role?.name === "SALES_REP";
  const seller = user?.seller; // Aquí están todas las métricas de ventas

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p>Usuario no encontrado.</p>
        <Button variant="link" onClick={() => navigate("/usuarios")}>Volver a la lista</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto fade-in pb-10">
      
      {/* HEADER SECTION */}
      <div className="flex items-center gap-4 border-b border-border/50 pb-6">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="shrink-0 h-9 w-9">
          <ArrowLeft size={16} />
        </Button>
        <div className="flex-1 flex items-center justify-between">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {user.first_name} {user.middle_name} {user.last_name}
            </h1>
            <div className="flex gap-2">
              <Badge
                variant="outline"
                className={
                  user.role?.name === "ADMIN" ? "border-red-200 text-red-700 bg-red-50/50"
                  : user.role?.name === "SALES_REP" ? "border-blue-200 text-blue-700 bg-blue-50/50"
                  : user.role?.name === "MARKETING" ? "border-emerald-200 text-emerald-700 bg-emerald-50/50"
                  : "border-gray-200 text-gray-700 bg-gray-50/50"
                }
              >
                {user.role?.name || "SIN ROL"}
              </Badge>
              <Badge
                variant="secondary"
                className={
                  user.is_active
                    ? "bg-green-100 text-green-700 shadow-none border-transparent"
                    : "bg-zinc-100 text-zinc-600 shadow-none border-transparent"
                }
              >
                {user.is_active ? "Activo" : "Inactivo"}
              </Badge>
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
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase font-semibold">Email</span>
              <div className="flex items-center gap-2 text-sm text-foreground font-medium bg-muted/30 p-2.5 rounded-lg border border-border/50 break-all">
                <Mail size={14} className="text-muted-foreground shrink-0" />
                {user.email}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase font-semibold">Celular</span>
              <div className="flex items-center gap-2 text-sm text-foreground font-medium bg-muted/30 p-2.5 rounded-lg border border-border/50">
                <Phone size={14} className="text-muted-foreground shrink-0" />
                {user.cellphone || "No especificado"}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase font-semibold">Fecha de Registro</span>
              <div className="flex items-center gap-2 text-sm text-foreground font-medium bg-muted/30 p-2.5 rounded-lg border border-border/50">
                <Calendar size={14} className="text-muted-foreground shrink-0" />
                {user.created_at ? new Date(user.created_at).toLocaleDateString("es-PE", { year: 'numeric', month: 'long', day: 'numeric' }) : "No disponible"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DASHBOARD DE VENTAS (Ocupa 2 columnas, solo si es vendedor) */}
        {isSales && seller && (
          <div className="md:col-span-2 space-y-6">
            <Card className="shadow-sm border-border/60">
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
                      S/ {Number(seller.sales_target || 0).toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* KPI: Ventas Totales */}
                  <div className="flex flex-col p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                    <div className="flex items-center gap-2 text-emerald-700 mb-2">
                      <TrendingUp size={16} />
                      <span className="text-sm font-medium">Ventas Totales</span>
                    </div>
                    <span className="text-2xl font-bold text-emerald-700">
                      S/ {Number(seller.total_sales || 0).toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* KPI: Órdenes Totales */}
                  <div className="flex flex-col p-4 rounded-xl border border-border/50 bg-card">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <ShoppingCart size={16} className="text-amber-500" />
                      <span className="text-sm font-medium">Órdenes Generadas</span>
                    </div>
                    <span className="text-2xl font-bold text-foreground">
                      {seller.total_orders || 0}
                    </span>
                  </div>

                  {/* KPI: Órdenes Completadas */}
                  <div className="flex flex-col p-4 rounded-xl border border-border/50 bg-card">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <CheckCircle size={16} className="text-emerald-500" />
                      <span className="text-sm font-medium">Órdenes Completadas</span>
                    </div>
                    <span className="text-2xl font-bold text-foreground">
                      {seller.completed_orders || 0}
                    </span>
                  </div>

                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}