import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCourseEditions } from "@/features/academic/services/courseService";
import { getCategories } from "../services/categoryService";
import { createProduct, updateProduct } from "../services/productService";
import { createFAQ, updateFAQ } from "../services/faqService";
import { createCertification, updateCertification } from "../services/certificationService";
import { uploadImageToCloudinary } from "@/features/academic/services/uploadService";
import { toast } from "sonner";
import { ProductFormValues, productFormSchema } from "../schemas/productFormSchema";
import { z } from "zod";
import { getCertificationDefaultText, INSTITUTIONAL_FAQS } from "../utils/productTemplates";
import { adaptProductToUI } from "../adapters/product.adapter";
import { BackendProductResponse } from "../types/product.types";

const createEmptyPrice = (mode: "VIRTUAL" | "PRESENCIAL" | "HEREDADO" = "HEREDADO") => ({
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
  presale_price: "",
  installments_min_number: 1,
  installments_max_number: 1,
  discount_price: "",
  discount_expires_at: "",
  image_url: "",
  prices: [], // Will be filled dynamically
  benefit_ids: [],
  faqs: [],
  certifications: [],
  certification_id: "",
  certification_title: "",
  certification_description: "",
  certification_issuing_authority: "Corporación Educativa Benjamin Franklin",
  certification_registry_validity: "",
  certification: {
    image_url: "",
    title: "",
    description: "",
    issuing_authority: "Corporación Educativa Benjamin Franklin",
    registry_validity: "",
    has_digital: true,
    has_physical: true,
  },
};

export const useProductFormModal = (open: boolean, onClose: () => void, initialData?: any) => {
  const isEdit = !!initialData;
  const [form, setForm] = useState<ProductFormValues>(emptyData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [hasCustomImage, setHasCustomImage] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (initialData && open) {
      // Adapt raw initialData to UIProduct using our adapter!
      const product = adaptProductToUI(initialData as BackendProductResponse);

      const benefit_ids = product.benefits?.map((b: any) => b.id) || [];
      const faqs = product.faqs || [];

      const category_id = product.category?.id || "";

      const cert = product.certification;
      const certification = {
        title: cert?.title || "",
        description: cert?.description || "",
        image_url: cert?.imageUrl || "",
        issuing_authority: cert?.issuingAuthority || "Corporación Educativa Benjamin Franklin",
        registry_validity: cert?.registryValidity || "",
        has_digital: cert?.hasDigital !== false,
        has_physical: cert?.hasPhysical !== false,
      };

      const nextForm: ProductFormValues = {
        ...emptyData,
        ...product,
        slug: product.slug || generateSlug(product.name || ""),
        presale_price: product.presale_price || "",
        discount_price: product.discount_price || "",
        discount_expires_at: product.discount_expires_at || "",
        image_url: product.image_url || "",
        prices: product.prices || [],
        category_id,
        benefit_ids,
        faqs,
        certifications: cert?.id ? [cert.id] : [],
        certification_id: cert?.id || "",
        certification_title: cert?.title || "",
        certification_description: cert?.description || "",
        certification_issuing_authority: cert?.issuingAuthority || "Corporación Educativa Benjamin Franklin",
        certification_registry_validity: cert?.registryValidity || "",
        certification,
      };

      setForm(nextForm);
      console.log("Formulario inicializado con estado:", nextForm);
      setHasCustomImage(!!product.image_url);
      setErrors({});
    } else if (open) {
      setForm(emptyData);
      setHasCustomImage(false);
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
  
  const categories = useMemo(() => {
    if (!categoriesRes) return [];
    if (Array.isArray(categoriesRes)) return categoriesRes;
    if ("data" in categoriesRes && Array.isArray(categoriesRes.data)) {
      return categoriesRes.data;
    }
    return [];
  }, [categoriesRes]);

  // Dynamic Modality, Name & Image Auto-fill logic
  useEffect(() => {
    if (!selectedEdition) return;

    // 1. Auto-generate Name, Slug & Certification details (Solo si no estamos en edición)
    if (!isEdit) {
      const courseName = selectedEdition.course?.name || "";
      const generatedName = courseName.trim();
      const generatedSlug = generateSlug(generatedName);
      const courseImage = selectedEdition.course?.image_url || "";
      const defaultDesc = getCertificationDefaultText(generatedName);

      setForm(prev => ({
        ...prev,
        name: generatedName,
        slug: generatedSlug,
        image_url: hasCustomImage ? prev.image_url : (courseImage || prev.image_url),
        certification_description: defaultDesc,
        certification_title: `Certificado del Curso de ${generatedName}`,
      }));
    }

    // 2. Manejo de modalidad y precios (Incluso en edición si cambiamos la edición vinculada)
    const modalityRaw = (selectedEdition as any).modality;
    const editionModality = typeof modalityRaw === 'object' ? modalityRaw.name : modalityRaw;
    
    setForm(prev => {
      // Guarda crítica: si es edición y ya hay precios cargados, no los sobreescribimos destructivamente
      if (isEdit && prev.prices && prev.prices.length > 0) {
        return prev;
      }

      let newPrices = [...prev.prices];
      
      if (editionModality === "HIBRIDO") {
        // Necesitamos 2 objetos: PRESENCIAL y VIRTUAL
        const presencial = newPrices.find(p => p.attendance_mode === "PRESENCIAL") || createEmptyPrice("PRESENCIAL");
        const virtual = newPrices.find(p => p.attendance_mode === "VIRTUAL") || createEmptyPrice("VIRTUAL");
        
        newPrices = [presencial, virtual];
      } else if (editionModality === "VIRTUAL" || editionModality === "PRESENCIAL") {
        // Solo 1 objeto del tipo correspondiente
        const existing = newPrices.find(p => p.attendance_mode === editionModality) || createEmptyPrice(editionModality);
        newPrices = [existing];
      } else {
        // Default o HEREDADO
        if (newPrices.length === 0) newPrices = [createEmptyPrice("HEREDADO")];
      }

      return { ...prev, prices: newPrices };
    });
  }, [selectedEdition, isEdit, hasCustomImage]);

  // Dynamic Certification Autogeneration
  useEffect(() => {
    if (!isEdit && form.name) {
      const defaultDesc = getCertificationDefaultText(form.name);
      setForm(prev => {
        const isEmptyOrAutogen = !prev.certification_description ||
          prev.certification_description.startsWith("Al culminar satisfactoriamente y aprobar el programa, el alumno obtendrá: Certificado de ");

        const isEmptyOrAutogenTitle = !prev.certification_title ||
          prev.certification_title.startsWith("Certificación en ") ||
          prev.certification_title.startsWith("Certificado del Curso de ");

        return {
          ...prev,
          certification_description: isEmptyOrAutogen ? defaultDesc : prev.certification_description,
          certification_title: isEmptyOrAutogenTitle ? `Certificado del Curso de ${form.name}` : prev.certification_title,
        };
      });
    }
  }, [form.name, isEdit]);

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const url = await uploadImageToCloudinary(file);
      setFieldValue("image_url", url);
      setHasCustomImage(true); // Marcamos que el usuario subió una imagen propia
      toast.success("Imagen subida correctamente");
    } catch (error) {
      toast.error("Error al subir la imagen");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLoadDefaultFAQs = useCallback(() => {
    setFieldValue("faqs", INSTITUTIONAL_FAQS.map(faq => ({
      question: faq.question,
      answer: faq.answer,
    })));
    toast.success("FAQs Institucionales cargadas con éxito");
  }, []);

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      // Obtener la modalidad de la edición seleccionada
      const targetEdition = editions.find((e: any) => e.id === payload.edition_id);
      const modalityRaw = targetEdition?.modality;
      const modality = typeof modalityRaw === 'object' ? modalityRaw.name : modalityRaw;

      // Conversión y sanitización segura de precios opcionales
      const parseOptionalPrice = (val: any) => {
        if (val === undefined || val === null) return null;
        const strVal = String(val).trim();
        if (strVal === "") return null;
        const num = Number(strVal);
        return isNaN(num) ? null : num;
      };

      // 1. Guardar/Actualizar FAQs individuales en la base de datos
      const faq_ids: string[] = [];
      if (payload.faqs && Array.isArray(payload.faqs)) {
        for (let i = 0; i < payload.faqs.length; i++) {
          const faq = payload.faqs[i];
          const faqData = {
            question: faq.question || "",
            answer: faq.answer || "",
            order: i,
          };
          
          try {
            if (faq.id && faq.id.length > 10 && !faq.id.startsWith("temp-")) {
              const res = await updateFAQ(faq.id, faqData);
              if (res?.success && res.data?.id) {
                faq_ids.push(res.data.id);
              } else if (faq.id) {
                faq_ids.push(faq.id);
              }
            } else {
              const res = await createFAQ(faqData);
              if (res?.success && res.data?.id) {
                faq_ids.push(res.data.id);
              }
            }
          } catch (err) {
            console.error("Error al sincronizar FAQ:", err);
          }
        }
      }

      // 2. Guardar/Actualizar Certificación individual en la base de datos
      const certification_ids: string[] = [];
      const hasCertData = payload.certification?.title || payload.certification?.description;
      if (hasCertData) {
        const certData = {
          title: payload.certification?.title || `Certificado de ${payload.name}`,
          description: payload.certification?.description || "",
          image_url: payload.certification?.image_url || "",
          issuing_authority: payload.certification?.issuing_authority || "Corporación Educativa Benjamin Franklin",
          registry_validity: payload.certification?.registry_validity || "",
          has_digital: true,
          has_physical: true,
        };

        try {
          if (payload.certification_id && payload.certification_id.length > 10 && !payload.certification_id.startsWith("temp-")) {
            const res = await updateCertification(payload.certification_id, certData);
            if (res?.success && res.data?.id) {
              certification_ids.push(res.data.id);
            } else if (payload.certification_id) {
              certification_ids.push(payload.certification_id);
            }
          } else {
            const res = await createCertification(certData);
            if (res?.success && res.data?.id) {
              certification_ids.push(res.data.id);
            }
          }
        } catch (err) {
          console.error("Error al sincronizar Certificación:", err);
        }
      }

      // Clean JSON for Backend
      const parsedPayload = {
        name: payload.name || "",
        edition_id: payload.edition_id || "",
        category_id: payload.category_id || "",
        sales_status: payload.sales_status,
        installments_max_number: Number(payload.installments_max_number),
        installments_min_number: Number(payload.installments_min_number),
        slug: payload.slug || "",
        description: payload.description || "",
        short_description: payload.short_description || "",
        image_url: payload.image_url || "",
        presale_price: parseOptionalPrice(payload.presale_price),
        discount_price: parseOptionalPrice(payload.discount_price),
        discount_expires_at: payload.discount_expires_at ? new Date(payload.discount_expires_at).toISOString() : null,
        prices: payload.prices.map((p: any) => {
          const attendance_mode = modality === "HIBRIDO" ? p.attendance_mode : "HEREDADO";
          return {
            attendance_mode,
            cash_price: Number(p.cash_price),
            installment_price: Number(p.installment_price),
            enrollment_fee: Number(p.enrollment_fee),
          };
        }),
        benefit_ids: payload.benefit_ids || [],
        faq_ids,
        certification_ids,
      };

      console.log("PAYLOAD FINAL TRANSFORMADO:", JSON.stringify(parsedPayload, null, 2));

      if (isEdit && initialData?.id) {
        return await updateProduct(initialData.id, parsedPayload as any);
      } else {
        return await createProduct(parsedPayload as any);
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

  const setFieldValue = (field: string, value: any) => {
    setForm(prev => {
      let updated: ProductFormValues;
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        updated = {
          ...prev,
          [parent]: {
            ...((prev as any)[parent] || {}),
            [child]: value
          }
        };
      } else {
        updated = { ...prev, [field]: value } as ProductFormValues;
        if (field === "name" && !isEdit) {
          updated.slug = generateSlug(value);
        }
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

      const parsedValues = productFormSchema.parse(form);
      setErrors({});
      console.log("Estado seleccionado antes de enviar:", parsedValues.sales_status);
      mutation.mutate(parsedValues);
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
    isUploading,
    handleImageUpload,
    isPending: mutation.isPending,
    isEdit,
    handleLoadDefaultFAQs,
  };
};
