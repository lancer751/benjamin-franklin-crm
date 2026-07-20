import { useState } from "react";
import type { ChangeEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { uploadPdfToCloudinary } from "@/core/lib/uploadService";
import type { ProductFormValues } from "../schemas";
import { createCertification, updateCertification } from "../services/certificationService";
import { createFAQ, updateFAQ } from "../services/faqService";
import { updateProductCommercialContent } from "../services/productService";

interface UseProductContentActionsProps {
  productId?: string;
  form: ProductFormValues;
  setFieldValue: (key: string, value: any) => void;
}

export const useProductContentActions = ({ productId, form, setFieldValue }: UseProductContentActionsProps) => {
  const queryClient = useQueryClient();
  const [isSavingMarketing, setIsSavingMarketing] = useState(false);
  const [isSavingWeb, setIsSavingWeb] = useState(false);
  const [isUploadingBrochure, setIsUploadingBrochure] = useState(false);

  const syncCertification = async () => {
    const preservedIds = (form.certifications || []).filter((id) => id && !id.startsWith("temp-"));
    const existingId = form.certification_id && !form.certification_id.startsWith("temp-") ? form.certification_id : "";
    const hasData = Boolean(form.certification?.title?.trim() || form.certification?.description?.trim());
    if (!hasData) return Array.from(new Set([...preservedIds, ...(existingId ? [existingId] : [])]));

    const data = {
      title: form.certification?.title || `Certificado de ${form.name}`,
      description: form.certification?.description || "",
      image_url: form.certification?.image_url || "",
      issuing_authority: form.certification?.issuing_authority || "Corporación Educativa Benjamin Franklin",
      registry_validity: form.certification?.registry_validity || "",
      has_digital: form.certification?.has_digital !== false,
      has_physical: form.certification?.has_physical !== false,
    };

    const response = existingId ? await updateCertification(existingId, data) : await createCertification(data);
    const savedId = response?.success && response.data?.id ? response.data.id : existingId;
    if (!savedId) throw new Error("No se pudo guardar la certificación");
    if (!existingId) setFieldValue("certification_id", savedId);
    return Array.from(new Set([...preservedIds, savedId]));
  };

  const syncFAQs = async () => {
    const ids: string[] = [];
    for (let index = 0; index < (form.faqs || []).length; index += 1) {
      const faq = form.faqs[index];
      if (!faq.question?.trim() && !faq.answer?.trim()) continue;
      const data = { question: faq.question || "", answer: faq.answer || "", order: index };
      const existingId = faq.id && !faq.id.startsWith("temp-") ? faq.id : "";
      const response = existingId ? await updateFAQ(existingId, data) : await createFAQ(data);
      const savedId = response?.success && response.data?.id ? response.data.id : existingId;
      if (!savedId) throw new Error(`No se pudo guardar la pregunta ${index + 1}`);
      ids.push(savedId);
    }
    return ids;
  };

  const ensureProduct = () => {
    if (!productId) {
      toast.info("Primero guarda la información comercial para crear el producto base");
      return false;
    }
    return true;
  };

  const saveMarketing = async () => {
    if (!ensureProduct()) return false;
    setIsSavingMarketing(true);
    try {
      const [certificationIds, faqIds] = await Promise.all([syncCertification(), syncFAQs()]);
      const response = await updateProductCommercialContent(productId as string, {
        image_url: form.image_url?.trim() ? form.image_url : null,
        brochure_url: form.brochure_url?.trim() ? form.brochure_url : null,
        benefit_ids: form.benefit_ids.length ? form.benefit_ids : undefined,
        faq_ids: faqIds,
        certification_ids: certificationIds,
      });
      if (!response.success) throw new Error(response.message || "No se pudo guardar el material comercial");
      await queryClient.invalidateQueries({ queryKey: ["product", productId] });
      toast.success("Material comercial guardado");
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar el material comercial");
      return false;
    } finally {
      setIsSavingMarketing(false);
    }
  };

  const saveWebContent = async (salesStatusOverride?: ProductFormValues["sales_status"]) => {
    if (!ensureProduct()) return false;
    setIsSavingWeb(true);
    try {
      const [certificationIds, faqIds] = await Promise.all([syncCertification(), syncFAQs()]);
      const response = await updateProductCommercialContent(productId as string, {
        slug: form.slug?.trim() ? form.slug : undefined,
        description: form.description || null,
        short_description: form.short_description || null,
        sales_status: salesStatusOverride || form.sales_status,
        benefit_ids: form.benefit_ids.length ? form.benefit_ids : undefined,
        faq_ids: faqIds,
        certification_ids: certificationIds,
      });
      if (!response.success) throw new Error(response.message || "No se pudo guardar la publicación web");
      await queryClient.invalidateQueries({ queryKey: ["product", productId] });
      toast.success("Publicación web guardada");
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar la publicación web");
      return false;
    } finally {
      setIsSavingWeb(false);
    }
  };

  const saveDraftContent = async () => {
    if (!ensureProduct()) return false;
    setIsSavingWeb(true);
    try {
      const response = await updateProductCommercialContent(productId as string, {
        slug: form.slug?.trim() ? form.slug : undefined,
        description: form.description || null,
        short_description: form.short_description || null,
        image_url: form.image_url?.trim() ? form.image_url : null,
        brochure_url: form.brochure_url?.trim() ? form.brochure_url : null,
        sales_status: "DRAFT",
      });
      if (!response.success) throw new Error(response.message || "No se pudo guardar el borrador");
      await queryClient.invalidateQueries({ queryKey: ["product", productId] });
      toast.success("Borrador guardado");
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar el borrador");
      return false;
    } finally {
      setIsSavingWeb(false);
    }
  };

  const handleBrochureFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploadingBrochure(true);
    try {
      const url = await uploadPdfToCloudinary(file);
      setFieldValue("brochure_url", url);
      toast.success("Brochure subido correctamente");
    } catch {
      toast.error("No se pudo subir el brochure PDF");
    } finally {
      setIsUploadingBrochure(false);
      event.target.value = "";
    }
  };

  return {
    saveMarketing,
    saveWebContent,
    saveDraftContent,
    handleBrochureFileChange,
    isSavingMarketing,
    isSavingWeb,
    isUploadingBrochure,
  };
};
