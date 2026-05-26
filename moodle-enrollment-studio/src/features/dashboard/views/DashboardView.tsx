import { useAuthStore } from "@/store/useAuthStore";
import { translateEnum, RoleTranslationsMap } from "@/core/utils/dictionaries";
import { Badge } from "@/core/components/ui/badge";
import { User, Mail, Shield, CheckCircle, XCircle } from "lucide-react";

const DashboardView = () => {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6 max-w-3xl">
      {/* SECCIÓN DE BIENVENIDA */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-background border border-border/60 p-5 md:p-6">
        <div className="relative z-10 space-y-2">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            ¡Hola de nuevo, {user?.first_name || "Usuario"}! 👋
          </h1>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Bienvenido al Moodle Manager de la Corporación Educativa Benjamin Franklin. Este es tu panel general de control.
          </p>
        </div>
        {/* Elemento de diseño de fondo premium */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
      </div>

      {/* TARJETA DE PERFIL (Ficha de Datos Reales) */}
      <div className="bg-card border border-border/80 rounded-2xl p-5 md:p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-border/60 pb-4 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <User className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Información de tu Cuenta</h2>
            <p className="text-xs text-muted-foreground">Datos generales de tu perfil en la corporación</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Columna Izquierda: Información de Identidad */}
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nombre Completo</span>
              <div className="flex items-center gap-2 text-sm font-medium text-foreground bg-slate-50/80 dark:bg-muted/40 px-3.5 py-2.5 rounded-xl border border-border/50">
                <span className="capitalize">{user?.first_name} {user?.last_name || ""}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Correo Electrónico</span>
              <div className="flex items-center gap-2 text-sm text-foreground bg-slate-50/80 dark:bg-muted/40 px-3.5 py-2.5 rounded-xl border border-border/50 break-all">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{user?.email || "No especificado"}</span>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Estado y Permisos */}
          <div className="space-y-4 flex flex-col justify-start">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Estado del Acceso</span>
              <div>
                {user?.is_active ? (
                  <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20 px-3 py-1 text-xs font-semibold rounded-lg shadow-none">
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                    Activo
                  </Badge>
                ) : (
                  <Badge className="bg-zinc-500/10 text-zinc-600 hover:bg-zinc-500/20 border-zinc-500/20 px-3 py-1 text-xs font-semibold rounded-lg shadow-none">
                    <XCircle className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                    Inactivo
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Tipo de Perfil (Rol)</span>
              <div>
                <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary px-3 py-1 text-xs font-semibold rounded-lg shadow-none w-fit">
                  <Shield className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                  {translateEnum(user?.role?.name, RoleTranslationsMap)}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
