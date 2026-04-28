import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCourseEditions } from "@/academic/services/courseService";
import { getCategories } from "../services/categoryService";
import { createProduct, updateProduct } from "../services/productService";
import { toast } from "sonner";
import { ProductFormValues, productFormSchema } from "../schemas/productFormSchema";
import { z } from "zod";

const createEmptyPrice = (mode: "VIRTUAL" | "PRESENCIAL" | "HEREDADO") => ({
  attendance_mode: mode,
  cash_price: "0.00",
  installment_price: "0.00",
  enrollment_fee: "0.00",
});

const generateSlug = (text: string) => {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
};

const emptyData: ProductFormValues = {
  edition_id: "",
  category_id: "",
  sales_status: "DRAFT",
  name: "",
  slug: "",
  short_description: "",
  description: "",
  installments_min_number: 1,
  installments_max_number: 1,
  discount_price: "",
  discount_expires_at: "",
  prices: [], // Will be filled dynamically
};

export const useProductFormModal = (open: boolean, onClose: () => void, initialData?: any) => {
  const isEdit = !!initialData;
  const [form, setForm] = useState<ProductFormValues>(emptyData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  useEffect(() => {
    if (initialData && open) {

      setForm({
        ...emptyData,
        ...initialData,
        slug: initialData.slug || generateSlug(initialData.name || ""),
        discount_price: initialData.discount_price != null ? String(initialData.discount_price) : "",
        discount_expires_at: initialData.discount_expires_at ? new Date(initialData.discount_expires_at).toISOString().split('T')[0] : "",
        prices: initialData.prices?.length ? initialData.prices.map((p: any) => ({
          ...p,
          cash_price: String(p.cash_price || "0.00"),
          installment_price: String(p.installment_price || "0.00"),
          enrollment_fee: String(p.enrollment_fee || "0.00")
        })) : [],
        category_id: initialData.category_id || initialData.category || "",
      });
      setErrors({});
    } else if (open) {
      setForm(emptyData);
      setErrors({});
    }
  }, [initialData, open]);

  const { data: editionsRes, isLoading: isLoadingEditions } = useQuery({
    queryKey: ["editions"],
    queryFn: getCourseEditions,
    enabled: open,
  });

  const { data: categoriesRes, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    enabled: open,
  });

  const editions = editionsRes?.success ? editionsRes.data : [];
  const selectedEdition = editions.find((e: any) => e.id === form.edition_id);
  
  const rawCategories = Array.isArray(categoriesRes) ? categoriesRes : (categoriesRes as any)?.data || [];
  const categories = rawCategories;

  // Dynamic Modality & Auto-fill logic
  useEffect(() => {
    if (!selectedEdition || isEdit) return; // Only auto-fill prices and name on create

    // 1. Auto-generate Name & Slug
    const courseName = selectedEdition.course?.name || "";
    const cohort = selectedEdition.edition_code || "";
    const generatedName = `${courseName} - ${cohort}`.trim();
    const generatedSlug = generateSlug(generatedName);

    // 2. Determine Modality for Prices
    let newPrices: ProductFormValues["prices"] = [];
    
    const modalityName = (selectedEdition.modality?.name || selectedEdition.modality || "").toUpperCase();
    
    if (modalityName.includes("HÍBRID") || modalityName.includes("HIBRID")) {
      newPrices = [createEmptyPrice("VIRTUAL"), createEmptyPrice("PRESENCIAL")];
    } else if (modalityName.includes("VIRTUAL")) {
      newPrices = [createEmptyPrice("VIRTUAL")];
    } else if (modalityName.includes("PRESENCIAL")) {
      newPrices = [createEmptyPrice("PRESENCIAL")];
    } else {
      newPrices = [createEmptyPrice("VIRTUAL")];
    }

    setForm(prev => ({
      ...prev,
      name: prev.name || generatedName,
      slug: prev.slug || generatedSlug,
      prices: newPrices,
    }));
  }, [selectedEdition, isEdit]);

  const mutation = useMutation({
    mutationFn: async (payload: ProductFormValues) => {
      // Clean JSON for Backend (Keep prices as strings to prevent decimal precision loss, numbers for installments)
      const parsedPayload = {
        ...payload,
        installments_min_number: Number(payload.installments_min_number),
        installments_max_number: Number(payload.installments_max_number),
        discount_price: payload.discount_price ? String(payload.discount_price) : null,
        discount_expires_at: payload.discount_expires_at ? new Date(payload.discount_expires_at).toISOString() : null,
        prices: payload.prices.map(p => ({
          attendance_mode: p.attendance_mode,
          cash_price: String(p.cash_price),
          installment_price: String(p.installment_price),
          enrollment_fee: String(p.enrollment_fee),
        }))
      };

      if (isEdit && initialData?.id) {
        return await updateProduct(initialData.id, parsedPayload);
      } else {
        return await createProduct(parsedPayload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      if (isEdit && initialData?.id) {
        queryClient.invalidateQueries({ queryKey: ["product", initialData.id] });
      }
      toast.success(isEdit ? "Producto actualizado exitosamente" : "Producto creado exitosamente");
      onClose();
      if (!isEdit) setForm(emptyData);
    },
    onError: (error) => {
      console.error(error);
      toast.error(isEdit ? "Error al actualizar el producto." : "Error al crear el producto.");
    }
  });

  const setFieldValue = (field: keyof ProductFormValues, value: any) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      // Auto-update slug if name changes and we are creating
      if (field === "name" && !isEdit) {
        updated.slug = generateSlug(value);
      }
      return updated;
    });

    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const setPriceValue = (index: number, field: string, value: string) => {
    // Only allow valid decimal numbers being typed
    const cleanValue = value.replace(/[^0-9.]/g, '');
    
    setForm(prev => {
      const newPrices = [...prev.prices];
      newPrices[index] = { ...newPrices[index], [field]: cleanValue };
      return { ...prev, prices: newPrices };
    });
    
    const errorKey = `prices.${index}.${field}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const onSubmit = () => {
    try {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!form.category_id || !uuidRegex.test(form.category_id)) {
        setErrors(prev => ({ ...prev, category_id: "Debes seleccionar una categoría válida." }));
        toast.error("Por favor selecciona una categoría válida.");
        return;
      }

      productFormSchema.parse(form);
      setErrors({});
      mutation.mutate(form);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path.length > 0) {
            newErrors[err.path.join('.')] = err.message;
          }
        });
        setErrors(newErrors);
        toast.error("Por favor corrige los errores del formulario");
      }
    }
  };

  return {
    form,
    errors,
    setFieldValue,
    setPriceValue,
    onSubmit,
    isLoadingEditions,
    editions,
    categories,
    isLoadingCategories,
    selectedEdition,
    isPending: mutation.isPending,
    isEdit
  };
};
