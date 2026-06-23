import { useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCourseById, deleteCourseEdition } from "../services/courseService";
import { toast } from "sonner";
import { addMinutes } from "date-fns";

export const useCourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Modals state
  const [showEditionModal, setShowEditionModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const [selectedEditionId, setSelectedEditionId] = useState<string | null>(null);
  const [editionIdToEdit, setEditionIdToEdit] = useState<string | null>(null);

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["course", id],
    queryFn: () => getCourseById(id as string),
    enabled: !!id,
    select: (res: any) => {
      if (res && res.success && res.data && Array.isArray(res.data.editions)) {
        res.data.editions = [...res.data.editions].sort(
          (a, b) => (a.edition_number || 0) - (b.edition_number || 0)
        );
      }
      return res;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCourseEdition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", id] });
      setShowDeleteAlert(false);
      setSelectedEditionId(null);
      toast.success("Edición eliminada exitosamente");
    },
    onError: () => {
      toast.error("Ocurrió un error al intentar eliminar la edición.");
    },
  });

  const course = (response && typeof response === "object" && "success" in response && response.success) ? response.data : null;

  const goBack = useCallback(() => navigate("/admin/cursos"), [navigate]);

  const openDetail = useCallback((editionId: string) => {
    setSelectedEditionId(editionId);
    setShowDetailModal(true);
  }, []);

  const openDelete = useCallback((editionId: string) => {
    setSelectedEditionId(editionId);
    setShowDeleteAlert(true);
  }, []);

  const openEditEdition = useCallback((editionId: string) => {
    setEditionIdToEdit(editionId);
    setShowEditionModal(true);
  }, []);

  const closeEditionModal = useCallback(() => {
    setShowEditionModal(false);
    setTimeout(() => setEditionIdToEdit(null), 300);
  }, []);

  const closeDetailModal = useCallback(() => {
    setShowDetailModal(false);
    setSelectedEditionId(null);
  }, []);

  const confirmDelete = useCallback(() => {
    if (selectedEditionId) {
      deleteMutation.mutate(selectedEditionId);
    }
  }, [selectedEditionId, deleteMutation]);

  const adjustDateTz = useCallback((dateStr: string) => {
    const rawDate = new Date(dateStr);
    return addMinutes(rawDate, rawDate.getTimezoneOffset());
  }, []);

  const actions = useMemo(() => ({
    goBack,
    openDetail,
    openDelete,
    openEditEdition,
    closeEditionModal,
    closeDetailModal,
    confirmDelete,
    adjustDateTz,
  }), [
    goBack,
    openDetail,
    openDelete,
    openEditEdition,
    closeEditionModal,
    closeDetailModal,
    confirmDelete,
    adjustDateTz,
  ]);

  return {
    id,
    course,
    isLoading,
    isError,
    modals: {
      showEditionModal,
      setShowEditionModal,
      showDetailModal,
      setShowDetailModal,
      showDeleteAlert,
      setShowDeleteAlert,
    },
    selection: {
      selectedEditionId,
      editionIdToEdit,
      setEditionIdToEdit,
    },
    actions,
    deleteIsPending: deleteMutation.isPending,
  };
};
