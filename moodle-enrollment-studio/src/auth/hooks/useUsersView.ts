import { useState, useEffect } from "react";
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

  // Estado Global del Buscador
  const { searchQuery, setPlaceholder, setSearchQuery } = useSearchStore();

  // Efecto: Configurar el buscador al montar el componente
  useEffect(() => {
    setPlaceholder("Buscar por nombre, apellido o email...");
    return () => setSearchQuery(""); 
  }, [setPlaceholder, setSearchQuery]);

  // Efecto: Resetear la paginación cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, statusFilter]);

  // Query: Obtener usuarios
  const { data: usersRes, isLoading, isError } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  // Mutación: Eliminar usuario
  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success("Usuario eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setUserToDelete(null);
    },
    onError: () => toast.error("Error al eliminar usuario")
  });

  // Datos base
  const users = Array.isArray(usersRes) ? usersRes : [];

  // KPIs
  const totalUsers = users.length;
  const activeUsers = users.filter((u: any) => u.is_active).length;
  const salesReps = users.filter((u: any) => u.role?.name === "SALES_REP").length;

  // Lógica de Filtrado (Rol + Búsqueda + Estado)
  const filteredUsers = users.filter((u: any) => {
    const matchesRole = roleFilter === "ALL" || u.role?.name === roleFilter;
    
    const searchLower = searchQuery.toLowerCase();
    const fullName = `${u.first_name || ""} ${u.last_name || ""}`.toLowerCase();
    const email = (u.email || "").toLowerCase();
    const matchesSearch = fullName.includes(searchLower) || email.includes(searchLower);

    const matchesStatus = statusFilter === "ALL" || (statusFilter === "ACTIVE" ? u.is_active : !u.is_active);

    return matchesRole && matchesSearch && matchesStatus;
  });

  // Lógica de Paginación
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Acciones (Handlers)
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

  // Retornamos todo lo que la vista necesita
  return {
    // Datos y Estados
    isLoading,
    isError,
    users: paginatedUsers,
    totalFiltered: filteredUsers.length,
    kpis: { totalUsers, activeUsers, salesReps },
    filters: { roleFilter, statusFilter },
    pagination: { currentPage, itemsPerPage },
    modal: { isOpen: isModalOpen, selectedUser },
    deleteAlert: { isOpen: !!userToDelete, isPending: deleteMutation.isPending },
    
    // Setters y Handlers
    setRoleFilter,
    setStatusFilter,
    setCurrentPage,
    setUserToDelete,
    handleOpenModal,
    handleCloseModal,
    handleDeleteConfirm,
  };
};