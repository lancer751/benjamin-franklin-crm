import React from "react";
import { createPortal } from "react-dom";
import { Badge } from "@/core/components/ui/badge";
import { Gift, Award } from "lucide-react";
import { cn } from "@/core/lib/utils";
import DetailSection from "../shared/DetailSection";
import BenefitBadgeItem from "./BenefitBadgeItem";
import { UIProduct } from "../../types/product.types";

interface BenefitsAndCertificationsSectionProps {
  product: UIProduct;
}

const BenefitsAndCertificationsSection = ({ product }: BenefitsAndCertificationsSectionProps) => {
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const benefits = product.benefits || [];
  const certification = product.certification;

  if (benefits.length === 0 && !certification) return null;

  const title = certification?.title;
  const id = certification?.id;
  const description = certification?.description;
  const hasDigital = certification?.hasDigital;
  const hasPhysical = certification?.hasPhysical;
  const imageUrl = certification?.imageUrl;

  return (
    <DetailSection 
      title="Beneficios & Certificaciones" 
      description="Regalos comerciales y diplomas certificados asociados al producto."
      icon={Award}
      iconBg="bg-amber-50"
      iconColor="text-amber-600"
    >
      <div className="space-y-6">
        {benefits.length > 0 && (
          <div>
            <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Gift size={13} className="text-primary" /> Beneficios Adicionales
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {benefits.map((rb: any, idx: number) => (
                <BenefitBadgeItem key={idx} rb={rb} />
              ))}
            </div>
          </div>
        )}

        {certification && (
          <div className={cn(benefits.length > 0 && "pt-4 border-t border-slate-100")}>
            <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Award size={13} className="text-amber-600" /> Certificación Otorgada
            </h4>
            
            <div className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/30 hover:border-slate-350 hover:bg-slate-50/50 transition-all duration-300 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* LADO IZQUIERDO: DETALLES */}
                <div className="flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    {title ? (
                      <span className="text-sm font-bold text-slate-800 block leading-snug">{title}</span>
                    ) : (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-semibold text-slate-700">Certificación</span>
                        <Badge variant="outline" className="rounded-lg px-2 py-0.5 bg-slate-100 text-slate-600 border-slate-200 font-mono text-[9px] font-bold">
                          ID: {id ? `${id.substring(0, 8)}...` : 'S/I'}
                        </Badge>
                      </div>
                    )}
                    {description && (
                      <p className="text-xs text-slate-500 leading-relaxed font-normal">{description}</p>
                    )}
                  </div>
                  
                  {(hasDigital || hasPhysical) && (
                    <div className="flex gap-2 flex-wrap pt-1">
                      {hasDigital && (
                        <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100 shadow-sm">Digital</span>
                      )}
                      {hasPhysical && (
                        <span className="px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-100 shadow-sm">Físico</span>
                      )}
                    </div>
                  )}
                </div>

                {/* LADO DERECHO: IMAGEN PREVIEW */}
                {imageUrl ? (
                  <div className="flex flex-col justify-center">
                    <div 
                      onClick={() => setIsPreviewOpen(true)}
                      className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100/50 shadow-sm cursor-pointer hover:scale-[1.02] hover:border-amber-400 hover:ring-2 hover:ring-amber-400/20 active:scale-[0.98] transition-all duration-300 group"
                    >
                      <img 
                        src={imageUrl} 
                        alt={title || "Diploma"} 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm border border-slate-200">
                          Previsualizar
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-6 border border-dashed border-slate-200 rounded-xl bg-slate-100/30 text-slate-400 text-xs italic">
                    Sin imagen de certificado cargada
                  </div>
                )}

              </div>
            </div>
          </div>
        )}
      </div>

      {/* PORTAL MODAL PREVIEW */}
      {isPreviewOpen && imageUrl && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div 
            className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 p-3 animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setIsPreviewOpen(false)}
              className="absolute top-6 right-6 z-10 w-10 h-10 rounded-2xl bg-slate-900/90 hover:bg-slate-900 hover:scale-105 active:scale-95 text-white flex items-center justify-center transition-all shadow-md font-bold text-lg"
              aria-label="Cerrar"
            >
              ✕
            </button>
            <div className="rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
              <img 
                src={imageUrl} 
                alt={title || "Diploma"} 
                className="w-full h-auto max-h-[75vh] object-contain mx-auto"
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </DetailSection>
  );
};

export default BenefitsAndCertificationsSection;
