import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format, addMinutes } from "date-fns";
import { getCourses, getModalities, createCourseEdition, getCourseEditionById, updateCourseEdition } from "../services/courseService";
import { editionFormSchema, type EditionFormValues } from "../schemas/editionFormSchema";

export const useEditionFormModal = (open: boolean, onClose: () => void, courseId?: string | null, courseCode?: string | null, editionId?: string | null) => {
  const queryClient = useQueryClient();
  const mode = editionId ? "edit" : "create";

  const [startMonth, setStartMonth] = useState<Date>(new Date());
  const [endMonth, setEndMonth] = useState<Date>(new Date());

  const form = useForm<EditionFormValues>({
    resolver: zodResolver(editionFormSchema),
    mode: "onTouched",
    defaultValues: {
      course_id: courseId || "",
      edition_number: "" as unknown as number,
      edition_code: "",
      start_date: undefined,
      end_date: undefined,
      modality_id: "",
      teacher_fullname: "",
      meet_link: "",
      edition_status: "SCHEDULED",
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
    enabled: !courseId && mode !== "edit" && open,
  });

  const { data: modalitiesRes, isLoading: isLoadingModalities } = useQuery({
    queryKey: ["modalities"],
    queryFn: getModalities,
    enabled: open, 
  });

  const courses = Array.isArray(coursesRes) ? coursesRes : (coursesRes?.data || []);
  const modalities = Array.isArray(modalitiesRes) ? modalitiesRes : (modalitiesRes?.data || []);

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
      });
    } else if (editionRes) {
      const data = editionRes.data || (editionRes as any);
      if (data) {
        const adjustedStartDate = data.start_date ? adjustDateTz(data.start_date) : undefined;
        const adjustedEndDate = data.end_date ? adjustDateTz(data.end_date) : undefined;
        
        if (adjustedStartDate) setStartMonth(adjustedStartDate);
        if (adjustedEndDate) setEndMonth(adjustedEndDate);

        let mappedModalityId = data.modality_id || "";
        if (typeof data.modality === "string" && modalities.length > 0) {
          const foundModality = modalities.find((m: any) => m.name.toLowerCase() === data.modality.toLowerCase());
          if (foundModality) mappedModalityId = foundModality.id;
        } else if (data.modality && typeof data.modality === "object") {
          mappedModalityId = data.modality.id || data.modality_id || "";
        }

        form.reset({
          course_id: courseId || data.course?.id || data.course_id || "",
          edition_number: data.edition_number || ("" as unknown as number),
          edition_code: data.edition_code || "",
          start_date: adjustedStartDate,
          end_date: adjustedEndDate,
          modality_id: mappedModalityId,
          teacher_fullname: data.teacher_fullname || "",
          meet_link: data.meet_link || "",
          edition_status: data.edition_status || "SCHEDULED",
        });
      }
    }
  }, [open, editionRes, courseId, mode, form, modalities]);

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
        const edStr = String(watchEditionNumber).substring(0, 1);
        const yearStr = (watchStartDate ? watchStartDate.getFullYear() : new Date().getFullYear()).toString();
        
        const generatedCode = `${paddedCourse}${edStr}${yearStr}`;
        
        // Comprobamos si el código generado es diferente al actual para no interrumpir al usuario si está escribiendo manualmente
        if (form.getValues("edition_code") !== generatedCode) {
          form.setValue("edition_code", generatedCode, { shouldValidate: true, shouldDirty: true });
        }
      }
    }
  }, [watchCourseId, watchEditionNumber, watchStartDate, courseId, courseCode, courses, mode, isLoadingEdition, form]);


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
      modality_id: values.modality_id,
      edition_number: Number(values.edition_number),
      start_date: values.start_date ? values.start_date.toISOString() : null,
      end_date: values.end_date ? values.end_date.toISOString() : null,
      teacher_fullname: values.teacher_fullname,
      meet_link: values.meet_link?.trim() ? values.meet_link : null, 
      edition_status: values.edition_status
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
    modalities,
    isLoadingEdition,
    isErrorEdition,
    isLoadingCourses,
    isLoadingModalities,
    startMonth,
    setStartMonth,
    endMonth,
    setEndMonth,
    isPending: createEditionMutation.isPending || updateEditionMutation.isPending,
    onSubmit,
  };
};