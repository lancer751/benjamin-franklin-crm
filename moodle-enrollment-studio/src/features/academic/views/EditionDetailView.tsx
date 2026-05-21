import { useParams, useNavigate } from 'react-router-dom';
import { useEditionDetail } from '../hooks/useEditionDetail';
import { Button } from '@/core/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/core/components/ui/card';
import { Badge } from '@/core/components/ui/badge';
import { 
  ChevronLeft, Loader2, Calendar, Clock, Video, BookOpen, 
  Users, Link, MessageCircle, MonitorPlay, Layers, Mail, 
  Phone, User, ExternalLink, CalendarDays, CheckCircle, 
  AlertCircle, Sparkles, GraduationCap, Copy, Check 
} from 'lucide-react';
import { displayFriendlyDate } from '@/core/utils/date-utils';
import { translateEnum, EditionStatusMap, DurationUnitMap, ModalityMap } from '@/core/utils/dictionaries';
import { toast } from "sonner";
import { useState } from "react";

// ==========================================
// TRADUCTOR DE DÍAS DE LA SEMANA
// ==========================================
const DAYS_MAP: Record<string, string> = {
  LUNES: "Lunes",
  MARTES: "Martes",
  MIERCOLES: "Miércoles",
  JUEVES: "Jueves",
  VIERNES: "Viernes",
  SABADO: "Sábado",
  DOMINGO: "Domingo"
};

// ==========================================
// COMPONENTES AUXILIARES
// ==========================================

interface DetailSectionProps {
  title: string;
  description?: string;
  icon: React.ComponentType<any>;
  iconBg?: string;
  iconColor?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

const DetailSection = ({ 
  title, 
  description, 
  icon: Icon, 
  iconBg = "bg-primary/10", 
  iconColor = "text-primary", 
  children,
  action
}: DetailSectionProps) => {
  return (
    <Card className="shadow-sm border border-slate-200/80 rounded-2xl overflow-hidden hover:border-slate-300 hover:shadow-md transition-all duration-300 bg-white">
      <div className="bg-slate-50/50 border-b border-slate-100 p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
            <Icon size={16} className={iconColor} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">{title}</h3>
            {description && <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="p-6">
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
  if (value === undefined || value === null || value === "" || value === "No definida" || value === "N/A" || value === "Fecha de fin no definida") return null;

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

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export const EditionDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: response, isLoading, isError } = useEditionDetail(id);
  const [copiedId, setCopiedId] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted-foreground w-full">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Cargando expediente de la edición...</p>
      </div>
    );
  }

  if (isError || !response?.data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-destructive w-full max-w-md mx-auto text-center gap-4">
        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <AlertCircle size={24} />
        </div>
        <div>
          <p className="text-base font-bold text-slate-900">Error al cargar la información</p>
          <p className="text-xs text-slate-500 mt-1">La edición solicitada no pudo ser encontrada o el servidor no respondió correctamente.</p>
        </div>
        <Button variant="outline" className="rounded-xl mt-2" onClick={() => navigate(-1)}>Volver</Button>
      </div>
    );
  }

  const edition = response.data;
  const course = edition.course;

  // Helpers de redirección
  const handleEditRedirect = () => {
    navigate(`/admin/academic/editions/${edition.id}/editar`);
  };

  const handleCopyMoodleId = () => {
    if (edition.moodle_course_id) {
      navigator.clipboard.writeText(String(edition.moodle_course_id));
      setCopiedId(true);
      toast.success("ID de Moodle copiado al portapapeles");
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  // Helper de badges de estado
  const getStatusBadge = (status: string) => {
    const label = translateEnum(status, EditionStatusMap) || status;
    const styles: Record<string, string> = {
      IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50",
      COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50",
      OPEN: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50",
      SCHEDULED: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50",
      DRAFT: "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-50",
      CANCELLED: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-50"
    };
    const style = styles[status] || "bg-slate-50 text-slate-700 border-slate-200";
    return (
      <Badge variant="outline" className={`rounded-xl px-3 py-1 font-bold text-[10px] uppercase tracking-wider ${style}`}>
        {label}
      </Badge>
    );
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
            onClick={() => navigate(-1)}
          >
            <ChevronLeft size={20} className="text-slate-600" />
          </Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {course?.name || "Curso Desconocido"}
              </h1>
              {getStatusBadge(edition.edition_status)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-2 flex-wrap font-medium">
              <span>{edition.edition_name} (Ed. {edition.edition_number})</span>
              <span className="text-slate-300">&bull;</span>
              <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-bold text-[10px]">
                {edition.edition_code || edition.code}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
          <Button 
            variant="outline" 
            className="rounded-xl border-slate-200 hover:bg-slate-50 shadow-sm"
            onClick={() => navigate(-1)}
          >
            Volver
          </Button>
          <Button 
            className="rounded-xl btn-primary gap-2 shadow-md shadow-primary/20"
            onClick={handleEditRedirect}
          >
            Editar Edición
          </Button>
        </div>
      </div>

      {/* DISEÑO EN 2 COLUMNAS (66% / 33%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA (66%) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* CARD 1: INFORMACIÓN GENERAL */}
          <DetailSection 
            title="Información General" 
            description="Información básica de la cohorte y programación académica."
            icon={BookOpen}
            iconBg="bg-primary/10"
            iconColor="text-primary"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <InfoField 
                label="Curso Base" 
                value={course?.name} 
                icon={GraduationCap}
                iconColor="text-primary/70"
              />
              
              {edition.modality && (
                <InfoField 
                  label="Modalidad" 
                  value={translateEnum(edition.modality, ModalityMap)} 
                  icon={MonitorPlay}
                  iconColor="text-indigo-500"
                />
              )}

              {course?.code && (
                <InfoField 
                  label="Código del Curso" 
                  value={course.code} 
                  icon={BookOpen}
                  iconColor="text-slate-400"
                  mono
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 bg-slate-50/40 p-4 rounded-xl border border-slate-200/50">
              {edition.start_date && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                    <Calendar className="text-primary" size={15} />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Fecha Inicio</span>
                    <span className="text-xs font-bold text-slate-700">{displayFriendlyDate(edition.start_date)}</span>
                  </div>
                </div>
              )}
              {edition.end_date && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                    <CheckCircle className="text-slate-400" size={15} />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Fecha Fin</span>
                    <span className="text-xs font-bold text-slate-700">{displayFriendlyDate(edition.end_date)}</span>
                  </div>
                </div>
              )}
            </div>
          </DetailSection>

          {/* CARD 2: CALENDARIO Y HORARIOS */}
          <DetailSection 
            title="Calendario y Horarios" 
            description="Franjas horarias programadas para las clases de esta cohorte."
            icon={CalendarDays}
            iconBg="bg-orange-50"
            iconColor="text-orange-600"
          >
            {edition.schedules && edition.schedules.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {edition.schedules.map((schedule: any, index: number) => {
                  const rawDay = schedule.day_of_week || schedule.day || "";
                  const friendlyDay = DAYS_MAP[rawDay.toUpperCase()] || rawDay;
                  
                  return (
                    <div 
                      key={index}
                      className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/20 hover:border-slate-300 transition-all duration-200 space-y-2.5"
                    >
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                        <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                          {friendlyDay}
                        </span>
                      </div>
                      
                      <div className="space-y-1.5">
                        {schedule.slots && schedule.slots.length > 0 ? (
                          schedule.slots.map((slot: any, sIdx: number) => (
                            <div key={sIdx} className="flex items-center gap-2 text-xs text-slate-600 font-semibold pl-1">
                              <Clock size={12} className="text-slate-400" />
                              <span>{slot.start_time} - {slot.end_time} hrs</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-400 italic pl-1">Sin franja horaria</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl border border-dashed border-slate-200/80 flex flex-col items-center justify-center gap-3 group hover:border-orange-200 transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:scale-110 group-hover:bg-orange-50 group-hover:text-orange-600 transition-all duration-300">
                  <Clock size={22} />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h4 className="text-xs font-bold text-slate-700">Sin Horarios Definidos</h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Esta cohorte no cuenta con horarios específicos. Edita la edición para establecer los días y horas de las clases.
                  </p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="rounded-xl mt-1 text-[11px] font-bold border-slate-200 bg-white hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all duration-200 shadow-xs"
                  onClick={handleEditRedirect}
                >
                  Configurar Horarios
                </Button>
              </div>
            )}
          </DetailSection>

          {/* CARD 3: EQUIPO DOCENTE */}
          <DetailSection 
            title="Profesores y Equipo" 
            description="Docentes asignados para impartir las clases y guiar el curso."
            icon={Users}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
          >
            {edition.assigned_professors && edition.assigned_professors.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {edition.assigned_professors.map((ap: any, index: number) => {
                  const profData = ap.professors || ap.professor || ap;
                  const name = profData.name || "";
                  const lastname = profData.lastname || profData.last_name || "";
                  const fullName = `${name} ${lastname}`.trim() || "Docente sin Nombre";
                  const email = profData.email || "";
                  const corporateEmail = profData.corporate_email || "";
                  const cellphone = profData.cellphone || "";

                  const initials = `${name.charAt(0)}${lastname.charAt(0)}`.toUpperCase();

                  return (
                    <div 
                      key={index}
                      className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/20 hover:border-slate-350 hover:bg-slate-50/40 transition-all duration-200 flex items-start gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 text-sm font-black shadow-inner shrink-0 uppercase">
                        {initials || <User size={16} />}
                      </div>
                      
                      <div className="space-y-2 min-w-0 flex-1">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 truncate leading-tight">
                            {fullName}
                          </h4>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">
                            Profesor Principal
                          </span>
                        </div>

                        <div className="space-y-1 text-[11px] text-slate-600">
                          {corporateEmail && (
                            <a 
                              href={`mailto:${corporateEmail}`}
                              className="flex items-center gap-1.5 hover:text-primary transition-colors truncate font-semibold"
                            >
                              <Mail size={12} className="text-slate-400 shrink-0" />
                              <span className="truncate">{corporateEmail}</span>
                            </a>
                          )}
                          {!corporateEmail && email && (
                            <a 
                              href={`mailto:${email}`}
                              className="flex items-center gap-1.5 hover:text-primary transition-colors truncate"
                            >
                              <Mail size={12} className="text-slate-400 shrink-0" />
                              <span className="truncate">{email}</span>
                            </a>
                          )}
                          {cellphone && (
                            <a 
                              href={`tel:${cellphone}`}
                              className="flex items-center gap-1.5 hover:text-primary transition-colors font-mono"
                            >
                              <Phone size={12} className="text-slate-400 shrink-0" />
                              <span>{cellphone}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl border border-dashed border-slate-200/80 flex flex-col items-center justify-center gap-3 group hover:border-amber-200 transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:scale-110 group-hover:bg-amber-50 group-hover:text-amber-600 transition-all duration-300">
                  <User size={22} />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h4 className="text-xs font-bold text-slate-700">Sin Docente Asignado</h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    No se ha asignado personal docente a esta cohorte. Edita la edición para vincular profesores al programa.
                  </p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="rounded-xl mt-1 text-[11px] font-bold border-slate-200 bg-white hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-all duration-200 shadow-xs"
                  onClick={handleEditRedirect}
                >
                  Asignar Docentes
                </Button>
              </div>
            )}
          </DetailSection>

        </div>

        {/* COLUMNA DERECHA (33% - STICKY) */}
        <div className="space-y-6 lg:h-fit lg:sticky lg:top-4">
          
          {/* ESTRUCTURA Y MÉTRICAS */}
          <Card className="shadow-sm border border-slate-200/80 rounded-2xl overflow-hidden hover:border-slate-300 hover:shadow-md transition-all duration-300 bg-white">
            <div className="bg-slate-50/50 border-b border-slate-100 p-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <Layers size={16} className="text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 tracking-tight">Estructura del Programa</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Carga horaria y duración programada.</p>
                </div>
              </div>
            </div>
            
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                {edition.duration_value && (
                  <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Duración</span>
                    <span className="text-xs font-black text-slate-800">
                      {edition.duration_value} {translateEnum(edition.duration_unit, DurationUnitMap).toLowerCase()}
                    </span>
                  </div>
                )}
                {edition.hours_amount && (
                  <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Horas</span>
                    <span className="text-xs font-black text-slate-800">
                      {edition.hours_amount} hrs
                    </span>
                  </div>
                )}
                {edition.classes_number && (
                  <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Clases</span>
                    <span className="text-xs font-black text-slate-800">
                      {edition.classes_number}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* PLATAFORMA & ENLACES LMS */}
          <Card className="shadow-sm border border-slate-200/80 rounded-2xl overflow-hidden hover:border-slate-300 hover:shadow-md transition-all duration-300 bg-white">
            <div className="bg-slate-50/50 border-b border-slate-100 p-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <Video size={16} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 tracking-tight">Enlaces de Comunicación</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Accesos directos para alumnos y docentes.</p>
                </div>
              </div>
            </div>

            <CardContent className="p-5 space-y-4">
              
              {/* ENLACE DE CLASE */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block pl-1">
                  Enlace de Clase (Meet/Zoom)
                </label>
                {edition.meet_link ? (
                  <a 
                    href={edition.meet_link} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full flex items-center justify-between gap-2 bg-blue-50/60 hover:bg-blue-50 text-blue-700 border border-blue-100 p-3 rounded-xl text-xs font-bold transition-all duration-200 shadow-xs hover:scale-[1.01]"
                  >
                    <span className="flex items-center gap-2">
                      <Video size={14} className="text-blue-500" />
                      Ir a la sala de clases
                    </span>
                    <ExternalLink size={13} className="text-blue-400 shrink-0" />
                  </a>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200/50 rounded-xl text-xs text-slate-400 italic text-center">
                    Enlace no configurado
                  </div>
                )}
              </div>

              {/* GRUPO DE WHATSAPP */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block pl-1">
                  Grupo de WhatsApp
                </label>
                {edition.whatsapp_group_link ? (
                  <a 
                    href={edition.whatsapp_group_link} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full flex items-center justify-between gap-2 bg-emerald-50/60 hover:bg-emerald-50 text-emerald-700 border border-emerald-100 p-3 rounded-xl text-xs font-bold transition-all duration-200 shadow-xs hover:scale-[1.01]"
                  >
                    <span className="flex items-center gap-2">
                      <MessageCircle size={14} className="text-emerald-500" />
                      Unirse al grupo de chat
                    </span>
                    <ExternalLink size={13} className="text-emerald-400 shrink-0" />
                  </a>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200/50 rounded-xl text-xs text-slate-400 italic text-center">
                    Grupo de WhatsApp no enlazado
                  </div>
                )}
              </div>

              {/* ID MOODLE */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block pl-1">
                  Integración LMS (Moodle ID)
                </label>
                {edition.moodle_course_id ? (
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200/60 p-2.5 rounded-xl">
                    <div className="flex items-center gap-2 min-w-0">
                      <MonitorPlay size={14} className="text-indigo-500 shrink-0" />
                      <span className="font-mono text-xs font-black text-slate-800 truncate">
                        ID: {edition.moodle_course_id}
                      </span>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={handleCopyMoodleId} 
                      className="h-7 w-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 shrink-0 text-slate-500"
                    >
                      {copiedId ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </Button>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200/50 rounded-xl text-xs text-slate-400 italic text-center">
                    No vinculado a curso Moodle
                  </div>
                )}
              </div>

            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  );
};

export default EditionDetailView;
