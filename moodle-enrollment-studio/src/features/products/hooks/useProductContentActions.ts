import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { uploadImageToCloudinary, uploadPdfToCloudinary } from "@/core/lib/uploadService";
import type { ProductFormValues } from "../schemas";
import type { PendingProductFilesController, PendingProductFileKey } from "./usePendingProductFiles";
import { createCertification, updateCertification } from "../services/certificationService";
import { createFAQ, updateFAQ } from "../services/faqService";
import { updateProductCommercialContent } from "../services/productService";

type ValidationSection = "commercial" | "marketing" | "web" | "complete";

interface UseProductContentActionsProps {
  productId?: string;
  form: ProductFormValues;
  setFieldValue: (key: string, value: any) => void;
  validateForm: (section: ValidationSection) => boolean;
  pendingFiles: PendingProductFilesController;
}

interface ResolvedAssetUrls {
  coverImage: string | null;
  brochure: string | null;
  certificationImages: Record<string, string | null>;
}

export const useProductContentActions = ({ productId, form, setFieldValue, validateForm, pendingFiles }: UseProductContentActionsProps) => {
  const queryClient = useQueryClient();
  const savingRef = useRef(false);
  const [isSavingMarketing, setIsSavingMarketing] = useState(false);
  const [isSavingWeb, setIsSavingWeb] = useState(false);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  const validateBeforeUpload = (section: "marketing" | "web" | "complete") => {
    if (!validateForm("commercial")) return false;
    if (!validateForm("marketing")) return false;
    if (section === "web" && !validateForm("web")) return false;
    if (section === "complete" && !validateForm("complete")) return false;
    if (pendingFiles.files.coverImage && !pendingFiles.files.coverImage.type.startsWith("image/")) {
      toast.error("La portada pendiente debe ser una imagen válida");
      return false;
    }
    if (pendingFiles.files.brochure && pendingFiles.files.brochure.type !== "application/pdf" && !pendingFiles.files.brochure.name.toLowerCase().endsWith(".pdf")) {
      toast.error("El brochure pendiente debe ser un archivo PDF");
      return false;
    }
    if (pendingFiles.files.brochure && pendingFiles.files.brochure.size > 10 * 1024 * 1024) {
      toast.error("El brochure pendiente no puede superar 10 MB");
      return false;
    }
    if (Object.values(pendingFiles.files.certificationImages).some((file) => !file.type.startsWith("image/"))) {
      toast.error("Las imágenes de certificación pendientes deben ser archivos de imagen válidos");
      return false;
    }
    return true;
  };

  const validateDraftWebFields = () => {
    if (form.slug?.trim() && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) {
      toast.error("El slug del borrador solo puede contener minúsculas, números y guiones");
      return false;
    }
    if ((form.short_description || "").length > 160 || (form.description || "").length > 2000) {
      toast.error("Las descripciones superan el máximo permitido");
      return false;
    }
    return true;
  };

  const resolveAssetUrl = async (
    key: PendingProductFileKey,
    existingUrl: string | null | undefined,
    uploader: (file: File) => Promise<string>,
  ) => {
    if (pendingFiles.markedForRemoval[key]) return null;
    const file = pendingFiles.files[key];
    if (!file) return existingUrl?.trim() ? existingUrl : null;
    const cachedUrl = pendingFiles.uploadedUrls[key];
    if (cachedUrl) return cachedUrl;
    const url = await uploader(file);
    pendingFiles.markUploaded(key, url);
    return url;
  };

  const uploadPendingFiles = async (): Promise<ResolvedAssetUrls> => {
    setIsUploadingFiles(true);
    try {
      const certificationKeys = Array.from(new Set([
        ...Object.keys(pendingFiles.files.certificationImages),
        ...Object.keys(pendingFiles.markedForRemoval.certificationImages).filter((key) => pendingFiles.markedForRemoval.certificationImages[key]),
      ]));
      const [coverImage, brochure, certificationEntries] = await Promise.all([
        resolveAssetUrl("coverImage", form.image_url, uploadImageToCloudinary),
        resolveAssetUrl("brochure", form.brochure_url, uploadPdfToCloudinary),
        Promise.all(certificationKeys.map(async (key) => {
          if (pendingFiles.markedForRemoval.certificationImages[key]) return [key, null] as const;
          const cachedUrl = pendingFiles.uploadedUrls.certificationImages[key];
          if (cachedUrl) return [key, cachedUrl] as const;
          const file = pendingFiles.files.certificationImages[key];
          if (!file) return [key, null] as const;
          const url = await uploadImageToCloudinary(file);
          pendingFiles.markCertificationUploaded(key, url);
          return [key, url] as const;
        })),
      ]);
      return { coverImage, brochure, certificationImages: Object.fromEntries(certificationEntries) };
    } finally {
      setIsUploadingFiles(false);
    }
  };

  const syncCertification = async (imageUrl: string | null) => {
    const preservedIds = (form.certifications || []).filter((id) => id && !id.startsWith("temp-"));
    const existingId = form.certification_id && !form.certification_id.startsWith("temp-") ? form.certification_id : "";
    const hasData = Boolean(form.certification?.title?.trim() || form.certification?.description?.trim());
    if (!hasData) return Array.from(new Set([...preservedIds, ...(existingId ? [existingId] : [])]));

    const data = {
      title: form.certification?.title || `Certificado de ${form.name}`,
      description: form.certification?.description || "",
      image_url: imageUrl,
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
    const syncedFaqs = [...(form.faqs || [])];
    for (let index = 0; index < (form.faqs || []).length; index += 1) {
      const faq = form.faqs[index];
      if (!faq.question?.trim() && !faq.answer?.trim()) continue;
      const data = { question: faq.question || "", answer: faq.answer || "", order: index };
      const existingId = faq.id && !faq.id.startsWith("temp-") ? faq.id : "";
      const response = existingId ? await updateFAQ(existingId, data) : await createFAQ(data);
      const savedId = response?.success && response.data?.id ? response.data.id : existingId;
      if (!savedId) throw new Error(`No se pudo guardar la pregunta ${index + 1}`);
      ids.push(savedId);
      syncedFaqs[index] = { ...faq, id: savedId };
      setFieldValue("faqs", [...syncedFaqs]);
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

  const startSaving = (kind: "marketing" | "web") => {
    if (savingRef.current) return false;
    savingRef.current = true;
    if (kind === "marketing") setIsSavingMarketing(true);
    else setIsSavingWeb(true);
    return true;
  };

  const finishSaving = (kind: "marketing" | "web") => {
    savingRef.current = false;
    if (kind === "marketing") setIsSavingMarketing(false);
    else setIsSavingWeb(false);
  };

  const applySuccessfulUrls = (urls: ResolvedAssetUrls) => {
    const certificationKey = form.certification_id || "new";
    setFieldValue("image_url", urls.coverImage || "");
    setFieldValue("brochure_url", urls.brochure || "");
    if (Object.prototype.hasOwnProperty.call(urls.certificationImages, certificationKey)) {
      setFieldValue("certification.image_url", urls.certificationImages[certificationKey] || "");
    }
    pendingFiles.clearAfterSuccess();
  };

  const getPrimaryCertificationUrl = (urls: ResolvedAssetUrls) => {
    const certificationKey = form.certification_id || "new";
    return Object.prototype.hasOwnProperty.call(urls.certificationImages, certificationKey)
      ? urls.certificationImages[certificationKey]
      : form.certification?.image_url || null;
  };

  const syncAdditionalCertificationImages = async (urls: ResolvedAssetUrls) => {
    const primaryKey = form.certification_id || "new";
    const entries = Object.entries(urls.certificationImages).filter(([key]) => key !== primaryKey && key !== "new");
    await Promise.all(entries.map(async ([id, imageUrl]) => {
      const response = await updateCertification(id, { image_url: imageUrl });
      if (!response?.success) throw new Error("No se pudo guardar una imagen de certificación");
    }));
  };

  const notifySaveError = (error: unknown, uploadsCompleted: boolean) => {
    const message = error instanceof Error ? error.message : "No se pudo completar el guardado";
    if (!uploadsCompleted) {
      toast.error(`No se completaron todas las subidas y no se llamó al backend. Los archivos siguen pendientes para reintentar: ${message}`);
    } else if (pendingFiles.hasPendingFiles) {
      toast.error(`Los archivos se subieron, pero el backend no pudo guardar la información. Los archivos y previews se conservaron para reintentar: ${message}`);
    } else {
      toast.error(`El backend no pudo guardar la información: ${message}`);
    }
  };

  const saveMarketing = async () => {
    if (!ensureProduct() || !validateBeforeUpload("marketing") || !startSaving("marketing")) return false;
    let uploadsCompleted = false;
    try {
      const urls = await uploadPendingFiles();
      uploadsCompleted = true;
      const [certificationIds, faqIds] = await Promise.all([syncCertification(getPrimaryCertificationUrl(urls)), syncFAQs(), syncAdditionalCertificationImages(urls)]);
      const response = await updateProductCommercialContent(productId as string, {
        image_url: urls.coverImage,
        brochure_url: urls.brochure,
        benefit_ids: form.benefit_ids.length ? form.benefit_ids : undefined,
        faq_ids: faqIds,
        certification_ids: certificationIds,
      });
      if (!response.success) throw new Error(response.message || "No se pudo guardar el material comercial");
      applySuccessfulUrls(urls);
      void queryClient.invalidateQueries({ queryKey: ["product", productId] });
      toast.success("Material comercial guardado");
      return true;
    } catch (error) {
      notifySaveError(error, uploadsCompleted);
      return false;
    } finally {
      finishSaving("marketing");
    }
  };

  const saveWebContent = async (validationSection: "web" | "complete" = "complete") => {
    if (!ensureProduct() || !validateBeforeUpload(validationSection) || !startSaving("web")) return false;
    let uploadsCompleted = false;
    try {
      const urls = await uploadPendingFiles();
      uploadsCompleted = true;
      const [certificationIds, faqIds] = await Promise.all([syncCertification(getPrimaryCertificationUrl(urls)), syncFAQs(), syncAdditionalCertificationImages(urls)]);
      const response = await updateProductCommercialContent(productId as string, {
        slug: form.slug?.trim() ? form.slug : undefined,
        description: form.description || null,
        short_description: form.short_description || null,
        sales_status: form.sales_status,
        image_url: urls.coverImage,
        brochure_url: urls.brochure,
        benefit_ids: form.benefit_ids.length ? form.benefit_ids : undefined,
        faq_ids: faqIds,
        certification_ids: certificationIds,
      });
      if (!response.success) throw new Error(response.message || "No se pudo guardar la publicación web");
      applySuccessfulUrls(urls);
      void queryClient.invalidateQueries({ queryKey: ["product", productId] });
      toast.success("Publicación web guardada");
      return true;
    } catch (error) {
      notifySaveError(error, uploadsCompleted);
      return false;
    } finally {
      finishSaving("web");
    }
  };

  const saveDraftContent = async () => {
    if (!ensureProduct() || !validateBeforeUpload("marketing") || !validateDraftWebFields() || !startSaving("web")) return false;
    let uploadsCompleted = false;
    try {
      const urls = await uploadPendingFiles();
      uploadsCompleted = true;
      const [certificationIds] = await Promise.all([syncCertification(getPrimaryCertificationUrl(urls)), syncAdditionalCertificationImages(urls)]);
      const response = await updateProductCommercialContent(productId as string, {
        slug: form.slug?.trim() ? form.slug : undefined,
        description: form.description || null,
        short_description: form.short_description || null,
        image_url: urls.coverImage,
        brochure_url: urls.brochure,
        sales_status: "DRAFT",
        certification_ids: certificationIds,
      });
      if (!response.success) throw new Error(response.message || "No se pudo guardar el borrador");
      applySuccessfulUrls(urls);
      void queryClient.invalidateQueries({ queryKey: ["product", productId] });
      toast.success("Borrador guardado");
      return true;
    } catch (error) {
      notifySaveError(error, uploadsCompleted);
      return false;
    } finally {
      finishSaving("web");
    }
  };

  return {
    saveMarketing,
    saveWebContent,
    saveDraftContent,
    isSavingMarketing,
    isSavingWeb,
    isUploadingFiles,
  };
};
