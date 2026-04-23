import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, User, Phone, Mail, Calendar, Target, Percent, Briefcase } from "lucide-react";
import { getUserById, getSellerProfileByUserId } from "../services/userService";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";

export default function UserDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: userRes, isLoading: isLoadingUser } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUserById(id as string),
    enabled: !!id,
  });
  
  const user = (userRes as any)?.data || userRes;

  const isSales = user?.role?.name === "SALES_REP";

  const { data: sellerRes, isLoading: isLoadingSeller } = useQuery({
    queryKey: ["sellerProfile", id],
    queryFn: () => getSellerProfileByUserId(id as string),
    enabled: !!id && isSales,
  });

  const sellerProfile = (sellerRes as any)?.data || sellerRes;

  if (isLoadingUser || (isSales && isLoadingSeller)) {
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
        <Button variant="link" onClick={() => navigate("/admin/usuarios")}>Volver a la lista</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto fade-in">
      {/* Header section */}
      <div className="flex items-center gap-4 border-b border-border/50 pb-6">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="shrink-0 h-9 w-9">
          <ArrowLeft size={16} />
        </Button>
        <div className="flex-1 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {user.first_name} {user.last_name}
            </h1>
            <Badge
              variant="outline"
              className={
                user.role?.name === "ADMIN"
                  ? "border-red-200 text-red-700 bg-red-50/50"
                  : user.role?.name === "SALES_REP"
                  ? "border-blue-200 text-blue-700 bg-blue-50/50"
                  : user.role?.name === "MARKETING"
                  ? "border-emerald-200 text-emerald-700 bg-emerald-50/50"
                  : "border-gray-200 text-gray-700 bg-gray-50/50"
              }
            >
              {user.role?.name || "SIN ROL"}
            </Badge>
            <Badge
              variant="secondary"
              className={
                user.is_active
                  ? "bg-green-100 text-green-700 hover:bg-green-100 shadow-none"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-100 shadow-none"
              }
            >
              {user.is_active ? "Activo" : "Inactivo"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm border-border/60">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <User size={16} className="text-primary" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase font-semibold">Email</span>
              <div className="flex items-center gap-2 text-sm text-foreground font-medium bg-muted/30 p-2.5 rounded-lg border border-border/50">
                <Mail size={14} className="text-muted-foreground" />
                {user.email}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase font-semibold">Celular</span>
              <div className="flex items-center gap-2 text-sm text-foreground font-medium bg-muted/30 p-2.5 rounded-lg border border-border/50">
                <Phone size={14} className="text-muted-foreground" />
                {user.cellphone || "No especificado"}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase font-semibold">Fecha de Registro</span>
              <div className="flex items-center gap-2 text-sm text-foreground font-medium bg-muted/30 p-2.5 rounded-lg border border-border/50">
                <Calendar size={14} className="text-muted-foreground" />
                {user.created_at ? new Date(user.created_at).toLocaleDateString() : "No disponible"}
              </div>
            </div>
          </CardContent>
        </Card>

        {isSales && sellerProfile && (
          <Card className="shadow-sm border-border/60">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Briefcase size={16} className="text-amber-600" />
                Perfil de Ventas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground uppercase font-semibold">Meta de Ventas (Mensual)</span>
                <div className="flex items-center gap-2 text-sm text-foreground font-medium bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 text-amber-700">
                  <Target size={14} />
                  S/ {Number(sellerProfile.sales_target || 0).toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground uppercase font-semibold">Descuento Máximo Permitido</span>
                <div className="flex items-center gap-2 text-sm text-foreground font-medium bg-muted/30 p-2.5 rounded-lg border border-border/50">
                  <Percent size={14} className="text-muted-foreground" />
                  {Number(sellerProfile.max_discount || 0)}%
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
