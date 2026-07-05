import React from "react";
import { createPortal } from "react-dom";
import { Badge } from "@/core/components/ui/badge";
import { Award, ShieldCheck, HelpCircle } from "lucide-react";
import DetailSection from "../shared/DetailSection";

interface CertificationSectionProps {
  product: any;
}

const CertificationSection = ({ product }: CertificationSectionProps) => {
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);

  // Mapear de forma segura la estructura del JSON del backend o relaciones
  const rawCert = product?.certification || product?.relatedCertifications?.[0]?.certification;

  if (!rawCert) return null;

  const id = rawCert.id;
  const title = rawCert.title;
  const description = rawCert.description;
  const imageUrl = (rawCert as any).image_url || (rawCert as any).imageUrl || "";
  const registryValidity = (rawCert as any).registry_validity || (rawCert as any).registryValidity || "";
  const hasDigital = !!((rawCert as any).has_digital ?? (rawCert as any).hasDigital ?? true);
  const hasPhysical = !!((rawCert as any).has_physical ?? (rawCert as any).hasPhysical ?? true);

  return (
    <DetailSection
      title="Certificación Oficial"
      description="Diploma certificado y validez de registro asociado al producto."
      icon={Award}
      iconBg="bg-amber-50"
      iconColor="text-amber-500"
    >
      <div className="flex flex-col lg:flex-row lg:items-start lg:gap-8 justify-between">
        {/* LADO IZQUIERDO: DETALLES */}
        <div className="flex-1 space-y-4">
          <div className="space-y-3">
            {title ? (
              <h4 className="text-base font-bold text-slate-800 leading-snug">{title}</h4>
            ) : (
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="text-base font-semibold text-slate-700">Certificación Oficial</h4>
                <Badge variant="outline" className="rounded-lg px-2 py-0.5 bg-slate-100 text-slate-600 border-slate-200 font-mono text-[9px] font-bold">
                  ID: {id ? `${id.substring(0, 8)}...` : "S/I"}
                </Badge>
              </div>
            )}
            {description && (
              <p className="text-xs text-slate-500 leading-relaxed font-normal">{description}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            {registryValidity && (
              <div className="text-[10px] text-slate-500 font-semibold bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2 flex items-center gap-1.5 shadow-sm">
                <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                <span>
                  Validez de Registro: <span className="text-slate-800 font-bold">{registryValidity}</span>
                </span>
              </div>
            )}

            {(hasDigital || hasPhysical) && (
              <div className="flex gap-2 flex-wrap">
                {hasDigital && (
                  <span className="px-2.5 py-1 rounded-xl bg-blue-50/70 text-blue-700 text-[10px] font-bold border border-blue-100/60 shadow-sm flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-blue-500" /> Digital
                  </span>
                )}
                {hasPhysical && (
                  <span className="px-2.5 py-1 rounded-xl bg-purple-50/70 text-purple-700 text-[10px] font-bold border border-purple-100/60 shadow-sm flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-purple-500" /> Físico
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* LADO DERECHO: IMAGEN PREVIEW */}
        {imageUrl ? (
          <div className="w-full lg:w-[360px] shrink-0">
            <div
              onClick={() => setIsPreviewOpen(true)}
              className="cursor-pointer group relative mt-4 overflow-hidden rounded-2xl border border-slate-200 transition-all hover:scale-[1.01] hover:border-amber-400 active:scale-[0.99] aspect-video w-full bg-slate-100/50 shadow-sm"
            >
              <img
                src={imageUrl}
                alt={title || "Diploma de Certificación"}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                <span className="bg-white/95 backdrop-blur-sm text-slate-800 text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-md border border-slate-200 transition-transform group-hover:scale-105 active:scale-95">
                  Previsualizar
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full lg:w-[360px] shrink-0 mt-4 lg:mt-0 flex items-center justify-center p-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-slate-400 text-xs italic">
            <HelpCircle size={14} className="mr-1.5 text-slate-400 shrink-0" />
            Sin imagen de certificado cargada
          </div>
        )}
      </div>

      {/* PORTAL MODAL PREVIEW */}
      {isPreviewOpen && imageUrl && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="relative max-w-5xl w-full bg-white dark:bg-slate-900 rounded-3xl p-2.5 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón Cerrar */}
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="absolute top-5 right-5 z-10 w-9 h-9 rounded-2xl bg-slate-950/90 hover:bg-slate-950 hover:scale-105 active:scale-95 text-white flex items-center justify-center transition-all shadow-lg border border-slate-800 font-bold text-xs"
              aria-label="Cerrar modal"
            >
              ✕
            </button>
            
            <img
              src={imageUrl}
              alt={title || "Diploma"}
              className="w-full h-auto max-h-[82vh] object-contain mx-auto rounded-2xl"
            />
          </div>
        </div>,
        document.body
      )}
    </DetailSection>
  );
};

export default CertificationSection;
