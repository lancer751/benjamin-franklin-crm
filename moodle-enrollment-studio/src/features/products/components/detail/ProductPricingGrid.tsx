import { AlertTriangle, BadgeCheck, CalendarDays, CreditCard, Landmark, ReceiptText, Tag } from "lucide-react";
import { Badge } from "@/core/components/ui/badge";
import { Card } from "@/core/components/ui/card";
import type { UIProduct } from "../../types/product.types";
import {
  formatProductCurrency,
  getAttendanceModeLabel,
  getInstallmentRangeLabel,
  getPricingStatusLabel,
} from "../../utils/productDetailPresentation.utils";

interface ProductPricingGridProps {
  product: UIProduct;
  formatDate: (date?: string | null, format?: string) => string;
  compact?: boolean;
}

const ProductPricingGrid = ({ product, formatDate, compact = false }: ProductPricingGridProps) => {
  const discountValue = Number(product.discount_price || 0);
  const hasDiscount = Number.isFinite(discountValue) && discountValue > 0;
  const pricingIsValid = product.pricing_status === "VALID";

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Precios por modalidad</h2>
          <p className="text-xs text-slate-500">Cada modalidad conserva sus propios importes.</p>
        </div>
        <Badge
          variant="outline"
          className={pricingIsValid
            ? "w-fit border-emerald-200 bg-emerald-50 text-emerald-700"
            : "w-fit border-amber-200 bg-amber-50 text-amber-700"}
        >
          {pricingIsValid ? <BadgeCheck size={13} className="mr-1" /> : <AlertTriangle size={13} className="mr-1" />}
          {getPricingStatusLabel(product.pricing_status)}
        </Badge>
      </div>

      {product.prices.length > 0 ? (
        <div className={`grid gap-4 ${product.prices.length > 1 ? "md:grid-cols-2" : "max-w-2xl"}`}>
          {product.prices.map((price, index) => {
            const modeLabel = getAttendanceModeLabel(
              price.attendance_mode,
              product.edition?.modality,
              product.prices.length,
            );

            return (
              <Card key={`${price.attendance_mode}-${index}`} className="overflow-hidden rounded-2xl border-slate-200 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Modalidad</p>
                    <h3 className="mt-0.5 text-lg font-bold text-slate-900">{modeLabel}</h3>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <CreditCard size={18} />
                  </span>
                </div>

                <div className="space-y-4 p-5">
                  <div className="rounded-xl bg-slate-950 p-4 text-white">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pago al contado</p>
                    <p className="mt-1 text-2xl font-black">{formatProductCurrency(price.cash_price)}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-100 p-3">
                      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        <Landmark size={12} /> Matrícula
                      </p>
                      <p className="mt-1.5 text-base font-bold text-slate-800">{formatProductCurrency(price.enrollment_fee)}</p>
                    </div>
                    <div className="rounded-xl border border-slate-100 p-3">
                      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        <ReceiptText size={12} /> Pago en cuotas
                      </p>
                      <p className="mt-1.5 text-base font-bold text-slate-800">{formatProductCurrency(price.installment_price)}</p>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-slate-500">
                    Cuotas disponibles:{" "}
                    <span className="font-bold text-slate-800">
                      {getInstallmentRangeLabel(product.installments_min_number, product.installments_max_number)}
                    </span>
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="rounded-2xl border-dashed p-8 text-center text-sm text-slate-500">
          No hay precios registrados para este producto.
        </Card>
      )}

      {!compact && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="flex items-center gap-2 text-xs font-semibold text-slate-500"><Tag size={14} /> Descuento</p>
            <p className="mt-2 text-sm font-bold text-slate-900">{hasDiscount ? formatProductCurrency(product.discount_price) : "Sin descuento"}</p>
            {hasDiscount && product.discount_expires_at && (
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                <CalendarDays size={12} /> Vigente hasta {formatDate(product.discount_expires_at)}
              </p>
            )}
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold text-slate-500">Precio de preventa</p>
            <p className="mt-2 text-sm font-bold text-slate-900">
              {Number(product.presale_price || 0) > 0 ? formatProductCurrency(product.presale_price) : "No configurado"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold text-slate-500">Rango de financiamiento</p>
            <p className="mt-2 text-sm font-bold text-slate-900">
              {getInstallmentRangeLabel(product.installments_min_number, product.installments_max_number)}
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductPricingGrid;
