import { CalendarDays, CircleDot, CreditCard, Layers3 } from "lucide-react";
import type { UIProduct } from "../../types/product.types";
import {
  getEditionStatusLabel,
  getInstallmentRangeLabel,
  getModalityLabel,
} from "../../utils/productDetailPresentation.utils";

interface ProductEssentialInfoProps {
  product: UIProduct;
  formatDate: (date?: string | null, format?: string) => string;
}

const ProductEssentialInfo = ({ product, formatDate }: ProductEssentialInfoProps) => {
  const items = [
    {
      label: "Inicio",
      value: formatDate(product.edition?.start_date, "PPP"),
      icon: CalendarDays,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Modalidad",
      value: getModalityLabel(product.edition?.modality),
      icon: Layers3,
      color: "bg-violet-50 text-violet-600",
    },
    {
      label: "Estado académico",
      value: getEditionStatusLabel(product.edition?.edition_status),
      icon: CircleDot,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Financiamiento",
      value: getInstallmentRangeLabel(product.installments_min_number, product.installments_max_number),
      icon: CreditCard,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5">
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${color}`}>
            <Icon size={16} />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
            <p className="mt-1 text-sm font-bold leading-snug text-slate-800">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductEssentialInfo;
