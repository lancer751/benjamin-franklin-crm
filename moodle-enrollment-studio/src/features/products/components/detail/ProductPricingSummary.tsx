import { CreditCard, Landmark, ReceiptText, Tag } from "lucide-react";
import { Card } from "@/core/components/ui/card";
import type { UIProduct } from "../../types/product.types";
import {
  formatProductCurrency,
  getAttendanceModeLabel,
  getInstallmentRangeLabel,
} from "../../utils/productDetailPresentation.utils";

interface ProductPricingSummaryProps {
  product: UIProduct;
}

const ProductPricingSummary = ({ product }: ProductPricingSummaryProps) => {
  const discount = Number(product.discount_price || 0);
  const hasDiscount = Number.isFinite(discount) && discount > 0;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-slate-900">Precios y modalidades</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Cuotas disponibles: {getInstallmentRangeLabel(product.installments_min_number, product.installments_max_number)}
        </p>
      </div>

      {product.prices.length > 0 ? (
        <div className={`grid gap-4 ${product.prices.length > 1 ? "md:grid-cols-2" : "max-w-2xl"}`}>
          {product.prices.map((price, index) => (
            <Card key={`${price.attendance_mode}-${index}`} className="overflow-hidden rounded-2xl border-slate-200 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Modalidad</p>
                  <h3 className="text-base font-bold text-slate-900">
                    {getAttendanceModeLabel(price.attendance_mode, product.edition?.modality, product.prices.length)}
                  </h3>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <CreditCard size={16} />
                </span>
              </div>
              <div className="space-y-3 p-4">
                <div className="rounded-xl bg-slate-950 px-4 py-3 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Precio al contado</p>
                  <p className="mt-1 text-xl font-black">{formatProductCurrency(price.cash_price)}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-100 p-3">
                    <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      <ReceiptText size={11} /> En cuotas
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-800">{formatProductCurrency(price.installment_price)}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 p-3">
                    <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      <Landmark size={11} /> Matrícula
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-800">{formatProductCurrency(price.enrollment_fee)}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="rounded-2xl border-dashed p-6 text-center text-sm text-slate-500">
          No hay precios registrados.
        </Card>
      )}

      {hasDiscount && (
        <div className="flex w-fit items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          <Tag size={14} />
          Descuento vigente: {formatProductCurrency(product.discount_price)}
        </div>
      )}
    </section>
  );
};

export default ProductPricingSummary;
