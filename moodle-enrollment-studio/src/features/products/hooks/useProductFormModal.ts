import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCourseEditions } from "@/features/academic/services/courseService";
import { getCategories } from "../services/categoryService";
import { createProduct, updateProduct } from "../services/productService";
import { getBenefits } from "../services/benefitService";
import { createFAQ, updateFAQ } from "../services/faqService";
import { createCertification, updateCertification } from "../services/certificationService";
import { uploadImageToCloudinary } from "@/core/lib/uploadService";
import { toast } from "sonner";
import { ProductFormValues, productFormSchema, baseProductFormSchema, UpdateProductSalesContentSchema } from "../schemas/productFormSchema";
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
        edition_id: initialData.edition_id || product.edition?.id || "", // 🌟 Forzamos el UUID real del backend
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
        certifications: cert?.id ? [cert.id] : [],
        certification_id: cert?.id || "",
        certification_title: cert?.title || "",
        certification_description: cert?.description || "",
        certification_issuing_authority: cert?.issuingAuthority || "Corporación Educativa Benjamin Franklin",
        certification_registry_validity: cert?.registryValidity || "",
        certification,
      };

      setForm(nextForm);
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

  const { data: benefitsRes } = useQuery({
    queryKey: ["benefits"],
    queryFn: getBenefits,
    enabled: open,
  });
  const availableBenefits = benefitsRes?.data || [];

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
  // Dynamic Modality, Name, Image, Certification and FAQs Auto-fill logic
  useEffect(() => {
    if (!selectedEdition) return;

    const courseName = selectedEdition.course?.name || "";
    const generatedName = courseName.trim();
    const generatedSlug = generateSlug(generatedName);
    const courseImage = selectedEdition.course?.image_url || "";
    const defaultDesc = getCertificationDefaultText(generatedName);

    const modalityRaw = (selectedEdition as any).modality;
    const editionModality = typeof modalityRaw === 'object' ? modalityRaw.name : modalityRaw;

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
        nextForm.certification_title = `Certificado de Especialización en ${generatedName}`;
        nextForm.certification = {
          ...nextForm.certification,
          title: `Certificado de Especialización en ${generatedName}`,
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

      // 1. Guardar/Actualizar FAQs individuales en la base de datos
      const faq_ids: string[] = [];
      const safeFaqs = payload?.faqs || [];
      if (Array.isArray(safeFaqs)) {
        for (let i = 0; i < safeFaqs.length; i++) {
          const faq = safeFaqs[i];
          if (!faq) continue;
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
      const hasCertData = payload?.certification?.title || payload?.certification?.description;
      if (hasCertData) {
        const certData = {
          title: payload.certification?.title || `Certificado de ${payload?.name || ""}`,
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
        name: payload?.name || "",
        edition_id: payload?.edition_id || "",
        category_id: payload?.category_id || "",
        sales_status: payload?.sales_status,
        installments_max_number: Number(payload?.installments_max_number || 1),
        installments_min_number: Number(payload?.installments_min_number || 1),
        slug: payload?.slug || "",
        description: payload?.description || "",
        short_description: payload?.short_description || "",
        image_url: payload?.image_url && payload.image_url.trim() !== "" ? payload.image_url : null,
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
        benefit_ids: payload?.benefit_ids || [],
        faq_ids,
        certification_ids,
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

  const onSubmit = (activeTab: string = "general") => {
    // Si estamos en la pestaña 1 ('general') o estamos creando el producto por primera vez (no tiene ID aún)
    let schemaToValidate;
    if (activeTab === "general") {
      schemaToValidate = UpdateProductSalesContentSchema;
    } else {
      schemaToValidate = productFormSchema;
    }

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
      return;
    }

    setErrors({});
    mutation.mutate(form);
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
