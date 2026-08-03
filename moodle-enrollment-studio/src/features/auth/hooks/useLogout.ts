import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { logout } from "../services/authService";

export function useLogout() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      toast.success("Sesión cerrada");
      setUser(null);
      navigate("/login");
    },
    onError: () => {
      toast.error("Error al cerrar sesión");
    },
  });
}
