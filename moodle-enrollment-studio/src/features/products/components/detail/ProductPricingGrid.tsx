import { AlertTriangle, BadgeCheck, CalendarDays, CreditCard, Tag } from "lucide-react";
import { Badge } from "@/core/components/ui/badge";
import { Card } from "@/core/components/ui/card";
import type { UIProduct } from "../../types/product.types";
import {
  formatProductCurrency,
  getInstallmentRangeLabel,
  getPricingStatusLabel,
} from "../../utils/productDetailPresentation.utils";
import ProductPriceSummaryCard from "./ProductPriceSummaryCard";

interface ProductPricingGridProps {
  product: UIProduct;
  formatDate: (date?: string | null, format?: string) => string;
  showDetails?: boolean;
}

const ProductPricingGrid = ({
  product,
  formatDate,
  showDetails = true,
}: ProductPricingGridProps) => {
  const discount = Number(product.discount_price || 0);
  const presale = Number(product.presale_price || 0);
  const hasDiscount = Number.isFinite(discount) && discount > 0;
  const hasPresale = Number.isFinite(presale) && presale > 0;
  const pricingIsValid = product.pricing_status === "VALID";
  const installmentRange = getInstallmentRangeLabel(
    product.installments_min_number,
    product.installments_max_number,
  );
  const gridClassName = product.prices.length === 1
    ? "grid max-w-3xl grid-cols-1 gap-4"
    : product.prices.length === 2
      ? "grid gap-4 md:grid-cols-2"
      : "grid gap-4 md:grid-cols-2 xl:grid-cols-3";

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Precios y modalidades</h2>
          <p className="mt-0.5 text-xs text-slate-500">Compara los importes disponibles para cada modalidad.</p>
        </div>
        {showDetails && (
          <Badge
            variant="outline"
            className={pricingIsValid
              ? "w-fit border-emerald-200 bg-emerald-50 text-emerald-700"
              : "w-fit border-amber-200 bg-amber-50 text-amber-700"}
          >
            {pricingIsValid
              ? <BadgeCheck size={13} className="mr-1" />
              : <AlertTriangle size={13} className="mr-1" />}
            {getPricingStatusLabel(product.pricing_status)}
          </Badge>
        )}
      </div>

      {product.prices.length > 0 ? (
        <div className={gridClassName}>
          {product.prices.map((price, index) => (
            <ProductPriceSummaryCard
              key={`${price.attendance_mode}-${index}`}
              price={price}
              editionModality={product.edition?.modality}
              priceCount={product.prices.length}
              installmentRange={installmentRange}
              enrollmentFee={product.enrollment_fee}
            />
          ))}
        </div>
      ) : (
        <Card className="rounded-2xl border-dashed p-6 text-center text-sm text-slate-500">
          No hay precios registrados.
        </Card>
      )}

      {showDetails && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Tag size={14} /> Descuento
            </p>
            <p className="mt-2 text-sm font-bold text-slate-900">
              {hasDiscount ? formatProductCurrency(product.discount_price) : "Sin descuento"}
            </p>
            {hasDiscount && product.discount_expires_at && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                <CalendarDays size={12} />
                Vigente hasta {formatDate(product.discount_expires_at)}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold text-slate-500">Precio de preventa</p>
            <p className="mt-2 text-sm font-bold text-slate-900">
              {hasPresale ? formatProductCurrency(product.presale_price) : "No configurado"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <CreditCard size={14} /> Rango de financiamiento
            </p>
            <p className="mt-2 text-sm font-bold text-slate-900">{installmentRange}</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductPricingGrid;
