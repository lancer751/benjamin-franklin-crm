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
      const benefit_ids = initialData.benefit_ids || 
        initialData.relatedBenefits?.map((rb: any) => rb.benefit_id || rb.id) || 
        initialData.benefits?.map((b: any) => typeof b === 'object' ? b.id : b) || [];

      const faqs = initialData.faqs || 
        initialData.frequentQuestions?.map((fq: any) => ({
          id: fq.faq?.id || fq.faq_id || fq.id,
          question: fq.faq?.question || fq.question || "",
          answer: fq.faq?.answer || fq.answer || "",
        })) || [];

      const certRelation = initialData.relatedCertifications?.[0];
      const cert = certRelation?.certification;

      const certification_id = certRelation?.certification_id || cert?.id || "";
      const certification_title = cert?.title || "";
      const certification_description = cert?.description || "";
      const certification_issuing_authority = cert?.issuing_authority || "Corporación Educativa Benjamin Franklin";
      const certification_registry_validity = cert?.registry_validity || "";

      const category_id = initialData.category_id || 
        (typeof initialData.category === 'object' ? initialData.category?.id : initialData.category) || 
        "";

      const nextForm = {
        ...emptyData,
        ...initialData,
        slug: initialData.slug || generateSlug(initialData.name || ""),
        presale_price: initialData.presale_price != null ? String(initialData.presale_price) : "",
        discount_price: initialData.discount_price != null ? String(initialData.discount_price) : "",
        discount_expires_at: initialData.discount_expires_at ? new Date(initialData.discount_expires_at).toISOString().split('T')[0] : "",
        image_url: initialData.image_url || "",
        prices: initialData.prices?.length ? initialData.prices.map((p: any) => ({
          ...p,
          cash_price: String(p.cash_price || "0.00"),
          installment_price: String(p.installment_price || "0.00"),
          enrollment_fee: String(p.enrollment_fee || "0.00")
        })) : [],
        category_id,
        benefit_ids,
        faqs,
        certifications: initialData.certifications || initialData.relatedCertifications?.map((rc: any) => rc.certification_id || rc.id) || [],
        certification_id,
        certification_title,
        certification_description,
        certification_issuing_authority,
        certification_registry_validity,
      };

      setForm(nextForm);
      console.log("Formulario inicializado con estado:", nextForm);
      setHasCustomImage(!!initialData.image_url);
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

    // 1. Auto-generate Name & Slug (Solo si el nombre está vacío y no estamos en edición)
    if (!isEdit) {
      const courseName = selectedEdition.course?.name || "";
      const cohort = selectedEdition.edition_code || "";
      const generatedName = `${courseName} - ${cohort}`.trim();
      const generatedSlug = generateSlug(generatedName);
      const courseImage = selectedEdition.course?.image_url || "";

      setForm(prev => ({
        ...prev,
        name: prev.name || generatedName,
        slug: prev.slug || generatedSlug,
        image_url: hasCustomImage ? prev.image_url : (courseImage || prev.image_url),
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

        if (isEmptyOrAutogen) {
          return {
            ...prev,
            certification_description: defaultDesc,
            certification_title: prev.certification_title || `Certificación en ${form.name}`,
          };
        }
        return prev;
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
      const hasCertData = payload.certification_title || payload.certification_description;
      if (hasCertData) {
        const certData = {
          title: payload.certification_title || `Certificado de ${payload.name}`,
          description: payload.certification_description || "",
          image_url: payload.image_url || "",
          issuing_authority: payload.certification_issuing_authority || "Corporación Educativa Benjamin Franklin",
          registry_validity: payload.certification_registry_validity || "",
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

  const setFieldValue = (field: keyof ProductFormValues, value: any) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
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
