import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/core/components/ui/card";
import { Award, Image as ImageIcon, Upload, Loader2 } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { cn } from "@/core/lib/utils";
import { uploadImageToCloudinary } from "@/features/academic/services/uploadService";
import { toast } from "sonner";

interface CertificationCardProps {
  form: {
    name: string;
    certification_title?: string | null;
    certification_description?: string | null;
    certification_issuing_authority?: string | null;
    certification_registry_validity?: string | null;
    certification?: {
      image_url?: string;
    } | null;
  };
  errors: Record<string, string>;
  setFieldValue: (key: string, value: any) => void;
}

const CertificationCard = ({
  form,
  errors,
  setFieldValue,
}: CertificationCardProps) => {
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      const url = await uploadImageToCloudinary(file);
      setFieldValue("certification.image_url", url);
      toast.success("Imagen de certificación subida correctamente");
    } catch (error) {
      toast.error("Error al subir la imagen de la certificación");
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-colors">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
            <Award size={16} className="text-amber-600" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-slate-900">Detalles de Certificación</CardTitle>
            <CardDescription className="text-xs">Define el diploma oficial que obtendrá el estudiante tras completar exitosamente el programa.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Form fields (Left side - 2 cols) */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <label className="form-label text-xs font-bold text-slate-700 mb-2 block">
                Título del Certificado
              </label>
              <input
                type="text"
                className={cn(
                  "form-input rounded-xl h-11 border-slate-200 text-sm",
                  errors.certification_title && "border-destructive"
                )}
                placeholder="Ej. Diplomado de Especialización en React"
                value={form.certification_title || ""}
                onChange={(e) => setFieldValue("certification_title", e.target.value)}
              />
              {errors.certification_title && (
                <p className="text-destructive text-xs mt-1">{errors.certification_title}</p>
              )}
            </div>

            <div>
              <label className="form-label text-xs font-bold text-slate-700 mb-2 block">
                Descripción del Certificado
              </label>
              <textarea
                className={cn(
                  "form-input rounded-xl min-h-[110px] border-slate-200 py-3 text-sm leading-relaxed",
                  errors.certification_description && "border-destructive"
                )}
                placeholder="Escribe la descripción de la certificación..."
                value={form.certification_description || ""}
                onChange={(e) => setFieldValue("certification_description", e.target.value)}
              />
              {errors.certification_description && (
                <p className="text-destructive text-xs mt-1">{errors.certification_description}</p>
              )}
              <p className="text-[10px] text-muted-foreground mt-1 italic">
                * En la creación, este texto se autocompleta al escribir el nombre del producto comercial.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label text-xs font-bold text-slate-700 mb-2 block">
                  Autoridad Emisora
                </label>
                <input
                  type="text"
                  className={cn(
                    "form-input rounded-xl h-11 border-slate-200 text-sm",
                    errors.certification_issuing_authority && "border-destructive"
                  )}
                  placeholder="Ej. Corporación Educativa Benjamin Franklin"
                  value={form.certification_issuing_authority || ""}
                  onChange={(e) => setFieldValue("certification_issuing_authority", e.target.value)}
                />
                {errors.certification_issuing_authority && (
                  <p className="text-destructive text-xs mt-1">{errors.certification_issuing_authority}</p>
                )}
              </div>

              <div>
                <label className="form-label text-xs font-bold text-slate-700 mb-2 block">
                  Vigencia del Registro
                </label>
                <input
                  type="text"
                  className={cn(
                    "form-input rounded-xl h-11 border-slate-200 text-sm",
                    errors.certification_registry_validity && "border-destructive"
                  )}
                  placeholder="Ej. Permanente / 5 años"
                  value={form.certification_registry_validity || ""}
                  onChange={(e) => setFieldValue("certification_registry_validity", e.target.value)}
                />
                {errors.certification_registry_validity && (
                  <p className="text-destructive text-xs mt-1">{errors.certification_registry_validity}</p>
                )}
              </div>
            </div>
          </div>

          {/* Image Uploader (Right side - 1 col) */}
          <div className="flex flex-col justify-between space-y-3">
            <div>
              <label className="form-label text-xs font-bold text-slate-700 mb-2 block">
                Imagen de la Certificación
              </label>
              <div className="relative aspect-[4/3] rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50/60 group hover:border-primary/50 transition-colors">
                {form.certification?.image_url ? (
                  <>
                    <img
                      src={form.certification.image_url}
                      alt="Diploma"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="gap-2 rounded-xl text-xs font-medium"
                        onClick={() => document.getElementById("certification-image-upload")?.click()}
                      >
                        <Upload size={14} /> Cambiar Diploma
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground p-3 text-center">
                    <ImageIcon size={28} strokeWidth={1.5} className="text-slate-400" />
                    <p className="text-[11px] font-semibold text-slate-500">Sin archivo</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-1 rounded-xl text-xs border-slate-200 hover:bg-slate-100 px-3"
                      onClick={() => document.getElementById("certification-image-upload")?.click()}
                    >
                      Subir Imagen
                    </Button>
                  </div>
                )}

                {isUploadingImage && (
                  <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center gap-2 z-20 rounded-2xl">
                    <Loader2 size={20} className="animate-spin text-primary" />
                    <p className="text-[10px] font-bold text-primary animate-pulse">Guardando...</p>
                  </div>
                )}
              </div>
              <input
                id="certification-image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageFileChange}
              />
            </div>
            <p className="text-[10px] text-muted-foreground italic leading-normal pt-2 border-t border-slate-100">
              * Sube una imagen de certificación independiente de la portada del producto.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CertificationCard;
