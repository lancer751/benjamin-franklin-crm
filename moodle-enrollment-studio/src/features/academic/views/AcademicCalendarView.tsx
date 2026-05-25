import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/core/components/ui/card';
import { Input } from '@/core/components/ui/input';
import { Button } from '@/core/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/core/components/ui/avatar';
import { Badge } from '@/core/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/core/components/ui/toggle-group';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/core/components/ui/hover-card';
import { Progress } from '@/core/components/ui/progress';
import { useAcademicCalendarView } from '../hooks/useAcademicCalendarView';
import { formatToLocalTime, displayFriendlyDate, formatFriendlySpanishDate } from '@/core/utils/date-utils';

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-emerald-100 text-emerald-800 border-l-4 border-emerald-500';
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-800 border-l-4 border-blue-500';
    case 'OPEN':
    case 'SCHEDULED':
      return 'bg-amber-100 text-amber-800 border-l-4 border-amber-500';
    case 'SCHEDULED_GRAY':
      return 'bg-slate-100 text-slate-700 border-l-4 border-slate-400';
    default:
      return 'bg-gray-100 text-gray-800 border-l-4 border-gray-400';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'COMPLETED': return 'Completado';
    case 'IN_PROGRESS': return 'En Progreso';
    case 'OPEN': return 'Programado';
    case 'SCHEDULED': return 'Programado';
    case 'SCHEDULED_GRAY': return 'Programado';
    default: return status;
  }
};

export const AcademicCalendarView = () => {
  const navigate = useNavigate();
  const { editions: rawEditions, isLoading } = useAcademicCalendarView();
  const editions = rawEditions ?? [];
  const [viewMode, setViewMode] = useState<"Mes" | "Semestre" | "Año">("Año");

  const [referenceDate, setReferenceDate] = useState(new Date());
  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth(); // 0-11
  const currentSemester = currentMonth < 6 ? 1 : 2;

  const handlePrev = () => {
    setReferenceDate(prev => {
      const newDate = new Date(prev);
      if (viewMode === 'Mes') newDate.setMonth(newDate.getMonth() - 1);
      else if (viewMode === 'Semestre') newDate.setMonth(newDate.getMonth() - 6);
      else if (viewMode === 'Año') newDate.setFullYear(newDate.getFullYear() - 1);
      return newDate;
    });
  };

  const handleNext = () => {
    setReferenceDate(prev => {
      const newDate = new Date(prev);
      if (viewMode === 'Mes') newDate.setMonth(newDate.getMonth() + 1);
      else if (viewMode === 'Semestre') newDate.setMonth(newDate.getMonth() + 6);
      else if (viewMode === 'Año') newDate.setFullYear(newDate.getFullYear() + 1);
      return newDate;
    });
  };

  const handleToday = () => {
    setReferenceDate(new Date());
  };

  const getDynamicLabel = () => {
    if (viewMode === 'Mes') {
      return referenceDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
    }
    if (viewMode === 'Semestre') {
      const semStr = currentSemester === 1 ? 'Ene - Jun' : 'Jul - Dic';
      return `${semStr} ${currentYear}`;
    }
    if (viewMode === 'Año') {
      return `Año ${currentYear}`;
    }
    return '';
  };

  const isWeekend = (dayNumber: number) => {
    const date = new Date(currentYear, currentMonth, dayNumber);
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();

  const timelineHeaders = useMemo(() => {
    if (viewMode === 'Año') {
      return ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    }
    if (viewMode === 'Semestre') {
      return currentSemester === 1 
        ? ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'] 
        : ['Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    }
    if (viewMode === 'Mes') {
      const days = getDaysInMonth(currentMonth, currentYear);
      return Array.from({ length: days }, (_, i) => (i + 1).toString());
    }
    return [];
  }, [viewMode, currentMonth, currentYear, currentSemester]);

  const viewRange = useMemo(() => {
    if (viewMode === 'Año') {
      return {
        start: new Date(currentYear, 0, 1).getTime(),
        end: new Date(currentYear, 11, 31, 23, 59, 59).getTime(),
      };
    }
    if (viewMode === 'Semestre') {
      const startMonth = currentSemester === 1 ? 0 : 6;
      const endMonth = currentSemester === 1 ? 5 : 11;
      return {
        start: new Date(currentYear, startMonth, 1).getTime(),
        end: new Date(currentYear, endMonth, getDaysInMonth(endMonth, currentYear), 23, 59, 59).getTime(),
      };
    }
    if (viewMode === 'Mes') {
      return {
        start: new Date(currentYear, currentMonth, 1).getTime(),
        end: new Date(currentYear, currentMonth, getDaysInMonth(currentMonth, currentYear), 23, 59, 59).getTime(),
      };
    }
    return { start: 0, end: 0 };
  }, [viewMode, currentMonth, currentYear, currentSemester]);

  const getBarPosition = (startDateStr: string, endDateStr: string) => {
    const { start: viewStart, end: viewEnd } = viewRange;
    const viewDuration = viewEnd - viewStart;

    const localStartDate = formatToLocalTime(startDateStr);
    const localEndDate = formatToLocalTime(endDateStr);

    const itemStart = localStartDate.setHours(0, 0, 0, 0);
    const itemEnd = localEndDate.setHours(23, 59, 59, 999);

    // Out of bounds
    if (itemEnd < viewStart || itemStart > viewEnd) return { display: 'none' };

    const clampedStart = Math.max(itemStart, viewStart);
    const clampedEnd = Math.min(itemEnd, viewEnd);

    const leftPct = ((clampedStart - viewStart) / viewDuration) * 100;
    const widthPct = ((clampedEnd - clampedStart) / viewDuration) * 100;

    return {
      left: `${leftPct}%`,
      width: `${Math.max(widthPct, 1)}%`, // Ensure at least 1% width
    };
  };

  const getTodayMarkerPosition = () => {
    const { start: viewStart, end: viewEnd } = viewRange;
    const viewDuration = viewEnd - viewStart;
    const today = new Date().getTime();

    if (today < viewStart || today > viewEnd) return { display: 'none' };

    const leftPct = ((today - viewStart) / viewDuration) * 100;
    return { left: `${leftPct}%` };
  };

  // --- CONSOLIDACIÓN DE FILAS (Stacking Logic) ---
  const groupedCourses = useMemo(() => {
    const coursesMap = new Map();

    // 1. Filtrar ediciones visibles y adjuntar su posición
    const visiblePositions = (editions ?? []).map(ed => {
      const pos = getBarPosition(ed?.start_date, ed?.end_date);
      return { ...ed, pos };
    }).filter(ed => ed?.pos?.display !== 'none');

    // 2. Agrupar por curso
    visiblePositions.forEach(ed => {
      if (ed?.course_id) {
        if (!coursesMap.has(ed.course_id)) {
          coursesMap.set(ed.course_id, {
            course_id: ed.course_id,
            course_name: ed.course_name,
            course_type: ed.course_type,
            editions: []
          });
        }
        coursesMap.get(ed.course_id).editions.push(ed);
      }
    });

    // 3. Calcular "Stacking" (niveles) por cada curso para evitar superposición
    const result = Array.from(coursesMap.values()).map(course => {
      // Ordenar por fecha de inicio para acomodar secuencialmente
      const sorted = [...(course?.editions ?? [])].sort((a, b) => {
        const startA = a?.start_date ? new Date(a.start_date).getTime() : 0;
        const startB = b?.start_date ? new Date(b.start_date).getTime() : 0;
        return startA - startB;
      });
      
      const levelEnds: number[] = [];
      
      sorted.forEach(ed => {
        const startMs = ed?.start_date ? new Date(ed.start_date).getTime() : 0;
        const endMs = ed?.end_date ? new Date(ed.end_date).getTime() : 0;
        let assignedLevel = -1;
        
        for (let i = 0; i < levelEnds.length; i++) {
          // Si la edición empieza después o igual de cuando termina la anterior en este nivel, encaja.
          if (startMs >= levelEnds[i]) {
            assignedLevel = i;
            levelEnds[i] = endMs;
            break;
          }
        }
        
        if (assignedLevel === -1) {
          // No encaja en ningún nivel existente, crear nuevo nivel
          assignedLevel = levelEnds.length;
          levelEnds.push(endMs);
        }
        
        if (ed) {
          ed.level = assignedLevel;
        }
      });
      
      course.maxLevel = levelEnds.length > 0 ? levelEnds.length - 1 : 0;
      return course;
    });

    return result;
  }, [viewRange, editions]);

  // Variables para Stacking UI
  const isMonthView = viewMode === 'Mes';
  const barHeight = isMonthView ? 36 : 24; // Más alta en Mes, más limpia en Año/Semestre
  const barGap = 6;
  const step = barHeight + barGap;
  const topPadding = 16;

  // KPI Calculations
  const visibleEditionsCount = groupedCourses.reduce((acc, course) => acc + (course?.editions?.length ?? 0), 0);
  
  // 1. Variable 'Total Ediciones'
  const totalEditions = editions?.length ?? 0;
  const totalEditionsFormatted = totalEditions < 10 ? `0${totalEditions}` : `${totalEditions}`;

  // 2. Variable 'En Progreso'
  const inProgressCount = editions?.filter(ed => ed?.edition_status === 'IN_PROGRESS')?.length ?? 0;
  const inProgressFormatted = inProgressCount < 10 ? `0${inProgressCount}` : `${inProgressCount}`;

  // 3. Variable 'Tasa de Ocupación'
  const occupancyRate = totalEditions > 0 
    ? Math.round((editions?.filter(e => (e?.assigned_professors?.length ?? 0) > 0)?.length ?? 0) / totalEditions * 100) 
    : 0;

  // 4. Variable 'Próximo Inicio'
  const sortedEditionsForNext = [...(editions ?? [])]
    .filter(e => e?.start_date)
    .sort((a, b) => {
      const dateA = a?.start_date ? new Date(a.start_date).getTime() : 0;
      const dateB = b?.start_date ? new Date(b.start_date).getTime() : 0;
      return dateA - dateB;
    });

  const todayTime = new Date().setHours(0, 0, 0, 0);

  let nextEdition = sortedEditionsForNext.find(e => {
    const startMs = e?.start_date ? new Date(e.start_date).getTime() : 0;
    return startMs >= todayTime;
  });

  // If no future start, take the closest past edition (last element in sorted ascending list)
  if (!nextEdition && sortedEditionsForNext.length > 0) {
    nextEdition = sortedEditionsForNext[sortedEditionsForNext.length - 1];
  }

  const nextEditionDateStr = nextEdition?.start_date ? formatFriendlySpanishDate(nextEdition.start_date) : "Sin fecha";
  const nextEditionCourseName = nextEdition?.course_name || "Sin curso";

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-slate-50 min-h-screen p-6 space-y-6 overflow-hidden items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 min-h-screen p-6 space-y-6 overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Calendario Académico</h1>
        
        <div className="flex items-center space-x-4">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar ediciones..."
              className="pl-8 bg-white border-none shadow-sm"
            />
          </div>
          
          <Button variant="outline" className="bg-white border-none shadow-sm flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
          
          <div className="bg-white rounded-md shadow-sm p-1">
            <ToggleGroup type="single" value={viewMode} onValueChange={(val: any) => val && setViewMode(val)}>
              <ToggleGroupItem value="Mes" className="h-8 px-3 text-sm data-[state=on]:bg-blue-50 data-[state=on]:text-blue-600 rounded-sm transition-all">Mes</ToggleGroupItem>
              <ToggleGroupItem value="Semestre" className="h-8 px-3 text-sm data-[state=on]:bg-blue-50 data-[state=on]:text-blue-600 rounded-sm transition-all">Semestre</ToggleGroupItem>
              <ToggleGroupItem value="Año" className="h-8 px-3 text-sm data-[state=on]:bg-blue-50 data-[state=on]:text-blue-600 rounded-sm transition-all">Año</ToggleGroupItem>
            </ToggleGroup>
          </div>

          <Avatar className="h-9 w-9 border border-border shadow-sm">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Sub Header & Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Visualización de planificación</h2>
          <p className="text-sm text-slate-500">Superposición de ediciones consolidadas por curso para el periodo actual ({viewMode})</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 bg-white border-slate-200 text-slate-600 font-medium" onClick={handleToday}>
            Hoy
          </Button>
          <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg shadow-sm border border-slate-100">
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100" onClick={handlePrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold text-slate-700 w-36 text-center capitalize transition-all duration-300">
              {getDynamicLabel()}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100" onClick={handleNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Gantt Chart Container */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col flex-1 min-h-[400px]">
        {/* Gantt Header */}
        <div className="grid grid-cols-[320px_1fr] border-b border-slate-100 bg-white sticky top-0 z-30 rounded-t-xl">
          <div className="p-4 font-semibold text-xs text-slate-500 tracking-wider flex items-center border-r border-slate-100">
            CURSOS Y EDICIONES
          </div>
          <div className="relative">
            <div 
              className="grid text-center text-xs font-medium text-slate-500 h-full"
              style={{ gridTemplateColumns: `repeat(${timelineHeaders.length}, 1fr)` }}
            >
              {timelineHeaders.map((header, i) => {
                const isWknd = viewMode === 'Mes' && isWeekend(parseInt(header));
                return (
                  <div key={i} className={`py-4 border-l border-slate-100 truncate px-1 ${isWknd ? 'bg-slate-50 text-slate-400' : ''}`}>
                    {header}
                  </div>
                );
              })}
            </div>
            {/* Today Marker in Header */}
            {getTodayMarkerPosition().display !== 'none' && (
              <div 
                className="absolute top-0 bottom-0 z-40 transition-all duration-500" 
                style={getTodayMarkerPosition()}
              >
                <div className="absolute top-3 -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_4px_rgba(239,68,68,0.8)]" />
              </div>
            )}
          </div>
        </div>

        {/* Gantt Body */}
        <div className="flex-1 overflow-y-auto relative bg-white rounded-b-xl">
          {groupedCourses.length === 0 && (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm py-12">
              No hay ediciones programadas en este periodo.
            </div>
          )}

          {groupedCourses.map((course, idx) => {
            // Calcular la altura dinámica de la fila basada en el nivel máximo de stacking
            const dynamicHeight = Math.max(80, (course.maxLevel + 1) * step + (topPadding * 2));

            return (
              <div 
                key={course.course_id} 
                className={`grid grid-cols-[320px_1fr] ${idx !== groupedCourses.length - 1 ? 'border-b border-slate-100' : ''} hover:bg-slate-50/50 transition-colors`}
                style={{ height: `${dynamicHeight}px` }}
              >
                {/* Row Header (Consolidado por Curso) */}
                <div className="p-4 border-r border-slate-100 flex flex-col justify-center bg-white/50 z-20">
                  <span className="font-semibold text-slate-900 text-sm">{course.course_name}</span>
                  <span className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {course.course_type} &bull; <span className="font-medium text-slate-700">{course.editions.length} edición(es)</span>
                  </span>
                </div>
                
                {/* Row Timeline Grid */}
                <div className="relative overflow-hidden">
                  {/* Vertical Guidelines */}
                  <div 
                    className="absolute inset-0 grid pointer-events-none"
                    style={{ gridTemplateColumns: `repeat(${timelineHeaders.length}, 1fr)` }}
                  >
                    {timelineHeaders.map((header, i) => {
                      const isWknd = viewMode === 'Mes' && isWeekend(parseInt(header));
                      return (
                        <div key={i} className={`h-full border-l border-dashed border-slate-100 ${isWknd ? 'bg-slate-50/50' : ''}`} />
                      );
                    })}
                  </div>

                  {/* Today Marker Line */}
                  {getTodayMarkerPosition().display !== 'none' && (
                    <div 
                      className="absolute top-0 bottom-0 z-0 transition-all duration-500" 
                      style={getTodayMarkerPosition()}
                    >
                      <div className="absolute top-0 bottom-0 -translate-x-1/2 w-[1px] bg-red-500/40" />
                    </div>
                  )}

                  {/* Timeline Bars (Stacked) */}
                  <div className="absolute inset-0 pointer-events-none">
                    {course.editions.map((ed: any) => (
                       <div 
                         key={ed.id}
                         className="absolute pointer-events-none"
                         style={{ 
                           left: ed.pos.left, 
                           width: ed.pos.width, 
                           top: `${ed.level * step + topPadding}px`, 
                           height: `${barHeight}px` 
                         }}
                       >
                         <HoverCard>
                           <HoverCardTrigger asChild>
                             <div 
                               onClick={() => navigate(`/admin/academic/editions/${ed.id}`)}
                               className={`w-full h-full rounded-sm rounded-l-none font-medium shadow-sm pointer-events-auto cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-md flex flex-col justify-center px-3 overflow-hidden ${getStatusStyles(ed.edition_status)}`}
                             >
                               <div className="flex items-center justify-between w-full truncate gap-2">
                                 {/* Label Dinámico según la vista */}
                                 <span className="text-xs font-semibold truncate">
                                   {isMonthView ? getStatusText(ed.edition_status) : `Ed. ${ed.edition_number}`}
                                 </span>
                                 
                                 {/* Extra Info (solo en Mes por el espacio) */}
                                 {isMonthView && (
                                   <div className="text-[10px] opacity-80 truncate flex items-center gap-1.5 bg-white/20 px-2 py-0.5 rounded-full ml-auto">
                                     <span className="font-mono truncate">{ed.edition_code}</span>
                                   </div>
                                 )}
                               </div>
                             </div>
                           </HoverCardTrigger>
                           <HoverCardContent className="w-80 p-4 z-50 pointer-events-auto" align="start" sideOffset={8}>
                             <div className="space-y-3">
                               <div className="flex justify-between items-start gap-2">
                                 <div className="min-w-0 flex-1">
                                   <h4 className="text-sm font-semibold truncate">{course.course_name}</h4>
                                   <p className="text-sm text-muted-foreground truncate">{ed.edition_name} (Ed. {ed.edition_number})</p>
                                   <p className="text-xs font-mono text-slate-400 mt-0.5 truncate">{ed.edition_code}</p>
                                 </div>
                                 <Badge variant="outline" className="text-[10px] shrink-0">
                                   {getStatusText(ed.edition_status)}
                                 </Badge>
                               </div>
                               <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t border-slate-100">
                                 <div>
                                   <span className="text-muted-foreground block text-xs mb-1">Modalidad</span>
                                   <span className="font-medium capitalize">{ed.modality || "Virtual"}</span>
                                 </div>
                                 <div>
                                   <span className="text-muted-foreground block text-xs mb-1">Fechas</span>
                                   <span className="font-medium">
                                     {displayFriendlyDate(ed.start_date)} <br /> 
                                     {displayFriendlyDate(ed.end_date)}
                                   </span>
                                 </div>
                               </div>
                             </div>
                           </HoverCardContent>
                         </HoverCard>
                       </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-6 shrink-0 pt-2">
        {/* Card 1: TOTAL EDICIONES */}
        <Card className="border-none shadow-sm transition-all duration-300">
          <CardContent className="p-6">
            <h3 className="text-xs font-bold text-slate-500 mb-2 tracking-wider">TOTAL EDICIONES</h3>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-extrabold text-slate-900">{totalEditionsFormatted}</span>
              <span className="text-sm font-bold text-emerald-500 flex items-center">
                <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23 6L13.5 15.5L8.5 10.5L1 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17 6H23V12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                +12%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: EN PROGRESO */}
        <Card className="border-none shadow-sm transition-all duration-300">
          <CardContent className="p-6">
            <h3 className="text-xs font-bold text-slate-500 mb-2 tracking-wider">EN PROGRESO</h3>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-extrabold text-blue-600">{inProgressFormatted}</span>
              <span className="text-sm text-slate-500">Activos ahora</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: TASA DE OCUPACIÓN */}
        <Card className="border-none shadow-sm transition-all duration-300">
          <CardContent className="p-6">
            <h3 className="text-xs font-bold text-slate-500 mb-2 tracking-wider">TASA DE OCUPACIÓN</h3>
            <div className="flex items-center gap-4">
              <span className="text-4xl font-extrabold text-slate-900">{occupancyRate}%</span>
              <Progress value={occupancyRate} className="h-2 flex-1 bg-slate-100" />
            </div>
          </CardContent>
        </Card>

        {/* Card 4: PRÓXIMO INICIO */}
        <Card className="border-none shadow-sm transition-all duration-300">
          <CardContent className="p-6">
            <h3 className="text-xs font-bold text-slate-500 mb-3 tracking-wider">PRÓXIMO INICIO</h3>
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-lg text-orange-600 shrink-0">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-base font-bold text-slate-900 truncate">{nextEditionDateStr}</span>
                <span className="text-sm text-slate-500 truncate">{nextEditionCourseName}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AcademicCalendarView;
