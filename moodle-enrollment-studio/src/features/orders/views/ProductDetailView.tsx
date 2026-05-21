import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProductDetail } from "../hooks/useProductDetail";
import { getCourseEditions } from "@/features/academic/services/courseService";
import { updateProduct } from "../services/productService";
import ProductStatusBadge from "@/features/orders/components/ProductStatusBadge";
import { toast } from "sonner";
import { 
  ArrowLeft, Edit, Loader2, Tag, BookOpen, DollarSign, 
  Calendar, Clock, User, Layers, Info, CheckCircle2,
  Gift, Award, Sparkles, Plus, ImageIcon, Search, Check, X
} from "lucide-react";
import { Card } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import { Input } from "@/core/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/core/components/ui/dialog";
import { cn } from "@/core/lib/utils";

// ==========================================
// SUBCOMPONENTES AUXILIARES
// ==========================================

interface DetailSectionProps {
  title: string;
  description?: string;
  icon: React.ComponentType<any>;
  iconBg?: string;
  iconColor?: string;
  children: React.ReactNode;
}

const DetailSection = ({ 
  title, 
  description, 
  icon: Icon, 
  iconBg = "bg-primary/10", 
  iconColor = "text-primary", 
  children 
}: DetailSectionProps) => {
  return (
    <Card className="shadow-sm border border-slate-200/80 rounded-2xl overflow-hidden hover:border-slate-350 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 bg-white">
      <div className="bg-slate-50/50 border-b border-slate-100 p-5">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
            <Icon size={16} className={iconColor} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">{title}</h3>
            {description && <p className="text-[11px] text-slate-500">{description}</p>}
          </div>
        </div>
      </div>
      <div className="p-6 space-y-6">
        {children}
      </div>
    </Card>
  );
};

interface InfoFieldProps {
  label: string;
  value?: string | number | null;
  icon?: React.ComponentType<any>;
  iconColor?: string;
  mono?: boolean;
}

const InfoField = ({ 
  label, 
  value, 
  icon: Icon, 
  iconColor = "text-slate-400", 
  mono = false 
}: InfoFieldProps) => {
  // Strict conditional rendering: if raw value is not defined or is null, do not render label nor value.
  if (value === undefined || value === null || value === "" || value === "No definida" || value === "N/A" || value === "Fecha inválida") return null;

  return (
    <div className="space-y-1">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{label}</span>
      <div className="flex items-center gap-1.5 pt-0.5">
        {Icon && <Icon size={14} className={`${iconColor} shrink-0`} />}
        <span className={`text-xs font-semibold text-slate-800 ${mono ? 'font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-600 font-bold' : ''}`}>
          {value}
        </span>
      </div>
    </div>
  );
};

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

interface PriceCardProps {
  attendanceMode?: string;
  cashPrice?: string;
  enrollmentFee?: string;
  installmentPrice?: string;
}

const PriceCard = ({ 
  attendanceMode, 
  cashPrice, 
  enrollmentFee, 
  installmentPrice 
}: PriceCardProps) => {
  return (
    <div className="p-4 rounded-xl border border-slate-200/85 bg-slate-50/45 hover:border-slate-350 hover:bg-slate-50/70 transition-all duration-200 space-y-3">
      {attendanceMode && (
        <div className="flex items-center gap-2 border-b border-slate-200/50 pb-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
            Modalidad {attendanceMode}
          </span>
        </div>
      )}
      
      <div className="grid gap-2">
        {enrollmentFee && enrollmentFee !== "S/ N/A" && enrollmentFee !== "N/A" && (
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Matrícula</span>
            <span className="font-bold text-slate-800">{enrollmentFee}</span>
          </div>
        )}
        {cashPrice && cashPrice !== "S/ N/A" && cashPrice !== "N/A" && (
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Contado</span>
            <span className="font-black text-emerald-600 text-sm">{cashPrice}</span>
          </div>
        )}
        {installmentPrice && installmentPrice !== "S/ N/A" && installmentPrice !== "N/A" && (
          <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200/60 border-dashed">
            <span className="text-slate-500 font-medium">En Cuotas</span>
            <span className="font-bold text-slate-800">{installmentPrice}</span>
          </div>
        )}
      </div>
    </div>
  );
};

interface DiscountBadgeProps {
  title: string;
  price: string;
  icon: React.ComponentType<any>;
  bgColor: string;
  borderColor: string;
  textColor: string;
  iconColor: string;
}

const DiscountBadge = ({ 
  title, 
  price, 
  icon: Icon, 
  bgColor, 
  borderColor, 
  textColor, 
  iconColor 
}: DiscountBadgeProps) => {
  return (
    <div className={`${bgColor} p-4.5 rounded-xl border ${borderColor} flex items-center justify-between transition-all duration-200 hover:scale-[1.02] shadow-xs`}>
      <div className="flex items-center gap-2">
        <Icon size={14} className={iconColor} />
        <span className={`text-[9px] font-bold uppercase tracking-wider ${textColor}`}>{title}</span>
      </div>
      <span className={`font-black text-xs ${textColor}`}>{price}</span>
    </div>
  );
};

// ==========================================
// MODAL DE ASIGNACIÓN / VINCULACIÓN
// ==========================================

interface LinkEditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLink: (editionId: string) => void;
  isPending: boolean;
}

const LinkEditionModal = ({ isOpen, onClose, onLink, isPending }: LinkEditionModalProps) => {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: editionsRes, isLoading } = useQuery({
    queryKey: ["course-editions"],
    queryFn: getCourseEditions,
    enabled: isOpen,
  });

  const editions = editionsRes?.success ? editionsRes.data : [];

  const filteredEditions = editions.filter((e: any) => {
    const code = (e.edition_code || "").toLowerCase();
    const teacher = (e.teacher_fullname || "").toLowerCase();
    const modality = (e.modality || "").toLowerCase();
    return code.includes(search.toLowerCase()) || teacher.includes(search.toLowerCase()) || modality.includes(search.toLowerCase());
  });

  const handleSave = () => {
    if (selectedId) {
      onLink(selectedId);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg rounded-2xl p-6 gap-4">
        <DialogHeader>
          <DialogTitle className="text-slate-900 font-bold">Vincular Edición Académica</DialogTitle>
          <DialogDescription className="text-slate-500 text-xs">
            Selecciona la edición o cohorte activa para vincularla a este producto comercial y heredar su calendario académico.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Buscar por código, profesor o modalidad..." 
            className="pl-9 rounded-xl text-xs bg-slate-50/50 border-slate-200" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="max-h-[300px] overflow-y-auto pr-1 space-y-2 py-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-xs gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span>Cargando cohortes disponibles...</span>
            </div>
          ) : filteredEditions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No se encontraron ediciones que coincidan con la búsqueda.
            </div>
          ) : (
            filteredEditions.map((e: any) => {
              const isSelected = selectedId === e.id;
              return (
                <div 
                  key={e.id}
                  onClick={() => setSelectedId(e.id)}
                  className={cn(
                    "p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between text-xs",
                    isSelected 
                      ? "border-primary bg-primary/5 text-primary shadow-xs" 
                      : "border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700"
                  )}
                >
                  <div className="space-y-1">
                    <p className="font-bold font-mono text-slate-900">{e.edition_code || "Sin Código"}</p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Profesor: <span className="font-semibold text-slate-700">{e.teacher_fullname || "Por asignar"}</span> • Modalidad: <span className="font-semibold text-slate-700">{e.modality}</span>
                    </p>
                  </div>
                  {isSelected && <Check size={16} className="text-primary" />}
                </div>
              );
            })
          )}
        </div>

        <DialogFooter className="flex sm:justify-end gap-2 pt-2 border-t border-slate-100">
          <Button variant="outline" className="rounded-xl text-xs" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button 
            className="rounded-xl text-xs btn-primary gap-1.5 shadow-md shadow-primary/10" 
            onClick={handleSave}
            disabled={!selectedId || isPending}
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Vincular Edición
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ==========================================
// SECCIONES DE DETALLE
// ==========================================

const CommercialSection = ({ product }: { product: any }) => {
  const hasShortDesc = !!product.short_description;
  const hasDesc = !!product.description;

  if (!hasShortDesc && !hasDesc) return null;

  return (
    <DetailSection 
      title="Información Comercial" 
      description="Propuesta de marketing y descripción orientada al alumno."
      icon={Tag}
      iconBg="bg-primary/10"
      iconColor="text-primary"
    >
      <div className="space-y-6">
        {hasShortDesc && (
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Resumen Comercial</span>
            <p className="text-base text-slate-600 font-medium leading-relaxed italic border-l-3 border-primary/25 pl-4 py-0.5">
              "{product.short_description}"
            </p>
          </div>
        )}

        {hasDesc && (
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Detalle Completo</span>
            <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50/30 p-5 rounded-xl border border-slate-200/50">
              {product.description}
            </div>
          </div>
        )}
      </div>
    </DetailSection>
  );
};

const AcademicSection = ({ 
  edition, 
  formatAttendanceMode, 
  formatDate, 
  onAssignClick 
}: { 
  edition: any; 
  formatAttendanceMode: (m: any) => string | undefined; 
  formatDate: (d: any, f?: string) => string | undefined; 
  onAssignClick: () => void;
}) => {
  if (!edition) {
    return (
      <div className="p-8 text-center bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl border border-dashed border-slate-200/80 flex flex-col items-center justify-center gap-3 group hover:border-primary/40 transition-all duration-300 hover:shadow-xs">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
          <BookOpen size={22} />
        </div>
        <div className="space-y-1 max-w-sm">
          <h4 className="text-xs font-bold text-slate-700">Vínculo Académico Pendiente</h4>
          <p className="text-[11px] text-slate-400 leading-normal">
            Este producto comercial no cuenta con un vínculo a cohorte académica. Asigna una edición para programar docentes y calendarios.
          </p>
        </div>
        <Button 
          size="sm" 
          variant="outline" 
          className="rounded-xl mt-1 text-[11px] font-bold border-slate-200 bg-white hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all duration-200 shadow-sm"
          onClick={onAssignClick}
        >
          <Plus size={12} className="mr-1" /> Asignar Edición
        </Button>
      </div>
    );
  }

  const hasCode = !!edition.edition_code;
  const hasTeacher = !!edition.teacher_fullname;
  const hasModality = !!edition.modality;
  const hasStartDate = !!edition.start_date;
  const hasEndDate = !!edition.end_date;
  const hasDuration = edition.duration_value != null;
  const hasClasses = edition.classes_number != null;
  const hasHours = edition.hours_amount != null;

  const formattedModality = formatAttendanceMode(edition.modality);
  const formattedStartDate = formatDate(edition.start_date, "PPP");
  const formattedEndDate = formatDate(edition.end_date, "PPP");

  const showHeaderBlock = hasCode || hasTeacher || hasModality;
  const showDateBlock = (hasStartDate && formattedStartDate && formattedStartDate !== "No definida") || (hasEndDate && formattedEndDate && formattedEndDate !== "No definida");
  const showDurationBlock = hasDuration || hasClasses || hasHours;

  return (
    <DetailSection 
      title="Vínculo Académico & Cohorte" 
      description="Configuración del programa, fechas límite y asignación de profesores."
      icon={BookOpen}
      iconBg="bg-orange-50"
      iconColor="text-orange-600"
    >
      <div className="space-y-6">
        {showHeaderBlock && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {hasCode && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Código Cohorte</span>
                <p className="font-mono font-bold text-slate-900 text-xs bg-slate-100 px-2 py-1 rounded inline-block">
                  {edition.edition_code}
                </p>
              </div>
            )}

            {hasTeacher && (
              <InfoField 
                label="Profesor Principal" 
                value={edition.teacher_fullname} 
                icon={User}
              />
            )}

            {hasModality && (
              <InfoField 
                label="Modalidad de Cohorte" 
                value={formattedModality} 
              />
            )}
          </div>
        )}

        {showDateBlock && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/40 p-4 rounded-xl border border-slate-200/50">
            {hasStartDate && formattedStartDate && formattedStartDate !== "No definida" && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                  <Calendar className="text-primary" size={15} />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Fecha Inicio</span>
                  <span className="text-xs font-bold text-slate-700">{formattedStartDate}</span>
                </div>
              </div>
            )}
            {hasEndDate && formattedEndDate && formattedEndDate !== "No definida" && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="text-slate-400" size={15} />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Fecha Fin Estimada</span>
                  <span className="text-xs font-bold text-slate-700">{formattedEndDate}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {showDurationBlock && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            {hasDuration && (
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Duración del Programa</span>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-800">
                    {edition.duration_value} {edition.duration_unit === "WEEKS" ? "Semanas" : "Meses"}
                  </span>
                </div>
              </div>
            )}
            {(hasClasses || hasHours) && (
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Carga de Clases</span>
                <span className="text-xs font-medium text-slate-700">
                  {hasClasses && <><span className="font-bold text-slate-900">{edition.classes_number}</span> clases</>}
                  {hasClasses && hasHours && <> • </>}
                  {hasHours && <><span className="font-bold text-slate-900">{edition.hours_amount}</span> horas totales</>}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </DetailSection>
  );
};

const BenefitsAndCertificationsSection = ({ product }: { product: any }) => {
  const benefits = product.relatedBenefits || [];
  const certifications = product.relatedCertifications || [];

  if (benefits.length === 0 && certifications.length === 0) return null;

  return (
    <DetailSection 
      title="Beneficios & Certificaciones" 
      description="Regalos comerciales y diplomas certificados asociados al producto."
      icon={Award}
      iconBg="bg-amber-50"
      iconColor="text-amber-600"
    >
      <div className="space-y-6">
        {benefits.length > 0 && (
          <div>
            <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Gift size={13} className="text-primary" /> Beneficios Adicionales
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {benefits.map((rb: any, idx: number) => (
                <BenefitBadgeItem key={idx} rb={rb} />
              ))}
            </div>
          </div>
        )}

        {certifications.length > 0 && (
          <div className={cn(benefits.length > 0 && "pt-4 border-t border-slate-100")}>
            <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Award size={13} className="text-amber-600" /> Certificaciones Otorgadas
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {certifications.map((rc: any, idx: number) => {
                const title = rc.certification?.title;
                const id = rc.certification_id;
                const description = rc.certification?.description;
                const hasDigital = rc.certification?.has_digital;
                const hasPhysical = rc.certification?.has_physical;

                return (
                  <div key={idx} className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/30 hover:border-slate-350 hover:bg-slate-50/50 transition-all duration-200 space-y-2">
                    {title ? (
                      <span className="text-xs font-bold text-slate-800 block leading-tight">{title}</span>
                    ) : (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold text-slate-600">Certificación</span>
                        <Badge variant="outline" className="rounded-lg px-2 py-0.5 bg-slate-100 text-slate-600 border-slate-200 font-mono text-[9px] font-bold">
                          ID: {id ? `${id.substring(0, 8)}...` : 'S/I'}
                        </Badge>
                      </div>
                    )}
                    {description && (
                      <span className="text-[10px] text-slate-500 block leading-normal">{description}</span>
                    )}
                    {(hasDigital || hasPhysical) && (
                      <div className="flex gap-1.5 flex-wrap">
                        {hasDigital && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-50/60 text-blue-700 text-[9px] font-bold border border-blue-100">Digital</span>
                        )}
                        {hasPhysical && (
                          <span className="px-1.5 py-0.5 rounded bg-purple-50/60 text-purple-700 text-[9px] font-bold border border-purple-100">Físico</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DetailSection>
  );
};

const PricingCardList = ({ 
  product, 
  formatCurrency, 
  formatAttendanceMode,
  formatDate
}: { 
  product: any;
  formatCurrency: (amount: any) => string | undefined;
  formatAttendanceMode: (m: any) => string | undefined;
  formatDate: (date: any, format?: string) => string | undefined;
}) => {
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
              const formattedMode = formatAttendanceMode(p.attendance_mode);

              return (
                <PriceCard 
                  key={idx}
                  attendanceMode={formattedMode}
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

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

const ProductDetailView = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { product, isLoading, isError, actions } = useProductDetail();
  const { formatCurrency, formatDate, formatAttendanceMode, modalMode, setModalMode } = actions;



  // Mutación para vincular edición
  const linkMutation = useMutation({
    mutationFn: async (editionId: string) => {
      if (!product) throw new Error("No hay producto seleccionado");

      const parsedPayload = {
        name: product.name,
        slug: product.slug || "",
        category_id: product.category?.id || "",
        sales_status: product.sales_status,
        short_description: product.short_description || "",
        description: product.description || "",
        presale_price: product.presale_price != null ? String(product.presale_price) : "",
        discount_price: product.discount_price != null ? String(product.discount_price) : "",
        installments_min_number: product.installments_min_number || 1,
        installments_max_number: product.installments_max_number || 1,
        image_url: product.image_url || "",
        edition_id: editionId,
        prices: product.prices?.map((p: any) => ({
          attendance_mode: p.attendance_mode,
          cash_price: Number(p.cash_price),
          installment_price: Number(p.installment_price),
          enrollment_fee: Number(p.enrollment_fee),
        })) || [],
        benefit_ids: product.relatedBenefits?.map((rb: any) => rb.benefit_id) || [],
        faqs: product.frequentQuestions?.map((fq: any) => fq.faq_id || fq.id) || [],
        certifications: product.relatedCertifications?.map((rc: any) => rc.certification_id) || [],
      };
      return await updateProduct(product.id, parsedPayload as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product", product?.id] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Edición académica vinculada exitosamente");
      setModalMode(null);
    },
    onError: (err) => {
      console.error(err);
      toast.error("Error al vincular la edición académica");
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted-foreground w-full">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Cargando detalles del producto...</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-destructive w-full max-w-md mx-auto text-center gap-4">
        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <Info size={24} />
        </div>
        <div>
          <p className="text-base font-bold text-slate-900">Error al cargar la información</p>
          <p className="text-xs text-slate-500 mt-1">El producto comercial solicitado no pudo ser encontrado o el servidor no respondió correctamente.</p>
        </div>
        <Button variant="outline" className="rounded-xl mt-2" onClick={() => navigate(-1)}>Volver</Button>
      </div>
    );
  }

  const handleEditRedirect = () => {
    navigate(`/productos/${product.id}/editar`);
  };

  const handleLinkEdition = (editionId: string) => {
    linkMutation.mutate(editionId);
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      
      {/* HEADER SUPERIOR */}
      <div className="pt-2 mb-6 border-b border-slate-200/80 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-xl bg-white border border-slate-200 hover:bg-slate-50 shadow-sm shrink-0"
            onClick={() => navigate("/productos")}
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {product.name}
              </h1>
              <ProductStatusBadge status={product.sales_status} />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              ID Comercial: <span className="font-mono text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-bold">{product.id}</span>
              {product.category?.name && (
                <> • Categoría: <span className="font-bold text-slate-700">{product.category.name}</span></>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
          <Button 
            variant="outline" 
            className="rounded-xl border-slate-200 hover:bg-slate-50 shadow-sm"
            onClick={() => navigate("/productos")}
          >
            Volver al catálogo
          </Button>
          <Button 
            className="rounded-xl btn-primary gap-2 shadow-md shadow-primary/20"
            onClick={handleEditRedirect}
          >
            <Edit size={16} /> Editar Producto
          </Button>
        </div>
      </div>

      {/* DISEÑO EN 2 COLUMNAS (66% / 33%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA (66%) */}
        <div className="lg:col-span-2 space-y-6">
          <CommercialSection product={product} />
          
          <AcademicSection 
            edition={product.edition} 
            formatAttendanceMode={formatAttendanceMode} 
            formatDate={formatDate}
            onAssignClick={() => setModalMode('LINK')} 
          />
          
          <BenefitsAndCertificationsSection product={product} />
        </div>

        {/* COLUMNA DERECHA (33% - STICKY) */}
        <div className="space-y-6 lg:h-fit lg:sticky lg:top-4">
          
          {/* PORTADA COMERCIAL (Condicional estricto) */}
          {product.image_url && (
            <Card className="shadow-sm border border-slate-200/80 rounded-2xl overflow-hidden hover:border-slate-350 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 bg-white">
              <div className="bg-slate-50/50 border-b border-slate-100 p-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Portada Comercial</span>
              </div>
              <div className="p-4">
                <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center group shadow-inner">
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                </div>
              </div>
            </Card>
          )}

          {/* CONFIGURACIÓN DE PRECIOS */}
          <PricingCardList 
            product={product} 
            formatCurrency={formatCurrency} 
            formatAttendanceMode={formatAttendanceMode}
            formatDate={formatDate}
          />

        </div>

      </div>

      {/* MODAL DE VINCULACIÓN ACADÉMICA */}
      <LinkEditionModal 
        isOpen={modalMode === 'LINK'}
        onClose={() => setModalMode(null)}
        onLink={handleLinkEdition}
        isPending={linkMutation.isPending}
      />
    </div>
  );
};

export default ProductDetailView;