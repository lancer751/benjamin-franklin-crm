import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSearchStore } from "@/store/useSearchStore";
import { getCourses, deleteCourse } from "../services/courseService";

export const useCoursesAdminView = () => {
  const queryClient = useQueryClient();

  // Estados de UI
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showEditionForm, setShowEditionForm] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  // Buscador Global
  const { searchQuery, setPlaceholder, setSearchQuery } = useSearchStore();

  useEffect(() => {
    setPlaceholder("Buscar cursos por nombre o código...");
    return () => setSearchQuery("");
  }, [setPlaceholder, setSearchQuery]);

  // Petición (GET)
  const { data: coursesRes, isLoading, isError } = useQuery({
    queryKey: ["courses"],
    queryFn: getCourses,
  });

  // Mutación (DELETE)
  const deleteMutation = useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setShowDeleteAlert(false);
      setSelectedCourse(null);
      toast.success("Curso eliminado exitosamente");
    },
  });

  // Procesamiento de Datos
  const courses = coursesRes?.success && Array.isArray(coursesRes.data) ? coursesRes.data : [];

  const filteredCourses = courses.filter((course: any) => {
    const query = (searchQuery || "").toLowerCase();
    const matchName = (course.name || "").toLowerCase().includes(query);
    const matchCode = (course.code || "").toLowerCase().includes(query);
    return matchName || matchCode;
  });

  // Utilidades
  const getInitials = (name: string) => {
    if (!name) return "C";
    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Handlers
  const handleOpenCourseForm = (course: any = null) => {
    setSelectedCourse(course);
    setShowCourseForm(true);
  };

  const handleCloseCourseForm = () => {
    setShowCourseForm(false);
    setSelectedCourse(null);
  };

  const handleOpenDeleteAlert = (course: any) => {
    setSelectedCourse(course);
    setShowDeleteAlert(true);
  };

  const confirmDelete = () => {
    if (selectedCourse?.id) {
      deleteMutation.mutate(selectedCourse.id);
    }
  };

  return {
    // Datos y Estados
    isLoading,
    isError,
    filteredCourses,
    viewMode,
    modals: {
      showCourseForm,
      showEditionForm,
      showDeleteAlert,
      selectedCourse,
    },
    isDeleting: deleteMutation.isPending,
    
    // Funciones
    getInitials,
    setViewMode,
    setShowEditionForm,
    setShowDeleteAlert,
    handleOpenCourseForm,
    handleCloseCourseForm,
    handleOpenDeleteAlert,
    confirmDelete,
  };
};