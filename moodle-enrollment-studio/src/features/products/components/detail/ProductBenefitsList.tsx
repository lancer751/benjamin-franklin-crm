import { Gift } from "lucide-react";
import type { UIProduct } from "../../types/product.types";

interface ProductBenefitsListProps {
  benefits: UIProduct["benefits"];
  limit?: number;
}

const ProductBenefitsList = ({ benefits, limit }: ProductBenefitsListProps) => {
  const visibleBenefits = typeof limit === "number" ? benefits.slice(0, limit) : benefits;

  if (visibleBenefits.length === 0) {
    return <p className="rounded-xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">No hay beneficios registrados.</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {visibleBenefits.map((benefit) => (
        <div key={benefit.id} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Gift size={16} />
          </span>
          <div>
            {benefit.name && <p className="text-sm font-bold text-slate-800">{benefit.name}</p>}
            <p className="mt-1 text-xs leading-relaxed text-slate-600">{benefit.description || "Beneficio incluido"}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductBenefitsList;
