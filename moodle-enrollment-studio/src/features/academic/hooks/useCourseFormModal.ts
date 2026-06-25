import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createCourse, updateCourse } from "../services/courseService";
import { uploadImageToCloudinary } from "@/core/lib/uploadService";
import { courseFormSchema, type CourseFormValues } from "../schemas/courseFormSchema";
import { courseAdapter } from "../adapters/courseAdapter";

function generateCourseCode(name: string): string {
  const cleanName = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();

  const words = cleanName.replace(/[^A-Z0-9\s]/g, "").split(/\s+/).filter(Boolean);

  let prefix = "";
  if (words.length >= 4) {
    const lastFour = words.slice(-4);
    prefix = lastFour.map(w => w[0]).join("");
  } else if (words.length > 0) {
    const joint = words.join("");
    prefix = joint.slice(0, 4);
    while (prefix.length < 4) {
      prefix += "X";
    }
  } else {
    prefix = "CURS";
  }

  prefix = prefix.slice(0, 4);
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `${prefix}${randomNum}`;
}

export const useCourseFormModal = (open: boolean, onClose: () => void, initialData?: any) => {
  const queryClient = useQueryClient();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<CourseFormValues>({
    resolver: standardSchemaResolver(courseFormSchema) as any,
    mode: "onTouched",
    defaultValues: courseAdapter.toForm(null),
  });

  // Sync initialData
  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset(courseAdapter.toForm(initialData));
        setPreviewUrl(initialData.image_url || null);
      } else {
        form.reset(courseAdapter.toForm(null));
        setPreviewUrl(null);
      }
      setImageFile(null);
    }
  }, [initialData, open, form]);

  // Autogenerate code on name input change (creation mode only)
  const watchName = form.watch("name");
  useEffect(() => {
    if (!initialData && open && watchName && watchName.trim().length >= 3) {
      const generated = generateCourseCode(watchName);
      form.setValue("code", generated, { shouldValidate: true, shouldDirty: true });
    }
  }, [watchName, initialData, open, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      form.setValue("image_url", url, { shouldValidate: true, shouldDirty: true });
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    setImageFile(null);
    form.setValue("image_url", "", { shouldValidate: true, shouldDirty: true });
  };

  const createMutation = useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      toast.success("Curso creado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      onClose();
    },
    onError: () => {
      toast.error("Hubo un error al crear el curso");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateCourse(id, data),
    onSuccess: () => {
      toast.success("Curso actualizado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      onClose();
    },
    onError: () => {
      toast.error("Hubo un error al actualizar el curso");
    }
  });

  const onSubmit = async (values: CourseFormValues) => {
    let finalImageUrl = values.image_url;
    setIsUploading(true);

    try {
      if (imageFile) {
        finalImageUrl = await uploadImageToCloudinary(imageFile);
      }

      const payload = courseAdapter.toPayload({
        ...values,
        image_url: finalImageUrl,
      });

      if (initialData?.id) {
        await updateMutation.mutateAsync({ id: initialData.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
    } catch (error) {
      toast.error("Error al subir la imagen o guardar el curso");
    } finally {
      setIsUploading(false);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending || isUploading;

  return {
    form,
    onSubmit,
    isPending,
    isUploading,
    previewUrl,
    imageFile,
    handleImageChange,
    handleRemoveImage,
  };
};
