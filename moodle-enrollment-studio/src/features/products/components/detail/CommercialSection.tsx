import React from "react";
import { Tag } from "lucide-react";
import DetailSection from "../shared/DetailSection";

interface CommercialSectionProps {
  product: any;
}

const CommercialSection = ({ product }: CommercialSectionProps) => {
  const hasShortDesc = !!product.short_description;
  const hasDesc = !!product.description;

  if (!hasShortDesc && !hasDesc) return null;

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
      </div>
    </DetailSection>
  );
};

export default CommercialSection;
