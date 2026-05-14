import { useParams, useNavigate } from 'react-router-dom';
import { useEditionDetail } from '../hooks/useEditionDetail';
import { Button } from '@/core/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/components/ui/tabs';
import { Badge } from '@/core/components/ui/badge';
import { ChevronLeft, Loader2, Calendar, Clock, Video, BookOpen, Users, Link, MessageCircle, MonitorPlay, Layers } from 'lucide-react';
import { displayFriendlyDate } from '@/core/utils/date-utils';
import { translateEnum, EditionStatusMap, DurationUnitMap, ModalityMap } from '@/core/utils/dictionaries';

export const EditionDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: response, isLoading, isError } = useEditionDetail(id);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-slate-50 min-h-screen p-6 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (isError || !response?.data) {
    return (
      <div className="flex flex-col h-full bg-slate-50 min-h-screen p-6 items-center justify-center">
        <p className="text-slate-500">Error al cargar la edición o no encontrada.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          Volver
        </Button>
      </div>
    );
  }

  const edition = response.data;
  const course = edition.course;

  return (
    <div className="flex flex-col h-full bg-slate-50 min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {course?.name || "Curso Desconocido"}
              </h1>
              <Badge variant={edition.edition_status === "COMPLETED" ? "default" : "secondary"}>
                {translateEnum(edition.edition_status, EditionStatusMap)}
              </Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {edition.edition_name} (Ed. {edition.edition_number}) &bull; <span className="font-mono">{edition.edition_code || edition.code}</span>
            </p>
          </div>
        </div>
        <Button>
          Editar Edición
        </Button>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-6">
          <TabsTrigger value="info" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-6 py-3">
            Información
          </TabsTrigger>
          <TabsTrigger value="professors" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-6 py-3">
            Profesores Asignados
          </TabsTrigger>
          <TabsTrigger value="students" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-6 py-3">
            Alumnos Matriculados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="shadow-sm border-slate-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-slate-500" />
                  Información Académica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-slate-500 block mb-1">Fecha de Inicio</span>
                    <span className="font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      {displayFriendlyDate(edition.start_date)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500 block mb-1">Fecha de Fin</span>
                    <span className="font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      {displayFriendlyDate(edition.end_date)}
                    </span>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <span className="text-sm text-slate-500 block mb-1">Modalidad</span>
                  <span className="font-medium capitalize">{translateEnum(edition.modality, ModalityMap)}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="h-4 w-4 text-slate-500" />
                  Estructura del Programa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-slate-500 block mb-1">Duración Total</span>
                    <span className="font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400" />
                      {edition.duration_value ? `${edition.duration_value} ${translateEnum(edition.duration_unit, DurationUnitMap).toLowerCase()}` : "No definida"}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500 block mb-1">Horas Totales</span>
                    <span className="font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400" />
                      {edition.hours_amount ? `${edition.hours_amount} horas` : "No definidas"}
                    </span>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <span className="text-sm text-slate-500 block mb-1">Cantidad de Clases</span>
                  <span className="font-medium">{edition.classes_number ? `${edition.classes_number} clases` : "No definidas"}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Link className="h-4 w-4 text-slate-500" />
                  Enlaces y Plataforma LMS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm text-slate-500 flex items-center gap-2 mb-1">
                    <Video className="h-4 w-4" />
                    Enlace de Clase (Meet/Zoom)
                  </span>
                  {edition.meet_link ? (
                    <a href={edition.meet_link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium break-all">
                      {edition.meet_link}
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">No configurado</span>
                  )}
                </div>
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-sm text-slate-500 flex items-center gap-2 mb-1">
                    <MessageCircle className="h-4 w-4" />
                    Grupo de WhatsApp
                  </span>
                  {edition.whatsapp_group_link ? (
                    <a href={edition.whatsapp_group_link} target="_blank" rel="noreferrer" className="text-green-600 hover:underline font-medium break-all">
                      {edition.whatsapp_group_link}
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">No configurado</span>
                  )}
                </div>
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-sm text-slate-500 flex items-center gap-2 mb-1">
                    <MonitorPlay className="h-4 w-4" />
                    ID de Curso Moodle
                  </span>
                  {edition.moodle_course_id ? (
                    <span className="font-mono bg-slate-100 px-2 py-1 rounded text-sm">{edition.moodle_course_id}</span>
                  ) : (
                    <span className="text-slate-400 italic">No vinculado a Moodle</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="professors">
          <Card className="shadow-sm border-slate-100">
            <CardHeader>
              <CardTitle className="text-base">Profesores Asignados</CardTitle>
            </CardHeader>
            <CardContent>
              {edition.assigned_professors && edition.assigned_professors.length > 0 ? (
                <div className="space-y-4">
                  {edition.assigned_professors.map((prof: any) => (
                    <div key={prof.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <Users className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="font-medium text-sm text-slate-900">{prof.professor?.fullname || "Desconocido"}</p>
                        <p className="text-xs text-slate-500">Rol: Principal</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  No hay profesores asignados a esta edición todavía.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students">
          <Card className="shadow-sm border-slate-100">
            <CardHeader>
              <CardTitle className="text-base">Alumnos Matriculados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-slate-500">
                <Users className="h-8 w-8 mx-auto text-slate-300 mb-3" />
                <p>Módulo de alumnos matriculados en desarrollo.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EditionDetailView;
