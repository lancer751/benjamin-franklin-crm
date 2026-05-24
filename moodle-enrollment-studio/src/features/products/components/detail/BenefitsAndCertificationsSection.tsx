import React from "react";
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
  const benefits = product.benefits || [];
  const certification = product.certification;

  if (benefits.length === 0 && !certification) return null;

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
            <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Award size={13} className="text-amber-600" /> Certificación Otorgada
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(() => {
                const title = certification.title;
                const id = certification.id;
                const description = certification.description;
                const hasDigital = certification.hasDigital;
                const hasPhysical = certification.hasPhysical;
                const imageUrl = certification.imageUrl;

                return (
                  <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/30 hover:border-slate-350 hover:bg-slate-50/50 transition-all duration-200 flex flex-col justify-between gap-3">
                    <div className="space-y-2">
                      {title ? (
                        <span className="text-xs font-bold text-slate-800 block leading-tight">{title}</span>
                      ) : (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-semibold text-slate-600">Certificación</span>
                          <Badge variant="outline" className="rounded-lg px-2 py-0.5 bg-slate-100 text-slate-600 border-slate-200 font-mono text-[9px] font-bold">
                            ID: {id ? `${id.substring(0, 8)}...` : 'S/I'}
                          </Badge>
                        </div>
                      )}
                      {description && (
                        <span className="text-[10px] text-slate-500 block leading-normal">{description}</span>
                      )}
                      {imageUrl && (
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-100 mt-2">
                          <img 
                            src={imageUrl} 
                            alt={title || "Diploma"} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      )}
                    </div>
                    {(hasDigital || hasPhysical) && (
                      <div className="flex gap-1.5 flex-wrap pt-1">
                        {hasDigital && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-50/60 text-blue-700 text-[9px] font-bold border border-blue-100">Digital</span>
                        )}
                        {hasPhysical && (
                          <span className="px-1.5 py-0.5 rounded bg-purple-50/60 text-purple-700 text-[9px] font-bold border border-purple-100">Físico</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </DetailSection>
  );
};

export default BenefitsAndCertificationsSection;
