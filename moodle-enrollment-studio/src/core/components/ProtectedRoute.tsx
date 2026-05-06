import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) return <div>Cargando sesión...</div>; // O un Spinner

  if (!isAuthenticated) {
    // Redirige al login pero guarda dónde quería ir el usuario
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role.name || "")) {
    // Si está autenticado pero no tiene el rol, mándalo a una página de "No Autorizado" o al Home
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />; // Renderiza las rutas hijas
};