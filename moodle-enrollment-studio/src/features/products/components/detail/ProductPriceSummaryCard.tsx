import { CreditCard, Landmark, ReceiptText } from "lucide-react";
import { Badge } from "@/core/components/ui/badge";
import { Card } from "@/core/components/ui/card";
import type { UIProduct } from "../../types/product.types";
import {
  formatProductCurrency,
  getAttendanceModeLabel,
  getAttendanceModeVisualConfig,
} from "../../utils/productDetailPresentation.utils";

interface ProductPriceSummaryCardProps {
  price: UIProduct["prices"][number];
  editionModality?: string | null;
  priceCount: number;
  installmentRange: string;
}

const ProductPriceSummaryCard = ({
  price,
  editionModality,
  priceCount,
  installmentRange,
}: ProductPriceSummaryCardProps) => {
  const modalityLabel = getAttendanceModeLabel(price.attendance_mode, editionModality, priceCount);
  const visual = getAttendanceModeVisualConfig(price.attendance_mode, editionModality);

  return (
    <Card className="flex h-full flex-col overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${visual.icon}`}>
            <CreditCard size={17} />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Modalidad</p>
            <h3 className="mt-0.5 truncate text-lg font-bold text-slate-900">{modalityLabel}</h3>
          </div>
        </div>
        <Badge variant="outline" className={`shrink-0 whitespace-nowrap ${visual.accent}`}>
          {installmentRange}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className={`rounded-xl border p-5 ${visual.primary}`}>
          <p className="text-xs font-semibold text-slate-500">Precio al contado</p>
          <p className="mt-1 text-2xl font-black tracking-tight text-slate-900">
            {formatProductCurrency(price.cash_price)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Landmark size={13} /> Matrícula
            </p>
            <p className="mt-2 text-base font-bold text-slate-900">
              {formatProductCurrency(price.enrollment_fee)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <ReceiptText size={13} /> Precio en cuotas
            </p>
            <p className="mt-2 text-base font-bold text-slate-900">
              {formatProductCurrency(price.installment_price)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProductPriceSummaryCard;
