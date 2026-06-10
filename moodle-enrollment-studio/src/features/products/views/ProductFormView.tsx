import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Loader2, 
  Save, 
  AlertCircle, 
  ArrowRight, 
  FileText, 
  Upload, 
  Trash2, 
  Award, 
  Sparkles,
  ShieldAlert,
  Globe,
  Settings,
  Image as ImageIcon
} from "lucide-react";
import { getProductById, updateProductCommercialContent } from "../services/productService";
import { getBenefits } from "../services/benefitService";
import { createFAQ, updateFAQ } from "../services/faqService";
import { createCertification, updateCertification } from "../services/certificationService";
import { uploadImageToCloudinary, uploadPdfToCloudinary } from "@/core/lib/uploadService";
import { useProductFormModal } from "../hooks/useProductFormModal";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

import ProductPageHeader from "@/features/products/components/shared/ProductPageHeader";
import AcademicDetailsCard from "@/features/products/components/form/AcademicDetailsCard";
import CommercialConfigCard from "@/features/products/components/form/CommercialConfigCard";
import BenefitsCard from "@/features/products/components/form/BenefitsCard";
import CertificationCard from "@/features/products/components/form/CertificationCard";
import FAQsSectionCard from "@/features/products/components/form/FAQsSectionCard";
import CoverImageUploader from "@/features/products/components/form/CoverImageUploader";
import PricingCard from "@/features/products/components/form/PricingCard";
import DiscountSection from "@/features/products/components/form/DiscountSection";
import { Button } from "@/core/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/core/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/core/components/ui/card";
import { cn } from "@/core/lib/utils";

const ProductFormView = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("general");
  const [isSavingTab2, setIsSavingTab2] = useState(false);
  const [isSavingTab3, setIsSavingTab3] = useState(false);
  const [isUploadingBrochure, setIsUploadingBrochure] = useState(false);

  // Obtener rol del usuario real logueado en el store del CRM
  const authUser = useAuthStore((state) => state.user);
  const userRole = authUser?.role?.name || "ADMIN";
  const isMarketingRole = userRole === "MARKETING";

  // Obtener data inicial si estamos en modo edición
  const { data: productRes, isLoading: isLoadingProduct } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id as string),
    enabled: !!id,
  });

  const initialData = productRes?.success ? productRes.data : undefined;

  // Obtener beneficios dinámicos de la API
  const { data: benefitsRes, isLoading: isLoadingBenefits } = useQuery({
    queryKey: ["benefits"],
    queryFn: getBenefits,
  });

  const availableBenefits = benefitsRes?.data || [];

  const {
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
    isPending,
    handleLoadDefaultFAQs
  } = useProductFormModal(
    true, 
    (data: any) => {
      // Si el producto se creó por primera vez y el backend devolvió el id del producto
      if (!isEdit && data?.success && data?.data?.id) {
        navigate(`/productos/${data.data.id}/editar`);
        setActiveTab("marketing");
        toast.success("Producto base creado. Ahora puedes agregar el diseño y contenido comercial.");
      } else {
        navigate("/productos");
      }
    }, 
    initialData
  );

  const handleToggleBenefit = (benefitId: string) => {
    const current = form.benefit_ids || [];
    if (current.includes(benefitId)) {
      setFieldValue("benefit_ids", current.filter(bId => bId !== benefitId));
    } else {
      setFieldValue("benefit_ids", [...current, benefitId]);
    }
  };

  const handleBrochureFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingBrochure(true);
      const url = await uploadPdfToCloudinary(file);
      setFieldValue("brochure_url", url);
      toast.success("Folleto PDF subido correctamente");
    } catch (error) {
      toast.error("Error al subir el folleto PDF");
    } finally {
      setIsUploadingBrochure(false);
    }
  };

  const handleRemoveBrochure = () => {
    setFieldValue("brochure_url", "");
    toast.success("Folleto PDF removido");
  };

  // ACCIÓN PESTAÑA 2: Guardar o cambiar de pestaña - Payload Multimedia únicamente (portada y PDF del brochure)
  const handleSaveMarketing = async (targetTab?: string) => {
    if (!id) return;
    try {
      setIsSavingTab2(true);
      
      // 1. Primero sincronizar la certificación de forma asíncrona si hay datos
      let certificationIds: string[] = [];
      const hasCertData = form.certification?.title || form.certification?.description;
      if (hasCertData) {
        const certData = {
          title: form.certification?.title || `Certificado de ${form.name}`,
          description: form.certification?.description || "",
          image_url: form.certification?.image_url || "",
          issuing_authority: form.certification?.issuing_authority || "Corporación Educativa Benjamin Franklin",
          registry_validity: form.certification?.registry_validity || "",
          has_digital: true,
          has_physical: true,
        };

        if (form.certification_id && form.certification_id.length > 10 && !form.certification_id.startsWith("temp-")) {
          const res = await updateCertification(form.certification_id, certData);
          if (res?.success && res.data?.id) {
            certificationIds.push(res.data.id);
          } else if (form.certification_id) {
            certificationIds.push(form.certification_id);
          }
        } else {
          const res = await createCertification(certData);
          if (res?.success && res.data?.id) {
            certificationIds.push(res.data.id);
            setFieldValue("certification_id", res.data.id);
          }
        }
      }

      // 2. Ejecutar la función del servicio con el payload de marketing
      const res = await updateProductCommercialContent(id, {
        image_url: form.image_url && form.image_url.trim() !== "" ? form.image_url : null,
        brochure_url: form.brochure_url && form.brochure_url.trim() !== "" ? form.brochure_url : null,
        certification_ids: certificationIds.length > 0 ? certificationIds : undefined
      });

      if (res.success) {
        toast.success("Contenido de marketing guardado con éxito");
        queryClient.invalidateQueries({ queryKey: ["product", id] });
        if (targetTab) {
          setActiveTab(targetTab);
        }
      } else {
        toast.error(res.message || "Error al actualizar multimedia de marketing");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar el contenido multimedia");
    } finally {
      setIsSavingTab2(false);
    }
  };

  // ACCIÓN PESTAÑA 3: Guardar Contenido Comercial Web Completo
  const handleSaveCommercial = async () => {
    if (!id) return;
    try {
      setIsSavingTab3(true);

      // 1. Guardar/Actualizar FAQs individuales en la BD
      const faq_ids: string[] = [];
      if (form.faqs && Array.isArray(form.faqs)) {
        for (let i = 0; i < form.faqs.length; i++) {
          const faq = form.faqs[i];
          const faqData = {
            question: faq.question || "",
            answer: faq.answer || "",
            order: i,
          };
          
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
        }
      }

      // 2. Ejecutar actualización comercial completa
      const payload = {
        slug: form.slug,
        description: form.description,
        short_description: form.short_description,
        sales_status: form.sales_status as any,
        benefit_ids: form.benefit_ids || [],
        faq_ids,
        certification_ids: form.certification_id ? [form.certification_id] : [],
      };

      const res = await updateProductCommercialContent(id, payload);

      if (res.success) {
        toast.success("Contenido comercial y catálogo web actualizado correctamente");
        queryClient.invalidateQueries({ queryKey: ["product", id] });
      } else {
        toast.error(res.message || "Error al actualizar el contenido comercial");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar el contenido comercial");
    } finally {
      setIsSavingTab3(false);
    }
  };

  const handleHeaderSubmit = () => {
    if (activeTab === "general") {
      onSubmit("general");
    } else if (activeTab === "marketing") {
      handleSaveMarketing();
    } else if (activeTab === "commercial") {
      handleSaveCommercial();
    }
  };

  if (isEdit && isLoadingProduct) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center flex-col gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Cargando información del producto...</p>
      </div>
    );
  }

  const isBaseProductCreated = isEdit || !!id;

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto px-4">
      <ProductPageHeader
        title={isEdit ? "Editar Producto Comercial" : "Configurar Nuevo Producto"}
        subtitle={isEdit ? `Modificando detalles para: ${form.name}` : "Asigna cursos académicos, configura precios y añade beneficios comerciales."}
        onBack={() => navigate("/productos")}
        actions={
          <>
            <Button 
              variant="outline" 
              className="rounded-xl border-slate-200 hover:bg-slate-50"
              onClick={() => navigate("/productos")}
              disabled={isPending || isSavingTab2 || isSavingTab3}
            >
              Cancelar
            </Button>
            <Button 
              className="rounded-xl btn-primary gap-2 shadow-md shadow-primary/20"
              onClick={handleHeaderSubmit}
              disabled={isPending || isSavingTab2 || isSavingTab3}
            >
              {isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Guardando...
                </>
              ) : (
                <>
                  <Save size={16} /> {isEdit ? "Actualizar Producto" : "Publicar Producto"}
                </>
              )}
            </Button>
          </>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl grid grid-cols-1 md:grid-cols-3 max-w-3xl border border-slate-200">
          <TabsTrigger 
            value="general"
            className="rounded-xl py-2.5 text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 transition-all"
          >
            <Sparkles size={14} className="mr-2 text-sky-500" /> 1. Configuración y Precios (Gerencia)
          </TabsTrigger>
          <TabsTrigger 
            value="marketing"
            className="rounded-xl py-2.5 text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 transition-all"
          >
            <Award size={14} className="mr-2 text-amber-500" /> 2. Diseño y Certificados (Marketing)
          </TabsTrigger>
          <TabsTrigger 
            value="commercial"
            className="rounded-xl py-2.5 text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 transition-all"
          >
            <Globe size={14} className="mr-2 text-emerald-500" /> 3. Contenido Comercial Web (Plataforma)
          </TabsTrigger>
        </TabsList>

        {/* ================= PESTAÑA 1: CONFIGURACIÓN Y PRECIOS (GERENCIA) ================= */}
        <TabsContent value="general" className="outline-none space-y-6">
          {isMarketingRole && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800 shadow-sm animate-fadeIn">
              <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-900 text-sm">Modo de lectura activo</h4>
                <p className="text-xs text-amber-800/90 mt-0.5">
                  Tu rol no permite modificar la estructura de precios ni cohortes académicas de Gerencia.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lado Izquierdo: Nombre, Detalles Académicos y Campaña de Descuento */}
            <div className="lg:col-span-2 space-y-6">
              <div className={cn("space-y-6 transition-all duration-300", isMarketingRole && "opacity-70 pointer-events-none select-none")}>
                
                {/* Nombre Comercial Card */}
                <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-colors">
                  <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Settings size={16} className="text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold text-slate-900">Nombre del Producto Comercial</CardTitle>
                        <CardDescription className="text-xs">Identifica el producto en catálogos y plataformas.</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <label className="form-label text-xs font-bold text-slate-700 mb-2 block">
                      Nombre Comercial del Producto
                    </label>
                    <input 
                      type="text" 
                      className={cn("form-input rounded-xl h-11 border-slate-200 text-sm bg-white shadow-sm focus:ring-primary", errors.name && 'border-destructive')} 
                      placeholder="Ej. Curso de React - Cohorte 1" 
                      value={form.name} 
                      onChange={(e) => setFieldValue("name", e.target.value)} 
                    />
                    {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
                  </CardContent>
                </Card>

                <AcademicDetailsCard
                  form={form}
                  errors={errors}
                  setFieldValue={setFieldValue}
                  editions={editions}
                  categories={categories}
                  isLoadingEditions={isLoadingEditions}
                  isLoadingCategories={isLoadingCategories}
                  isEdit={isEdit}
                  selectedEdition={selectedEdition}
                />

                <DiscountSection
                  form={form}
                  errors={errors}
                  setFieldValue={setFieldValue}
                />
              </div>

              {!isMarketingRole && (
                <div className="flex justify-end pt-4">
                  <Button
                    type="button"
                    onClick={() => onSubmit("general")}
                    disabled={isPending}
                    className="rounded-xl btn-primary bg-sky-600 hover:bg-sky-700 text-white gap-2 font-medium shadow-md shadow-sky-600/10"
                  >
                    {isPending ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Guardando...
                      </>
                    ) : (
                      <>
                        {isEdit ? "Guardar y Continuar" : "Crear Producto Base"} <ArrowRight size={16} />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Lado Derecho: Precios y Financiamiento por Modalidades */}
            <div className="space-y-6">
              <div className={cn("transition-all duration-300", isMarketingRole && "opacity-70 pointer-events-none select-none")}>
                <PricingCard
                  form={form}
                  errors={errors}
                  setFieldValue={setFieldValue}
                  setPriceValue={setPriceValue}
                  selectedEdition={selectedEdition}
                  isEdit={isEdit}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ================= PESTAÑA 2: DISEÑO Y CERTIFICADOS (MARKETING) ================= */}
        <TabsContent value="marketing" className="outline-none space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lado Izquierdo: Certificados y Firmas */}
            <div className="lg:col-span-2 space-y-6">
              <CertificationCard
                form={form}
                errors={errors}
                setFieldValue={setFieldValue}
              />

              <div className="flex justify-end pt-4 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSaveMarketing()}
                  disabled={isSavingTab2}
                  className="rounded-xl border-slate-200"
                >
                  {isSavingTab2 ? "Guardando..." : "Guardar Multimedia"}
                </Button>
                <Button
                  type="button"
                  onClick={() => handleSaveMarketing("commercial")}
                  disabled={isSavingTab2}
                  className="rounded-xl btn-primary bg-sky-600 hover:bg-sky-700 text-white gap-2 font-medium shadow-md shadow-sky-600/10"
                >
                  {isSavingTab2 ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Guardando...
                    </>
                  ) : (
                    <>
                      Guardar y Continuar <ArrowRight size={16} />
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Lado Derecho: Portada de Imagen y Brochure PDF */}
            <div className="space-y-6">
              <CoverImageUploader
                imageUrl={form.image_url}
                isUploading={isUploading}
                onUpload={handleImageUpload}
              />

              {/* Brochure Informativo PDF Card */}
              <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-colors">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <FileText size={16} className="text-emerald-600" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold text-slate-900">Brochure Informativo (PDF)</CardTitle>
                      <CardDescription className="text-xs">Sube el documento descargable para la plataforma web.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {form.brochure_url ? (
                    <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                          <FileText size={18} className="text-emerald-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">Folleto del Producto.pdf</p>
                          <a 
                            href={form.brochure_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] text-emerald-600 font-semibold hover:underline"
                          >
                            Ver Archivo PDF
                          </a>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-lg text-slate-400 hover:text-red-500 shrink-0"
                        onClick={handleRemoveBrochure}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="relative border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:border-emerald-500/50 hover:bg-slate-50/50 transition-all"
                      onClick={() => document.getElementById("brochure-upload")?.click()}
                    >
                      <FileText size={32} className="text-slate-400 mb-2 strokeWidth={1.5}" />
                      <p className="text-xs font-semibold text-slate-700">Subir Brochure Comercial</p>
                      <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] leading-normal">Sube archivos PDF de hasta 10 MB para su descarga.</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-3 rounded-xl text-xs border-slate-200 bg-white"
                      >
                        Seleccionar Archivo
                      </Button>
                    </div>
                  )}

                  {isUploadingBrochure && (
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin text-emerald-500" />
                      <span className="text-[11px] font-bold text-emerald-600 animate-pulse">Subiendo PDF...</span>
                    </div>
                  )}

                  <input 
                    id="brochure-upload" 
                    type="file" 
                    accept=".pdf" 
                    className="hidden" 
                    onChange={handleBrochureFileChange}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ================= PESTAÑA 3: CONTENIDO COMERCIAL WEB (PLATAFORMA) ================= */}
        <TabsContent value="commercial" className="outline-none">
          <div className="flex flex-col space-y-8 w-full max-w-full">
            
            {/* 1. BLOQUE PRINCIPAL - CONFIGURACIÓN DE TEXTOS */}
            <CommercialConfigCard
              form={form}
              errors={errors}
              setFieldValue={setFieldValue}
            />

            {/* 2. BLOQUE DE BENEFICIOS DESTACADOS (Rediseño horizontal) */}
            <BenefitsCard
              availableBenefits={availableBenefits}
              isLoadingBenefits={isLoadingBenefits}
              benefitIds={form.benefit_ids || []}
              errors={errors}
              onToggle={handleToggleBenefit}
              setFieldValue={setFieldValue}
            />

            {/* 3. BLOQUE DE PREGUNTAS FRECUENTES (FAQs) */}
            <FAQsSectionCard
              form={form}
              setFieldValue={setFieldValue}
              handleLoadDefaultFAQs={handleLoadDefaultFAQs}
            />

            {/* BOTÓN DE ACCIÓN EXPLICITA DE GUARDADO */}
            <div className="flex justify-end pt-2">
              <Button
                type="button"
                onClick={handleSaveCommercial}
                disabled={isSavingTab3}
                className="rounded-xl btn-primary bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-medium shadow-md shadow-emerald-600/10 px-8 py-3 h-auto"
              >
                {isSavingTab3 ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Guardando...
                  </>
                ) : (
                  <>
                    <Save size={16} /> Actualizar Contenido Comercial
                  </>
                )}
              </Button>
            </div>

          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductFormView;
