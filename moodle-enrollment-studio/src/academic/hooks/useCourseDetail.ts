import { useState } from "react";
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

  const course = response?.success ? response.data : null;

  const goBack = () => navigate("/admin/cursos");

  const openDetail = (editionId: string) => {
    setSelectedEditionId(editionId);
    setShowDetailModal(true);
  };

  const openDelete = (editionId: string) => {
    setSelectedEditionId(editionId);
    setShowDeleteAlert(true);
  };

  const openEditEdition = (editionId: string) => {
    setEditionIdToEdit(editionId);
    setShowEditionModal(true);
  };

  const closeEditionModal = () => {
    setShowEditionModal(false);
    setTimeout(() => setEditionIdToEdit(null), 300);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedEditionId(null);
  };

  const confirmDelete = () => {
    if (selectedEditionId) {
      deleteMutation.mutate(selectedEditionId);
    }
  };

  const adjustDateTz = (dateStr: string) => {
    const rawDate = new Date(dateStr);
    return addMinutes(rawDate, rawDate.getTimezoneOffset());
  };

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
    actions: {
      goBack,
      openDetail,
      openDelete,
      openEditEdition,
      closeEditionModal,
      closeDetailModal,
      confirmDelete,
      adjustDateTz,
    },
    deleteIsPending: deleteMutation.isPending,
  };
};
