import React from "react";
import { Gift } from "lucide-react";
import DetailSection from "../shared/DetailSection";
import BenefitBadgeItem from "./BenefitBadgeItem";

interface BenefitsSectionProps {
  product: any;
}

const BenefitsSection = ({ product }: BenefitsSectionProps) => {
  // Normalizar los beneficios desde ambas propiedades potenciales de la API
  const rawBenefits = product?.benefits || [];
  const rawRelatedBenefits = product?.relatedBenefits || [];

  let benefits: any[] = [];
  if (rawRelatedBenefits.length > 0) {
    benefits = rawRelatedBenefits
      .map((rb: any) => ({
        description: rb.benefits?.description || rb.benefits?.name || "",
      }))
      .filter((b) => !!b.description);
  } else if (rawBenefits.length > 0) {
    benefits = rawBenefits
      .map((b: any) => ({
        description: b.description || b.name || "",
      }))
      .filter((b) => !!b.description);
  }

  if (benefits.length === 0) return null;

  return (
    <DetailSection 
      title="Beneficios Destacados" 
      description="Regalos comerciales y ventajas de valor agregado para el alumno."
      icon={Gift}
      iconBg="bg-amber-50"
      iconColor="text-amber-600"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {benefits.map((rb: any, idx: number) => (
          <BenefitBadgeItem key={idx} rb={rb} />
        ))}
      </div>
    </DetailSection>
  );
};

export default BenefitsSection;
