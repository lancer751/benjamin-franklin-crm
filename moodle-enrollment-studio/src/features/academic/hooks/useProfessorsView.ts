import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getProfessors, deleteProfessor } from "../services/professorService";
import { useSearchStore } from "@/store/useSearchStore";

export const useProfessorsView = () => {
  const queryClient = useQueryClient();
  
  // Estados de UI
  const [professorToDelete, setProfessorToDelete] = useState<string | null>(null);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { searchQuery, setPlaceholder, setSearchQuery } = useSearchStore();

  useEffect(() => {
    setPlaceholder("Buscar por nombre, apellido o email...");
    return () => setSearchQuery(""); 
  }, [setPlaceholder, setSearchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // ==========================================================
  // QUERY: OBTENER DOCENTES
  // ==========================================================
  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["professors"],
    queryFn: getProfessors,
  });

  const professors = useMemo(() => {
    const resObj = response as any;
    return resObj?.success ? resObj.data : [];
  }, [response]);

  // ==========================================================
  // MUTACIÓN: ELIMINAR DOCENTE
  // ==========================================================
  const deleteMutation = useMutation({
    mutationFn: deleteProfessor,
    onSuccess: (res: any) => {
      if (res?.success) {
        toast.success("Docente eliminado correctamente");
        queryClient.invalidateQueries({ queryKey: ["professors"] });
        setProfessorToDelete(null);
      } else {
        toast.error("Error al eliminar docente");
      }
    },
    onError: () => toast.error("Error al eliminar docente")
  });

  // Lógica de Filtrado (Búsqueda)
  const filteredProfessors = useMemo(() => {
    return professors.filter((p: any) => {
      const searchLower = searchQuery.toLowerCase();
      const fullName = `${p.name || ""} ${p.lastname || ""}`.toLowerCase();
      const email = (p.email || "").toLowerCase();
      
      return fullName.includes(searchLower) || email.includes(searchLower);
    });
  }, [professors, searchQuery]);

  // Lógica de Paginación
  const paginatedProfessors = filteredProfessors.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);



  const handleDeleteConfirm = () => {
    if (professorToDelete) {
      deleteMutation.mutate(professorToDelete);
    }
  };

  return {
    isLoading,
    isError,
    professors: filteredProfessors,
    totalFiltered: filteredProfessors.length,
    pagination: { currentPage, itemsPerPage },
    deleteAlert: { isOpen: !!professorToDelete, isPending: deleteMutation.isPending },
    setCurrentPage,
    setProfessorToDelete,
    handleDeleteConfirm,
  };
};
