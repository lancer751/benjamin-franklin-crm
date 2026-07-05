import React from "react";
import { Button } from "@/core/components/ui/button";
import { BookOpen, Plus, User, Calendar, CheckCircle2, Clock } from "lucide-react";
import DetailSection from "../shared/DetailSection";
import InfoField from "../shared/InfoField";
import { cn } from "@/core/lib/utils";
import { translateEnum, EditionStatusMap, ModalityMap } from "@/core/utils/dictionaries";

interface AcademicSectionProps {
  edition: any; 
  formatAttendanceMode: (m: any) => string | undefined; 
  formatDate: (d: any, f?: string) => string | undefined; 
  onAssignClick: () => void;
}

const AcademicSection = ({ 
  edition, 
  formatAttendanceMode, 
  formatDate, 
  onAssignClick 
}: AcademicSectionProps) => {
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

  const hasEditionNumber = edition.edition_number != null;
  const hasStatus = !!edition.edition_status;
  const hasTeacher = !!edition.teacher_fullname;
  const hasModality = !!edition.modality;
  const hasStartDate = !!edition.start_date;
  const hasEndDate = !!edition.end_date;
  const hasDuration = edition.duration_value != null;
  const hasClasses = edition.classes_number != null;
  const hasHours = edition.hours_amount != null;

  const formattedStartDate = formatDate(edition.start_date, "PPP");
  const formattedEndDate = formatDate(edition.end_date, "PPP");

  const showHeaderBlock = hasEditionNumber || hasStatus || hasTeacher || hasModality;
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
          <div className="space-y-6">
            {/* GRID SUPERIOR DE METADATOS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* COLUMNA 1 (Modalidad existente) */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  MODALIDAD DE COHORTE
                </span>
                <span className="text-slate-900 font-semibold text-sm">
                  {translateEnum(edition.modality, ModalityMap)}
                </span>
              </div>

              {/* COLUMNA 2 (Nueva - Número de Edición) */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  NÚMERO DE EDICIÓN
                </span>
                <span className="text-slate-900 font-semibold text-sm block">
                  Edición #{edition.edition_number || 1}
                </span>
              </div>

              {/* COLUMNA 3 (Nueva - Estado de la Edición) */}
              <div className="space-y-1 flex flex-col justify-start">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  ESTADO DE LA EDICIÓN
                </span>
                <div>
                  <span className={cn(
                    "rounded-md px-2.5 py-0.5 text-xs font-semibold inline-block w-fit mt-1 border",
                    edition.edition_status === "OPEN" && "bg-emerald-50 text-emerald-700 border-emerald-100",
                    edition.edition_status === "SCHEDULED" && "bg-sky-50 text-sky-700 border-sky-100",
                    edition.edition_status !== "OPEN" && edition.edition_status !== "SCHEDULED" && "bg-slate-50 text-slate-700 border-slate-100"
                  )}>
                    {translateEnum(edition.edition_status, EditionStatusMap)}
                  </span>
                </div>
              </div>
            </div>

            {/* Profesor Principal (Fila secundaria) */}
            {hasTeacher && (
              <div className="pt-2 border-t border-slate-100">
                <InfoField 
                  label="Profesor Principal" 
                  value={edition.teacher_fullname} 
                  icon={User}
                />
              </div>
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

export default AcademicSection;
