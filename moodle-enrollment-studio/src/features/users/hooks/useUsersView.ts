import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getUsers, deleteUser } from "../services/userService";
import { useSearchStore } from "@/store/useSearchStore";

export const useUsersView = () => {
  const queryClient = useQueryClient();
  
  // Estados de UI y Filtros
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // Estados de Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { searchQuery, setPlaceholder, setSearchQuery } = useSearchStore();

  useEffect(() => {
    setPlaceholder("Buscar por nombre, apellido o email...");
    return () => setSearchQuery(""); 
  }, [setPlaceholder, setSearchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, statusFilter]);

  // ==========================================================
  // QUERY: OBTENER USUARIOS (Corregido para la estructura de Hono)
  // ==========================================================
  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  // Extraemos los datos de la propiedad 'data' que envía el backend
  // Si no hay respuesta, usamos un array vacío
  const users = useMemo(() => response?.success ? response.data : [], [response]);

  // ==========================================================
  // MUTACIÓN: ELIMINAR USUARIO
  // ==========================================================
  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Usuario eliminado correctamente");
        queryClient.invalidateQueries({ queryKey: ["users"] });
        setUserToDelete(null);
      }
    },
    onError: () => toast.error("Error al eliminar usuario")
  });

  // KPIs (Calculados sobre 'users' ya extraído)
  const kpis = useMemo(() => ({
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.is_active).length,
    salesReps: users.filter((u) => u.role?.name === "SALES_REP").length,
  }), [users]);

  // Lógica de Filtrado (Rol + Búsqueda + Estado)
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesRole = roleFilter === "ALL" || u.role?.name === roleFilter;
      const searchLower = searchQuery.toLowerCase();
      const fullName = `${u.first_name || ""} ${u.last_name || ""}`.toLowerCase();
      const email = (u.email || "").toLowerCase();
      const matchesSearch = fullName.includes(searchLower) || email.includes(searchLower);
      const matchesStatus = statusFilter === "ALL" || (statusFilter === "ACTIVE" ? u.is_active : !u.is_active);

      return matchesRole && matchesSearch && matchesStatus;
    });
  }, [users, roleFilter, searchQuery, statusFilter]);

  // Lógica de Paginación
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Handlers
  const handleOpenModal = (user: any | null = null) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete);
    }
  };

  return {
    isLoading,
    isError,
    users: filteredUsers,
    totalFiltered: filteredUsers.length,
    kpis,
    filters: { roleFilter, statusFilter },
    pagination: { currentPage, itemsPerPage },
    modal: { isOpen: isModalOpen, selectedUser },
    deleteAlert: { isOpen: !!userToDelete, isPending: deleteMutation.isPending },
    setRoleFilter,
    setStatusFilter,
    setCurrentPage,
    setUserToDelete,
    handleOpenModal,
    handleCloseModal,
    handleDeleteConfirm,
  };
};