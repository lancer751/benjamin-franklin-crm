import React from "react";
import { CheckCircle2 } from "lucide-react";

interface BenefitBadgeItemProps {
  rb: any;
}

const BenefitBadgeItem = ({ rb }: BenefitBadgeItemProps) => {
  const description = rb.description;

  if (!description) return null;

  return (
    <div className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200/80 bg-slate-50/30 hover:border-slate-350 hover:bg-slate-50/50 transition-colors duration-200">
      <CheckCircle2 size={15} className="text-emerald-500 mt-0.5 shrink-0" />
      <span className="text-xs font-bold text-slate-800">{description}</span>
    </div>
  );
};

export default BenefitBadgeItem;
