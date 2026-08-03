import { ChevronDown, Wrench } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/core/components/ui/collapsible";
import type { UIProduct } from "../../types/product.types";
import { getPricingStatusLabel } from "../../utils/productDetailPresentation.utils";

interface ProductTechnicalInfoProps {
  product: UIProduct;
  formatDate: (date?: string | null, format?: string) => string;
}

const ProductTechnicalInfo = ({ product, formatDate }: ProductTechnicalInfoProps) => (
  <Collapsible className="rounded-2xl border border-slate-200 bg-white">
    <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left">
      <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        <Wrench size={15} className="text-slate-500" />
        Información técnica
      </span>
      <ChevronDown size={16} className="text-slate-400" />
    </CollapsibleTrigger>
    <CollapsibleContent className="border-t border-slate-100 px-5 py-4">
      <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["ID del producto", product.id],
          ["Slug", product.slug || "No definido"],
          ["Última actualización", product.updated_at ? formatDate(product.updated_at, "PPPp") : "No disponible"],
          ["Código de edición", product.edition?.edition_code || "No definido"],
          ["Estado técnico de precios", getPricingStatusLabel(product.pricing_status)],
        ].map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</dt>
            <dd className="mt-1 break-all font-medium text-slate-700">{value}</dd>
          </div>
        ))}
      </dl>
    </CollapsibleContent>
  </Collapsible>
);

export default ProductTechnicalInfo;
