import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCourseEditions } from "@/features/academic/services/courseService";
import { getCategories } from "../services/categoryService";
import { createProduct, updateProduct } from "../services/productService";
import { getBenefits } from "../services/benefitService";
import { toast } from "sonner";
import { ProductFormValues, productCommercialFormSchema, productFormSchema, productMarketingFormSchema, productWebContentFormSchema } from "../schemas";
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
  pricing_status: "VALID",
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
  brochure_url: "",
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

export const useProductFormModal = (open: boolean, onClose: (data?: any) => void, initialData?: any) => {
  const isEdit = !!initialData;
  const [form, setForm] = useState<ProductFormValues>(emptyData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  useEffect(() => {
    if (initialData && open) {
      // Adapt raw initialData to UIProduct using our adapter!
      const product = adaptProductToUI(initialData as BackendProductResponse);

      const benefit_ids = product.benefits?.map((b: any) => b.id) || [];
      const faqs = product.faqs || [];

      const category_id = product.category?.id || "";

      const cert = product.certification;
      const certificationIds = (product.relatedCertifications || [])
        .map((item: any) => item.certification?.id || item.certification_id || item.id)
        .filter(Boolean);
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
        edition_id: initialData.edition_id || product.edition?.id || "", // UUID real del backend
        pricing_status: product.pricing_status || "VALID",
        slug: product.slug || generateSlug(product.name || ""),
        presale_price: product.presale_price || "",
        discount_price: product.discount_price || "",
        discount_expires_at: product.discount_expires_at || "",
        image_url: product.image_url || "",
        brochure_url: product.brochure_url || "",
        prices: product.prices || [],
        category_id,
        benefit_ids,
        faqs,
        certifications: certificationIds.length ? certificationIds : cert?.id ? [cert.id] : [],
        certification_id: cert?.id || "",
        certification_title: cert?.title || "",
        certification_description: cert?.description || "",
        certification_issuing_authority: cert?.issuingAuthority || "Corporación Educativa Benjamin Franklin",
        certification_registry_validity: cert?.registryValidity || "",
        certification,
      };

      setForm(nextForm);
      setErrors({});
    } else if (open) {
      setForm(emptyData);
      setErrors({});
    }
  }, [initialData, open]);

  const { data: editionsRes, isLoading: isLoadingEditions, isError: isEditionsError } = useQuery({
    queryKey: ["editions"],
    queryFn: getCourseEditions,
    enabled: open,
  });

  const { data: categoriesRes, isLoading: isLoadingCategories, isError: isCategoriesError } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    enabled: open,
  });

  const { data: benefitsRes, isLoading: isLoadingBenefits, isError: isBenefitsError } = useQuery({
    queryKey: ["benefits"],
    queryFn: getBenefits,
    enabled: open,
  });
  const availableBenefits = (benefitsRes as any)?.data || [];

  // Pre-poblar los 4 beneficios institucionales en modo creación una vez cargados de la BD
  useEffect(() => {
    if (open && !isEdit && availableBenefits.length > 0 && form.benefit_ids.length === 0) {
      const institutionalDescriptions = [
        "CERTIFICACIÓN DE PRESTIGIO: Al completar con éxito nuestro programa, recibirás un certificado oficial de la UNI. ¡Acredita tu experiencia con nosotros!",
        "ENFOQUE PRÁCTICO: Obtén habilidades aplicables directamente en el campo laboral, con prácticas en laboratorios y visitas técnicas.",
        "EXCELENCIA ACADÉMICA: Nuestro programa ofrece una educación de calidad respaldada por una facultad experta y reconocida internacionalmente.",
        "PREPARACIÓN INTEGRAL: Domina desde los fundamentos técnicos hasta la gestión estratégica, preparándote para destacar en un sector competitivo."
      ];
      const defaultIds = availableBenefits
        .filter((b: any) => institutionalDescriptions.some(desc => b.description?.trim() === desc.trim()))
        .map((b: any) => b.id);

      if (defaultIds.length > 0) {
        setForm(prev => ({
          ...prev,
          benefit_ids: defaultIds,
        }));
      }
    }
  }, [availableBenefits, open, isEdit]);

  const editions = (editionsRes as any)?.success ? (editionsRes as any).data : [];
  const selectedEdition = editions.find((e: any) => e.id === form.edition_id);

  const categories = useMemo(() => {
    const res = categoriesRes as any;
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (res && typeof res === "object" && "data" in res && Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  }, [categoriesRes]);
  // Dynamic Modality, Name, Image, Certification and FAQs Auto-fill logic
  useEffect(() => {
    if (!selectedEdition) return;

    const courseName = selectedEdition.course?.name || "";
    const cleanCourseName = courseName.trim();
    const modalityRaw = (selectedEdition as any).modality;
    const editionModality = typeof modalityRaw === 'object' ? modalityRaw.name : modalityRaw;

    const generatedName = `Curso de ${cleanCourseName} — Edición ${selectedEdition.edition_number}`;
    const generatedSlug = generateSlug(generatedName);
    const courseImage = selectedEdition.course?.image_url || "";
    const defaultDesc = getCertificationDefaultText(cleanCourseName);

    setForm(prev => {
      let nextForm = { ...prev };

      // 1. Pestaña 1 & 3: Nombre Comercial y Slug (Auto-fill)
      if (!isEdit || !prev.name) {
        nextForm.name = generatedName;
      }
      if (!isEdit || !prev.slug) {
        nextForm.slug = generatedSlug;
      }

      // 2. Pestaña 2: Portada del producto y Certificación
      if (!isEdit || !prev.image_url) {
        nextForm.image_url = courseImage;
      }

      // EXCEPCIÓN ESTRICTA: El campo "IMAGEN DE LA CERTIFICACIÓN" debe permanecer vacío (Sin archivo / No se auto-rellena)
      const hasNoCertTitle = !prev.certification?.title || prev.certification.title === "";
      const hasNoCertDesc = !prev.certification?.description || prev.certification.description === "";

      if (!isEdit || hasNoCertTitle) {
        nextForm.certification_title = `Certificado de Especialización en ${cleanCourseName}`;
        nextForm.certification = {
          ...nextForm.certification,
          title: `Certificado de Especialización en ${cleanCourseName}`,
          issuing_authority: prev.certification?.issuing_authority || "Corporación Educativa Benjamin Franklin",
        } as any;
      }

      if (!isEdit || hasNoCertDesc) {
        nextForm.certification_description = defaultDesc;
        nextForm.certification = {
          ...nextForm.certification,
          description: defaultDesc,
          issuing_authority: prev.certification?.issuing_authority || "Corporación Educativa Benjamin Franklin",
        } as any;
      }

      if (!isEdit) {
        nextForm.certification = {
          ...nextForm.certification,
          image_url: "", // EXCEPCIÓN ESTRICTA
          has_digital: true,
          has_physical: true,
          issuing_authority: "Corporación Educativa Benjamin Franklin",
        } as any;
      }

      // 3. Pestaña 3: FAQs precargadas por defecto de forma masiva
      const hasNoFAQs = !prev.faqs || prev.faqs.length === 0;
      if (!isEdit || hasNoFAQs) {
        nextForm.faqs = INSTITUTIONAL_FAQS.map(faq => ({
          question: faq.question,
          answer: faq.answer,
        }));
      }

      // EXCEPCIÓN ESTRICTA: El brochure_url debe permanecer vacío
      if (!isEdit) {
        nextForm.brochure_url = "";
      }

      // 4. Manejo de modalidad y precios (Incluso en edición si cambiamos la edición vinculada)
      if (!(isEdit && prev.prices && prev.prices.length > 0)) {
        let newPrices = [...prev.prices];

        if (editionModality === "HIBRIDO") {
          const presencial = newPrices.find(p => p.attendance_mode === "PRESENCIAL") || createEmptyPrice("PRESENCIAL");
          const virtual = newPrices.find(p => p.attendance_mode === "VIRTUAL") || createEmptyPrice("VIRTUAL");
          newPrices = [presencial, virtual];
        } else if (editionModality === "VIRTUAL" || editionModality === "PRESENCIAL") {
          const existing = newPrices.find(p => p.attendance_mode === editionModality) || createEmptyPrice(editionModality);
          newPrices = [existing];
        } else {
          if (newPrices.length === 0) newPrices = [createEmptyPrice("HEREDADO")];
        }
        nextForm.prices = newPrices;
      }

      return nextForm;
    });
  }, [selectedEdition, isEdit]);

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
      const targetEdition = editions.find((e: any) => e.id === payload?.edition_id);
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

      // Payload exclusivo del contrato de información comercial.
      const parsedPayload = {
        name: payload?.name || "",
        edition_id: payload?.edition_id || "",
        category_id: payload?.category_id || "",
        installments_max_number: Number(payload?.installments_max_number || 1),
        installments_min_number: Number(payload?.installments_min_number || 1),
        presale_price: parseOptionalPrice(payload?.presale_price),
        discount_price: parseOptionalPrice(payload?.discount_price),
        discount_expires_at: payload?.discount_expires_at ? new Date(payload.discount_expires_at).toISOString() : null,
        prices: (payload?.prices || []).map((p: any) => {
          const attendance_mode = modality === "HIBRIDO" ? p.attendance_mode : "HEREDADO";
          return {
            attendance_mode,
            cash_price: Number(p.cash_price || 0),
            installment_price: Number(p.installment_price || 0),
            enrollment_fee: Number(p.enrollment_fee || 0),
          };
        }),
      };


      try {
        let res;
        if (isEdit && initialData?.id) {
          res = await updateProduct(initialData.id, parsedPayload as any);
        } else {
          res = await createProduct(parsedPayload as any);
        }
        console.log("RESPUESTA COMPLETA DEL BACKEND:", res);
        return res;
      } catch (err) {
        console.error("ERROR DE PETICIÓN EN EL BACKEND:", err);
        throw err;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      if (isEdit && initialData?.id) {
        queryClient.invalidateQueries({ queryKey: ["product", initialData.id] });
      }
      toast.success(isEdit ? "Producto actualizado exitosamente" : "Producto creado exitosamente");
      onClose(data);
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

  const validateForm = (section: "commercial" | "marketing" | "web" | "complete" = "complete") => {
    const schemaToValidate = section === "commercial"
      ? productCommercialFormSchema
      : section === "marketing"
        ? productMarketingFormSchema
      : section === "web"
        ? productWebContentFormSchema
        : productFormSchema;

    const result = schemaToValidate.safeParse(form);
    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        const path = issue.path.join(".");
        formattedErrors[path] = issue.message;
      });
      setErrors(formattedErrors);
      
      const firstError = result.error.issues[0];
      toast.error(`Error de validación: ${firstError.message}`);
      return false;
    }

    setErrors({});
    return true;
  };

  const onSubmit = (section: "commercial" | "general" = "commercial") => {
    if (!validateForm("commercial")) return false;
    mutation.mutate(form);
    return true;
  };

  return {
    form,
    errors,
    setFieldValue,
    setPriceValue,
    onSubmit,
    validateForm,
    isLoadingEditions,
    isEditionsError,
    editions,
    categories,
    isLoadingCategories,
    isCategoriesError,
    selectedEdition,
    isPending: mutation.isPending,
    isEdit,
    handleLoadDefaultFAQs,
    availableBenefits,
    isLoadingBenefits,
    isBenefitsError,
  };
};
