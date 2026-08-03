import { useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6 bg-card border border-border p-8 rounded-xl shadow-lg">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert size={32} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Acceso Denegado</h1>
          <p className="text-sm text-muted-foreground">
            No tienes los permisos necesarios para acceder a esta sección. Por favor, contacta al administrador del sistema si consideras que deberías tener acceso.
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full inline-flex justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Volver al Panel de Control
        </button>
      </div>
    </div>
  );
}
