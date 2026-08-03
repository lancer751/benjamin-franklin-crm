import { AlertCircle, CheckCircle2, Circle } from "lucide-react";
import type { ProductRequirement } from "../../utils/productFormRequirements";

interface ProductPublicationRequirementsProps {
  requirements: ProductRequirement[];
  isOnSale: boolean;
}

const ProductPublicationRequirements = ({ requirements, isOnSale }: ProductPublicationRequirementsProps) => {
  const missing = requirements.filter((item) => item.state !== "complete" && item.state !== "optional");
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:sticky xl:top-6">
      <h3 className="text-sm font-bold text-slate-900">Requisitos de publicación</h3>
      <p className="mt-1 text-xs text-slate-500">El cambio de estado se aplicará al guardar, después de validar estos requisitos.</p>
      <ul className="mt-4 space-y-2.5">
        {requirements.map((item) => {
          const complete = item.state === "complete";
          const optional = item.state === "optional";
          const Icon = complete ? CheckCircle2 : optional ? Circle : AlertCircle;
          return <li key={item.id} className="flex items-center gap-2 text-xs"><Icon size={15} className={complete ? "text-emerald-500" : optional ? "text-slate-300" : "text-amber-500"} /><span className={complete ? "text-slate-700" : "text-slate-500"}>{item.label}</span>{optional && <span className="ml-auto text-[9px] uppercase text-slate-400">Opcional</span>}</li>;
        })}
      </ul>
      {isOnSale && missing.length > 0 && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3"><p className="text-xs font-bold text-red-700">No puedes poner este producto en venta todavía</p><p className="mt-1 text-[11px] text-red-600">Completa {missing.map((item) => item.label.toLowerCase()).join(", ")}.</p></div>}
    </aside>
  );
};

export default ProductPublicationRequirements;
