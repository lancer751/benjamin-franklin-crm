import React from "react";
import { Card } from "@/core/components/ui/card";
import { DollarSign, Tag, Calendar, Sparkles, Layers } from "lucide-react";
import PriceCard from "../shared/PriceCard";
import DiscountBadge from "../shared/DiscountBadge";
import { translateEnum, ModalityMap } from "@/core/utils/dictionaries";

interface PricingCardListProps {
  product: any;
  formatCurrency: (amount: any) => string | undefined;
  formatAttendanceMode: (m: any) => string | undefined;
  formatDate: (date: any, format?: string) => string | undefined;
}

const PricingCardList = ({ 
  product, 
  formatCurrency, 
  formatAttendanceMode,
  formatDate
}: PricingCardListProps) => {
  const prices = product.prices || [];
  const hasDiscount = product.discount_price != null && product.discount_price !== "";
  const hasPresale = product.presale_price != null && product.presale_price !== "";
  const hasInstallmentRange = product.installments_min_number != null || product.installments_max_number != null;

  if (prices.length === 0 && !hasDiscount && !hasPresale && !hasInstallmentRange) return null;

  const formattedDiscountPrice = hasDiscount ? formatCurrency(product.discount_price) : undefined;
  const formattedPresalePrice = hasPresale ? formatCurrency(product.presale_price) : undefined;

  return (
    <Card className="shadow-sm border border-slate-200/80 rounded-2xl overflow-hidden hover:border-slate-350 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 bg-white">
      <div className="bg-slate-50/50 border-b border-slate-100 p-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <DollarSign size={16} className="text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">Configuración Comercial</h3>
            <p className="text-[10px] text-slate-500">Estructura de precios y financiamiento.</p>
          </div>
        </div>
      </div>
      <div className="p-5 space-y-6">
        {/* Precios por modalidad */}
        {prices.length > 0 && (
          <div className="space-y-4">
            {prices.map((p: any, idx: number) => {
              const formattedCash = formatCurrency(p.cash_price);
              const formattedEnrollment = formatCurrency(p.enrollment_fee);
              const formattedInstallment = formatCurrency(p.installment_price);

              const rawMode = p.attendance_mode;
              const editionModalityRaw = product.edition?.modality;
              const editionModality = typeof editionModalityRaw === 'object' ? editionModalityRaw.name : editionModalityRaw;

              const resolvedMode = rawMode === "HEREDADO" 
                ? editionModality 
                : rawMode;

              const translatedMode = translateEnum(resolvedMode, ModalityMap);
              const uppercaseMode = (translatedMode || "").toUpperCase();

              return (
                <PriceCard 
                  key={idx}
                  attendanceMode={uppercaseMode}
                  cashPrice={formattedCash}
                  enrollmentFee={formattedEnrollment}
                  installmentPrice={formattedInstallment}
                />
              );
            })}
          </div>
        )}

        {/* Ofertas Especiales / Preventas */}
        {(formattedDiscountPrice || formattedPresalePrice) && (
          <div className="space-y-3 pt-4 border-t border-slate-100">
            {formattedDiscountPrice && formattedDiscountPrice !== "S/ N/A" && formattedDiscountPrice !== "N/A" && (
              <div className="space-y-1.5">
                <DiscountBadge 
                  title="Precio de Descuento"
                  price={formattedDiscountPrice}
                  icon={Tag}
                  bgColor="bg-emerald-50/80"
                  borderColor="border-emerald-100"
                  textColor="text-emerald-700"
                  iconColor="text-emerald-600"
                />
                {product.discount_expires_at && (
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold px-2">
                    <Calendar size={12} className="text-slate-400 shrink-0" />
                    <span>Válido hasta el {formatDate(product.discount_expires_at)}</span>
                  </div>
                )}
              </div>
            )}

            {formattedPresalePrice && formattedPresalePrice !== "S/ N/A" && formattedPresalePrice !== "N/A" && (
              <DiscountBadge 
                title="Precio Preventa"
                price={formattedPresalePrice}
                icon={Sparkles}
                bgColor="bg-amber-50/80"
                borderColor="border-amber-100"
                textColor="text-amber-700"
                iconColor="text-amber-600"
              />
            )}
          </div>
        )}

        {/* Rango de cuotas */}
        {hasInstallmentRange && (
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-1.5 text-slate-400 px-1">
              <Layers size={13} />
              <span className="text-[9px] font-bold uppercase tracking-wider">Financiamiento</span>
            </div>
            <div className="p-4 rounded-xl border border-slate-200/80 hover:border-slate-350 transition-colors duration-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold">Cuotas Disponibles</span>
              <span className="font-black text-slate-900 text-xs">
                {product.installments_min_number != null ? `${product.installments_min_number} - ` : ""}
                {product.installments_max_number != null ? `${product.installments_max_number} Cuotas` : ""}
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PricingCardList;
