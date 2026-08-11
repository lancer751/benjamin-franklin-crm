import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCourseEditions } from "@/features/academic/services/courseService";
import { createProduct, updateProduct } from "../services/productService";
import { getBenefits } from "../services/benefitService";
import { toast } from "sonner";
import { ProductFormValues, productCommercialFormSchema, productFormSchema, productMarketingFormSchema, productWebContentFormSchema } from "../schemas";
import { getCertificationDefaultText, INSTITUTIONAL_FAQS } from "../utils/productTemplates";
import { adaptProductToUI, mapProductFormToPayload, normalizeAsynchronousPrice } from "../adapters/product.adapter";
import type { BackendProductResponse, EditionModality, ProductEditionOption } from "../types/product.types";
import { editionKeys } from "@/features/academic/queryKeys";
import { benefitKeys, productKeys } from "../queryKeys";

const createEmptyPrice = (mode: "VIRTUAL" | "PRESENCIAL" | "HEREDADO" = "HEREDADO") => ({
  attendance_mode: mode,
  cash_price: "0.00",
  installment_price: "0.00",
});

const getPricesForModality = (
  prices: ProductFormValues["prices"],
  modality?: EditionModality,
  isAsynchronous = false,
): ProductFormValues["prices"] => {
  if (isAsynchronous) {
    const inheritedPrice = prices.find((price) => price.attendance_mode === "HEREDADO") || prices[0];
    return [normalizeAsynchronousPrice(inheritedPrice)];
  }

  if (modality === "HIBRIDO") {
    return [
      prices.find((price) => price.attendance_mode === "PRESENCIAL") || createEmptyPrice("PRESENCIAL"),
      prices.find((price) => price.attendance_mode === "VIRTUAL") || createEmptyPrice("VIRTUAL"),
    ];
  }

  const inheritedPrice =
    prices.find((price) => price.attendance_mode === "HEREDADO") ||
    prices[0] ||
    createEmptyPrice();

  return [{ ...inheritedPrice, attendance_mode: "HEREDADO" }];
};

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
  enrollment_fee: "0.00",
  installments_min_number: 1,
  installments_max_number: 1,
  discount_price: null,
  discount_expires_at: null,
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

export const useProductFormModal = (
  open: boolean,
  onClose: (data?: any) => void,
  initialData?: any,
  persistedProductId?: string,
) => {
  const isEdit = !!initialData;
  const [form, setForm] = useState<ProductFormValues>(emptyData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();
  const submittingRef = useRef(false);
  const previousIsAsynchronousRef = useRef<boolean>();
  const nonAsynchronousFinancingRef = useRef<Pick<
    ProductFormValues,
    "prices" | "enrollment_fee" | "installments_min_number" | "installments_max_number"
  >>();
  const targetProductId = initialData?.id || persistedProductId;

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
        sales_status: product.sales_status ?? "DRAFT",
        edition_id: initialData.edition_id || product.edition?.id || "", // UUID real del backend
        pricing_status: product.pricing_status || "VALID",
        slug: product.slug || generateSlug(product.name || ""),
        discount_price: product.discount_price === "" ? null : Number(product.discount_price),
        discount_expires_at: product.discount_expires_at || null,
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
    queryKey: editionKeys.list(),
    queryFn: getCourseEditions,
    enabled: open,
  });

  const { data: benefitsRes, isLoading: isLoadingBenefits, isError: isBenefitsError } = useQuery({
    queryKey: benefitKeys.list(),
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

  const editions: ProductEditionOption[] = editionsRes?.success ? editionsRes.data : [];
  const selectedEdition = editions.find((edition) => edition.id === form.edition_id);
  const isAsynchronous = selectedEdition?.modality === "ASINCRONICO";

  // Dynamic Modality, Name, Image, Certification and FAQs Auto-fill logic
  useEffect(() => {
    if (!selectedEdition) return;

    const courseName = selectedEdition.course?.name || "";
    const cleanCourseName = courseName.trim();
    const editionModality = selectedEdition.modality;
    const previousIsAsynchronous = previousIsAsynchronousRef.current;
    previousIsAsynchronousRef.current = isAsynchronous;

    const generatedName = `Curso de ${cleanCourseName} — Edición ${selectedEdition.edition_number}`;
    const generatedSlug = generateSlug(generatedName);
    const courseImage = selectedEdition.course?.image_url || "";
    const defaultDesc = getCertificationDefaultText(cleanCourseName);

    setForm(prev => {
      let nextForm = { ...prev };
      let prices = prev.prices;

      if (isAsynchronous && previousIsAsynchronous === false) {
        nonAsynchronousFinancingRef.current = {
          prices: prev.prices,
          enrollment_fee: prev.enrollment_fee,
          installments_min_number: prev.installments_min_number,
          installments_max_number: prev.installments_max_number,
        };
      } else if (!isAsynchronous && previousIsAsynchronous === true && nonAsynchronousFinancingRef.current) {
        prices = nonAsynchronousFinancingRef.current.prices;
        nextForm.enrollment_fee = nonAsynchronousFinancingRef.current.enrollment_fee;
        nextForm.installments_min_number = nonAsynchronousFinancingRef.current.installments_min_number;
        nextForm.installments_max_number = nonAsynchronousFinancingRef.current.installments_max_number;
      }

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

      // 4. La modalidad define una sola estructura de precios para creación y edición.
      nextForm.prices = getPricesForModality(prices, editionModality, isAsynchronous);
      if (isAsynchronous) {
        nextForm.enrollment_fee = "0.00";
        nextForm.installments_min_number = 1;
        nextForm.installments_max_number = 1;
      }

      return nextForm;
    });
    if (isAsynchronous) {
      setErrors((current) => Object.fromEntries(
        Object.entries(current).filter(([field]) => (
          field !== "prices" &&
          !field.includes("installment_price") &&
          !field.startsWith("installments_") &&
          field !== "enrollment_fee"
        )),
      ));
    }
  }, [selectedEdition, isAsynchronous, isEdit]);

  const handleLoadDefaultFAQs = useCallback(() => {
    setFieldValue("faqs", INSTITUTIONAL_FAQS.map(faq => ({
      question: faq.question,
      answer: faq.answer,
    })));
    toast.success("FAQs Institucionales cargadas con éxito");
  }, []);

  const mutation = useMutation({
    mutationFn: async (payload: ProductFormValues) => {
      // Obtener la modalidad de la edición seleccionada
      const targetEdition = editions.find((edition) => edition.id === payload?.edition_id);
      const modality = targetEdition?.modality;

      const parsedPayload = mapProductFormToPayload(payload, modality, isAsynchronous);

      try {
        let res;
        if (targetProductId) {
          res = await updateProduct(targetProductId, parsedPayload);
        } else {
          res = await createProduct(parsedPayload);
        }
        if (!res?.success) throw new Error(res?.message || "No se pudo guardar el producto");
        return res;
      } catch (err) {
        throw err;
      }
    },
    onSuccess: (data) => {
      const savedProductId = data?.success ? data.data?.id : targetProductId;
      if (savedProductId) {
        queryClient.setQueryData(productKeys.detail(savedProductId), data);
      }
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success(targetProductId ? "Cambios guardados" : "Producto creado");
      onClose(data);
    },
    onError: (error) => {
      console.error(error);
      toast.error(targetProductId ? "Error al guardar los cambios." : "Error al crear el producto.");
    },
    onSettled: () => {
      submittingRef.current = false;
    },
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

  const setPriceValue = (
    index: number,
    field: "cash_price" | "installment_price",
    value: string,
  ) => {
    const cleanValue = value.replace(/[^0-9.]/g, '');

    setForm(prev => {
      const newPrices = [...prev.prices];
      const updatedPrice = { ...newPrices[index], [field]: cleanValue };
      newPrices[index] = isAsynchronous && field === "cash_price"
        ? normalizeAsynchronousPrice(updatedPrice)
        : updatedPrice;
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

    const validationForm = isAsynchronous
      ? {
          ...form,
          enrollment_fee: "0.00",
          installments_min_number: 1,
          installments_max_number: 1,
          prices: [normalizeAsynchronousPrice(form.prices[0])],
        }
      : form;
    const result = schemaToValidate.safeParse(validationForm);
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

  const onSubmit = async () => {
    if (submittingRef.current || mutation.isPending) return null;
    if (!validateForm("commercial")) return null;
    submittingRef.current = true;
    try {
      return await mutation.mutateAsync(form);
    } catch {
      return null;
    }
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
    selectedEdition,
    isAsynchronous,
    isPending: mutation.isPending,
    isEdit,
    handleLoadDefaultFAQs,
    availableBenefits,
    isLoadingBenefits,
    isBenefitsError,
  };
};
