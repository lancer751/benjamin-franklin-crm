import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format, addMinutes } from "date-fns";
import { getCourses, createCourseEdition, getCourseEditionById, updateCourseEdition } from "../services/courseService";
import { editionFormSchema, type EditionFormValues, defaultEditionFormValues } from "../schemas/editionFormSchema";


export const useEditionFormModal = (open: boolean, onClose: () => void, courseId?: string | null, courseCode?: string | null, editionId?: string | null, courseClassesNumber?: number | null) => {
  const queryClient = useQueryClient();
  const mode = editionId ? "edit" : "create";

  const [startMonth, setStartMonth] = useState<Date>(new Date());
  const [endMonth, setEndMonth] = useState<Date>(new Date());

  const form = useForm<EditionFormValues>({
    resolver: zodResolver(editionFormSchema),
    mode: "onTouched",
    defaultValues: {
      ...defaultEditionFormValues,
      course_id: courseId || "",
    },
  });

  const adjustDateTz = (dateStr: string) => {
    const rawDate = new Date(dateStr);
    return addMinutes(rawDate, rawDate.getTimezoneOffset());
  };

  const { data: editionRes, isLoading: isLoadingEdition, isError: isErrorEdition } = useQuery({
    queryKey: ["edition", editionId],
    queryFn: () => getCourseEditionById(editionId as string),
    enabled: !!editionId && open,
  });

  const { data: coursesRes, isLoading: isLoadingCourses } = useQuery({
    queryKey: ["courses"],
    queryFn: getCourses,
    enabled: mode !== "edit" && open,
  });

  const courses = useMemo(() => coursesRes?.success ? coursesRes.data : [], [coursesRes]);

  // 1. Efecto para Resetear o Llenar Datos Iniciales
  useEffect(() => {
    if (!open) {
      form.reset();
      return;
    }

    if (mode === "create") {
      form.reset({
        course_id: courseId || "",
        edition_status: "SCHEDULED",
        classes_number: courseClassesNumber || ("" as unknown as number),
      });
    } else if (editionRes) {
      const data = editionRes?.success ? editionRes.data : null;
      if (data) {
        const adjustedStartDate = data.start_date ? adjustDateTz(data.start_date) : undefined;
        const adjustedEndDate = data.end_date ? adjustDateTz(data.end_date) : undefined;
        
        if (adjustedStartDate) {
          setStartMonth(prev => prev.getTime() !== adjustedStartDate.getTime() ? adjustedStartDate : prev);
        }
        if (adjustedEndDate) {
          setEndMonth(prev => prev.getTime() !== adjustedEndDate.getTime() ? adjustedEndDate : prev);
        }

        let mappedModality = data.modality || "";

        form.reset({
          course_id: courseId || data.course?.id || data.course_id || "",
          edition_number: data.edition_number || ("" as unknown as number),
          edition_code: data.edition_code || "",
          start_date: adjustedStartDate,
          end_date: adjustedEndDate,
          modality: mappedModality,
          teacher_fullname: data.teacher_fullname || "",
          meet_link: data.meet_link || "",
          edition_status: data.edition_status || "SCHEDULED",
          hours_amount: data.hours_amount || ("" as unknown as number),
          classes_number: data.classes_number || ("" as unknown as number),
          duration_value: data.duration_value || ("" as unknown as number),
          duration_unit: data.duration_unit || "WEEKS",
          whatsapp_group_link: data.whatsapp_group_link || "",
        });
      }
    }
  }, [open, editionRes, courseId, mode, form, courseClassesNumber]);

  // 🧠 2. AUTO-GENERADOR DE CÓDIGO EN TIEMPO REAL
  const watchCourseId = form.watch("course_id");
  const watchEditionNumber = form.watch("edition_number");
  const watchStartDate = form.watch("start_date");

  useEffect(() => {
    // Evitamos sobreescribir el código si el usuario está en modo edición y recién cargan los datos de la BD
    if (mode === "edit" && isLoadingEdition) return;

    const finalCourseId = courseId || watchCourseId;
    
    // Solo generamos el código si tenemos el curso y un número válido (1-9)
    if (finalCourseId && watchEditionNumber > 0 && watchEditionNumber < 10) {
      const selectedCourseCodeStr = courseCode || courses.find((c: any) => c.id === finalCourseId)?.code;
      
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
  }, [watchCourseId, watchEditionNumber, watchStartDate, courseId, courseCode, courses, mode, isLoadingEdition, form]);

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
      if (!targetClassesNumber && courseClassesNumber && watchCourseId === courseId) {
        targetClassesNumber = courseClassesNumber;
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
  }, [watchCourseId, courses, mode, courseId, courseClassesNumber, lastCourseId, form]);


  // 3. Mutaciones y Envío
  const createEditionMutation = useMutation({ mutationFn: createCourseEdition });
  const updateEditionMutation = useMutation({ mutationFn: (data: any) => updateCourseEdition(editionId as string, data) });

  const onSubmit = async (values: EditionFormValues) => {
    if (values.start_date && values.end_date && values.end_date < values.start_date) {
      form.setError("end_date", { type: "manual", message: "La fecha final no puede ser anterior a la de inicio" });
      return;
    }

    const payload = {
      course_id: values.course_id,
      edition_code: values.edition_code,
      modality: values.modality,
      edition_number: Number(values.edition_number),
      start_date: values.start_date ? values.start_date.toISOString() : null,
      end_date: values.end_date ? values.end_date.toISOString() : null,
      teacher_fullname: values.teacher_fullname,
      meet_link: values.meet_link?.trim() ? values.meet_link : null, 
      edition_status: values.edition_status,
      hours_amount: Number(values.hours_amount),
      classes_number: Number(values.classes_number),
      duration_value: Number(values.duration_value),
      duration_unit: values.duration_unit,
      whatsapp_group_link: values.whatsapp_group_link?.trim() ? values.whatsapp_group_link : null,
    };

    const mutationPromise = mode === "create" 
      ? createEditionMutation.mutateAsync(payload as any)
      : updateEditionMutation.mutateAsync(payload as any);

    toast.promise(mutationPromise, {
      loading: mode === "create" ? "Programando edición..." : "Actualizando edición...",
      success: () => {
        queryClient.invalidateQueries({ queryKey: ["editions"] });
        if (editionId) queryClient.invalidateQueries({ queryKey: ["edition", editionId] });
        const relevantCourseId = courseId || values.course_id;
        if (relevantCourseId) queryClient.invalidateQueries({ queryKey: ["course", relevantCourseId] });
        else queryClient.invalidateQueries({ queryKey: ["courses"] });
        
        onClose();
        return mode === "create" ? "Edición programada exitosamente" : "Edición actualizada correctamente";
      },
      error: () => "Hubo un error al guardar la edición. Revisa los datos."
    });
  };

  return {
    form,
    mode,
    courses,
    isLoadingEdition,
    isErrorEdition,
    isLoadingCourses,
    startMonth,
    setStartMonth,
    endMonth,
    setEndMonth,
    isPending: createEditionMutation.isPending || updateEditionMutation.isPending,
    onSubmit,
  };
};