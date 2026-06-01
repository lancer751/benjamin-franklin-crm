import React from "react";
import { Tag, FileText, ExternalLink } from "lucide-react";
import DetailSection from "../shared/DetailSection";

interface CommercialSectionProps {
  product: any;
}

const CommercialSection = ({ product }: CommercialSectionProps) => {
  const hasShortDesc = !!product.short_description;
  const hasDesc = !!product.description;
  const hasBrochure = !!product.brochure_url;

  if (!hasShortDesc && !hasDesc && !hasBrochure) return null;

  return (
    <DetailSection 
      title="Información Comercial" 
      description="Propuesta de marketing y descripción orientada al alumno."
      icon={Tag}
      iconBg="bg-primary/10"
      iconColor="text-primary"
    >
      <div className="space-y-6">
        {hasShortDesc && (
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Resumen Comercial</span>
            <p className="text-base text-slate-600 font-medium leading-relaxed italic border-l-3 border-primary/25 pl-4 py-0.5">
              "{product.short_description}"
            </p>
          </div>
        )}

        {hasDesc && (
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Detalle Completo</span>
            <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50/30 p-5 rounded-xl border border-slate-200/50">
              {product.description}
            </div>
          </div>
        )}

        {hasBrochure && (
          <div className="pt-4 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Brochure Informativo (PDF)</span>
            <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 flex items-center justify-between gap-3 shadow-sm hover:bg-emerald-50/40 transition-all duration-200">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 shadow-sm">
                  <FileText size={20} className="text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">Folleto Informativo del Producto.pdf</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Documento promocional oficial y descargable</p>
                </div>
              </div>
              <a 
                href={product.brochure_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-600/10 shrink-0"
              >
                Ver Brochure <ExternalLink size={12} />
              </a>
            </div>
          </div>
        )}
      </div>
    </DetailSection>
  );
};

export default CommercialSection;
