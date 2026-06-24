import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { getCourses, createCourseEdition, getCourseEditionById, updateCourseEdition } from "../services/courseService";
import { getProfessors } from "../services/professorService";
import { editionFormSchema, type EditionFormValues, defaultEditionFormValues } from "../schemas/editionFormSchema";
import { editionAdapter } from "../adapters/editionAdapter";
import { useNavigate, useParams, useLocation } from "react-router-dom";

export const useEditionFormModal = (
  open = true,
  onClose?: () => void,
  courseId?: string | null,
  courseCode?: string | null,
  editionId?: string | null,
  courseClassesNumber?: number | null
) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { id: paramEditionId } = useParams<{ id: string }>();
  const location = useLocation();

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  // Shadow parameters with resolved values from router or parameters
  const actualEditionId = editionId || paramEditionId || null;
  const actualCourseId = courseId || queryParams.get("courseId") || location.state?.courseId || null;
  const actualCourseCode = courseCode || queryParams.get("courseCode") || location.state?.courseCode || null;
  const actualCourseClassesNumber = courseClassesNumber || (queryParams.get("courseClassesNumber") ? Number(queryParams.get("courseClassesNumber")) : null) || location.state?.courseClassesNumber || null;

  const mode = actualEditionId ? "edit" : "create";

  const [startMonth, setStartMonth] = useState<Date>(new Date());
  const [endMonth, setEndMonth] = useState<Date>(new Date());

  const form = useForm<EditionFormValues>({
    resolver: standardSchemaResolver(editionFormSchema),
    mode: "onTouched",
    defaultValues: {
      ...defaultEditionFormValues,
      course_id: actualCourseId || "",
    },
  });



  const { data: editionRes, isLoading: isLoadingEdition, isError: isErrorEdition } = useQuery({
    queryKey: ["edition", actualEditionId],
    queryFn: () => getCourseEditionById(actualEditionId as string),
    enabled: !!actualEditionId && open,
  });

  const { data: coursesRes, isLoading: isLoadingCourses } = useQuery({
    queryKey: ["courses"],
    queryFn: getCourses,
    enabled: mode !== "edit" && open,
  });

  const { data: professorsRes, isLoading: isLoadingProfessors } = useQuery({
    queryKey: ["professors"],
    queryFn: getProfessors,
    enabled: open,
  });

  const courses = useMemo(() => coursesRes?.success ? coursesRes.data : [], [coursesRes]);
  const professors = useMemo(() => professorsRes?.success ? professorsRes.data : [], [professorsRes]);

  // 1. Efecto para Resetear o Llenar Datos Iniciales
  useEffect(() => {
    
    if (!open) {
      form.reset();
      return;
    }

    if (mode === "create") {
      form.reset(editionAdapter.toForm(null, actualCourseId, actualCourseClassesNumber));
    } else if (editionRes && editionRes.success && editionRes.data) {
      const formData = editionAdapter.toForm(editionRes.data);

      if (formData.start_date) {
        setStartMonth(prev => prev.getTime() !== formData.start_date!.getTime() ? formData.start_date! : prev);
      }
      if (formData.end_date) {
        setEndMonth(prev => prev.getTime() !== formData.end_date!.getTime() ? formData.end_date! : prev);
      }

      form.reset(formData);
    }
  }, [open, editionRes, actualCourseId, mode, form, actualCourseClassesNumber]);

  // Nuevo useEffect para forzar la actualización de los selects de Radix cuando la data esté disponible
  useEffect(() => {
    if (editionRes?.success && editionRes?.data) {
      form.setValue("modality", editionRes.data.modality as any, { shouldValidate: true });
      form.setValue("edition_status", editionRes.data.edition_status as any, { shouldValidate: true });
    }
  }, [editionRes, form]);

  // 🧠 2. AUTO-GENERADOR DE CÓDIGO EN TIEMPO REAL
  const watchCourseId = form.watch("course_id");
  const watchEditionNumber = form.watch("edition_number");
  const watchStartDate = form.watch("start_date");

  useEffect(() => {
    // Evitamos sobreescribir el código si el usuario está en modo edición
    if (mode === "edit") return;

    const finalCourseId = actualCourseId || watchCourseId;

    // Solo generamos el código si tenemos el curso y un número válido (1-9)
    if (finalCourseId && watchEditionNumber > 0 && watchEditionNumber < 10) {
      const selectedCourseCodeStr = actualCourseCode || courses.find((c: any) => c.id === finalCourseId)?.code;

      if (selectedCourseCodeStr) {
        let paddedCourse = selectedCourseCodeStr.substring(0, 7).toUpperCase().padEnd(7, 'X');
        const edStr = String(watchEditionNumber).substring(0, 2).padStart(2, '0');
        const yearStr = (watchStartDate ? watchStartDate.getFullYear() : new Date().getFullYear()).toString();

        const generatedCode = `${paddedCourse}${edStr}${yearStr}`;

        if (form.getValues("edition_code") !== generatedCode) {
          form.setValue("edition_code", generatedCode, { shouldValidate: true, shouldDirty: true });
        }
      }
    }
  }, [watchCourseId, watchEditionNumber, watchStartDate, actualCourseId, actualCourseCode, courses, mode, isLoadingEdition, form]);

  // 3. AUTO-RELLENAR NÚMERO DE CLASES SEGÚN EL CURSO SELECCIONADO
  const [lastCourseId, setLastCourseId] = useState("");

  useEffect(() => {
    if (mode === "create" && watchCourseId) {
      let targetClassesNumber: number | null = null;

      // Caso A: Buscar en la lista de cursos cargados
      if (courses.length > 0) {
        const selectedCourse = courses.find((c: any) => c.id === watchCourseId);
        if (selectedCourse?.classes_number) {
          targetClassesNumber = selectedCourse.classes_number;
        }
      }

      // Caso B: Lógica de Fallback para vista detalle en OnMount
      if (!targetClassesNumber && actualCourseClassesNumber && watchCourseId === actualCourseId) {
        targetClassesNumber = actualCourseClassesNumber;
      }

      if (targetClassesNumber) {
        const currentClassesNumber = form.getValues("classes_number");

        // Evitar bucles: Solo rellenar si está vacío o si el curso acaba de cambiar
        if (!currentClassesNumber || watchCourseId !== lastCourseId) {
          form.setValue("classes_number", targetClassesNumber, {
            shouldValidate: true,
            shouldDirty: true
          });
        }
      }

      // Sincronizar el último courseId analizado
      if (watchCourseId !== lastCourseId) {
        setLastCourseId(watchCourseId);
      }
    }
  }, [watchCourseId, courses, mode, actualCourseId, actualCourseClassesNumber, lastCourseId, form]);

  // 3. Mutaciones y Envío
  const createEditionMutation = useMutation({ mutationFn: createCourseEdition });
  const updateEditionMutation = useMutation({ mutationFn: (data: any) => updateCourseEdition(actualEditionId as string, data) });

  const onSubmit = async (values: EditionFormValues) => {
    if (values.start_date && values.end_date && values.end_date < values.start_date) {
      form.setError("end_date", { type: "manual", message: "La fecha final no puede ser anterior a la de inicio" });
      return;
    }

    const payload = editionAdapter.toPayload(values);

    const mutationPromise = mode === "create"
      ? createEditionMutation.mutateAsync(payload)
      : updateEditionMutation.mutateAsync(payload);

    toast.promise(mutationPromise, {
      loading: mode === "create" ? "Programando edición..." : "Actualizando edición...",
      success: () => {
        queryClient.invalidateQueries({ queryKey: ["editions"] });
        if (actualEditionId) queryClient.invalidateQueries({ queryKey: ["edition", actualEditionId] });
        const relevantCourseId = actualCourseId || values.course_id;
        if (relevantCourseId) queryClient.invalidateQueries({ queryKey: ["course", relevantCourseId] });
        else queryClient.invalidateQueries({ queryKey: ["courses"] });

        if (onClose) {
          onClose();
        } else {
          navigate(relevantCourseId ? `/admin/cursos/${relevantCourseId}` : "/admin/cursos");
        }
        return mode === "create" ? "Edición programada exitosamente" : "Edición actualizada correctamente";
      },
      error: () => "Hubo un error al guardar la edición. Revisa los datos."
    });
  };

  return {
    form,
    mode,
    courses,
    professors,
    isLoadingEdition,
    isErrorEdition,
    isLoadingCourses,
    isLoadingProfessors,
    startMonth,
    setStartMonth,
    endMonth,
    setEndMonth,
    isPending: createEditionMutation.isPending || updateEditionMutation.isPending,
    onSubmit,
  };
};