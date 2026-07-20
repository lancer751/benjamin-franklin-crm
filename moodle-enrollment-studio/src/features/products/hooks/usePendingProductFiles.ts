import { useCallback, useEffect, useRef, useState } from "react";

export type PendingProductFileKey = "coverImage" | "brochure";

export interface PendingProductFiles {
  coverImage: File | null;
  brochure: File | null;
  certificationImages: Record<string, File>;
}

interface PreviewState {
  coverImage: string | null;
  certificationImages: Record<string, string>;
}

interface UploadedUrlState {
  coverImage: string | null;
  brochure: string | null;
  certificationImages: Record<string, string>;
}

interface RemovalState {
  coverImage: boolean;
  brochure: boolean;
  certificationImages: Record<string, boolean>;
}

const emptyFiles = (): PendingProductFiles => ({ coverImage: null, brochure: null, certificationImages: {} });
const emptyPreviews = (): PreviewState => ({ coverImage: null, certificationImages: {} });
const emptyUploadedUrls = (): UploadedUrlState => ({ coverImage: null, brochure: null, certificationImages: {} });
const emptyRemovals = (): RemovalState => ({ coverImage: false, brochure: false, certificationImages: {} });

export const usePendingProductFiles = () => {
  const [files, setFiles] = useState<PendingProductFiles>(emptyFiles);
  const [previews, setPreviews] = useState<PreviewState>(emptyPreviews);
  const [uploadedUrls, setUploadedUrls] = useState<UploadedUrlState>(emptyUploadedUrls);
  const [markedForRemoval, setMarkedForRemoval] = useState<RemovalState>(emptyRemovals);
  const previewRef = useRef<PreviewState>(emptyPreviews());

  const revokeUrl = (url?: string | null) => {
    if (url) URL.revokeObjectURL(url);
  };

  const selectFile = useCallback((key: PendingProductFileKey, file: File) => {
    if (key === "coverImage") {
      revokeUrl(previewRef.current.coverImage);
      const preview = URL.createObjectURL(file);
      previewRef.current.coverImage = preview;
      setPreviews((current) => ({ ...current, coverImage: preview }));
    }
    setFiles((current) => ({ ...current, [key]: file }));
    setUploadedUrls((current) => ({ ...current, [key]: null }));
    setMarkedForRemoval((current) => ({ ...current, [key]: false }));
  }, []);

  const removeFile = useCallback((key: PendingProductFileKey, hasExistingUrl: boolean) => {
    const hadPendingFile = Boolean(files[key]);
    if (key === "coverImage") {
      revokeUrl(previewRef.current.coverImage);
      previewRef.current.coverImage = null;
      setPreviews((current) => ({ ...current, coverImage: null }));
    }
    setFiles((current) => ({ ...current, [key]: null }));
    setUploadedUrls((current) => ({ ...current, [key]: null }));
    setMarkedForRemoval((current) => ({ ...current, [key]: hadPendingFile ? false : hasExistingUrl }));
  }, [files]);

  const selectCertificationImage = useCallback((certificationKey: string, file: File) => {
    revokeUrl(previewRef.current.certificationImages[certificationKey]);
    const preview = URL.createObjectURL(file);
    previewRef.current.certificationImages[certificationKey] = preview;
    setFiles((current) => ({ ...current, certificationImages: { ...current.certificationImages, [certificationKey]: file } }));
    setPreviews((current) => ({ ...current, certificationImages: { ...current.certificationImages, [certificationKey]: preview } }));
    setUploadedUrls((current) => {
      const certificationImages = { ...current.certificationImages };
      delete certificationImages[certificationKey];
      return { ...current, certificationImages };
    });
    setMarkedForRemoval((current) => ({ ...current, certificationImages: { ...current.certificationImages, [certificationKey]: false } }));
  }, []);

  const removeCertificationImage = useCallback((certificationKey: string, hasExistingUrl: boolean) => {
    const hadPendingFile = Boolean(files.certificationImages[certificationKey]);
    revokeUrl(previewRef.current.certificationImages[certificationKey]);
    delete previewRef.current.certificationImages[certificationKey];
    setFiles((current) => {
      const certificationImages = { ...current.certificationImages };
      delete certificationImages[certificationKey];
      return { ...current, certificationImages };
    });
    setPreviews((current) => {
      const certificationImages = { ...current.certificationImages };
      delete certificationImages[certificationKey];
      return { ...current, certificationImages };
    });
    setUploadedUrls((current) => {
      const certificationImages = { ...current.certificationImages };
      delete certificationImages[certificationKey];
      return { ...current, certificationImages };
    });
    setMarkedForRemoval((current) => ({
      ...current,
      certificationImages: { ...current.certificationImages, [certificationKey]: hadPendingFile ? false : hasExistingUrl },
    }));
  }, [files.certificationImages]);

  const markUploaded = useCallback((key: PendingProductFileKey, url: string) => {
    setUploadedUrls((current) => ({ ...current, [key]: url }));
  }, []);

  const markCertificationUploaded = useCallback((certificationKey: string, url: string) => {
    setUploadedUrls((current) => ({ ...current, certificationImages: { ...current.certificationImages, [certificationKey]: url } }));
  }, []);

  const moveCertificationImage = useCallback((fromKey: string, toKey: string) => {
    if (fromKey === toKey || !files.certificationImages[fromKey]) return;
    const file = files.certificationImages[fromKey];
    const preview = previewRef.current.certificationImages[fromKey];
    const uploadedUrl = uploadedUrls.certificationImages[fromKey];
    delete previewRef.current.certificationImages[fromKey];
    if (preview) previewRef.current.certificationImages[toKey] = preview;
    setFiles((current) => {
      const certificationImages = { ...current.certificationImages, [toKey]: file };
      delete certificationImages[fromKey];
      return { ...current, certificationImages };
    });
    setPreviews((current) => {
      const certificationImages = { ...current.certificationImages };
      delete certificationImages[fromKey];
      if (preview) certificationImages[toKey] = preview;
      return { ...current, certificationImages };
    });
    setUploadedUrls((current) => {
      const certificationImages = { ...current.certificationImages };
      delete certificationImages[fromKey];
      if (uploadedUrl) certificationImages[toKey] = uploadedUrl;
      return { ...current, certificationImages };
    });
  }, [files.certificationImages, uploadedUrls.certificationImages]);

  const clearAfterSuccess = useCallback(() => {
    revokeUrl(previewRef.current.coverImage);
    Object.values(previewRef.current.certificationImages).forEach(revokeUrl);
    previewRef.current = emptyPreviews();
    setFiles(emptyFiles());
    setPreviews(emptyPreviews());
    setUploadedUrls(emptyUploadedUrls());
    setMarkedForRemoval(emptyRemovals());
  }, []);

  useEffect(() => () => {
    revokeUrl(previewRef.current.coverImage);
    Object.values(previewRef.current.certificationImages).forEach(revokeUrl);
  }, []);

  return {
    files,
    previews,
    uploadedUrls,
    markedForRemoval,
    selectFile,
    removeFile,
    selectCertificationImage,
    removeCertificationImage,
    markUploaded,
    markCertificationUploaded,
    moveCertificationImage,
    clearAfterSuccess,
    hasPendingFiles: Boolean(files.coverImage || files.brochure || Object.keys(files.certificationImages).length),
  };
};

export type PendingProductFilesController = ReturnType<typeof usePendingProductFiles>;
