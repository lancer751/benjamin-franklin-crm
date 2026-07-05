import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProfessorById } from "../services/professorService";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent } from "@/core/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/core/components/ui/tabs";
import { 
  GraduationCap, 
  Mail, 
  Phone, 
  Loader2, 
  BookOpen, 
  UserCheck, 
  UserX,
  Calendar,
  Layers,
  ArrowLeft
} from "lucide-react";

export default function ProfessorDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: professorRes, isLoading, isError } = useQuery({
    queryKey: ["professor", id],
    queryFn: () => getProfessorById(id as string),
    enabled: !!id,
    staleTime: 0,
  });

  const professor = professorRes || null;
  
  return (
    <div className="bg-slate-50/50 min-h-screen p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col gap-4">
          <div>
            <Button 
              variant="ghost" 
              onClick={() => navigate("/admin/profesores")}
              className="rounded-lg font-bold"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver
            </Button>
          </div>

          {professor && (
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                {`${professor.name || ""} ${professor.lastname || ""}`.trim()}
              </h1>
              <div>
                {professor.is_active ? (
                  <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/35 dark:text-emerald-400 border-transparent px-3 py-1 text-xs font-bold rounded-lg shadow-sm">
                    Activo
                  </Badge>
                ) : (
                  <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 dark:bg-rose-950/35 dark:text-rose-400 border-transparent px-3 py-1 text-xs font-bold rounded-lg shadow-sm">
                    Inactivo
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 text-muted-foreground gap-3 min-h-[400px]">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-semibold animate-pulse">Cargando expediente completo...</p>
          </div>
        ) : isError || !professor ? (
          <div className="flex flex-col items-center justify-center p-12 text-destructive gap-2 text-center min-h-[400px] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950">
            <p className="font-bold">Error al cargar la información.</p>
            <p className="text-xs text-muted-foreground">El docente no pudo ser encontrado en el aula o servidor.</p>
            <Button 
              variant="outline" 
              className="mt-4 rounded-xl font-bold" 
              onClick={() => navigate("/admin/profesores")}
            >
              Volver a la lista
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* PANEL IZQUIERDO: PERFIL Y DETALLES */}
            <div className="lg:col-span-4">
              <Card className="shadow-sm border-border/60 overflow-hidden bg-white dark:bg-slate-950 rounded-xl">
                <CardContent className="pt-6 flex flex-col items-center space-y-6">
                  {/* Avatar Circular */}
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center ring-4 ring-primary/5 dark:bg-primary/20">
                      <GraduationCap size={44} className="text-primary" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-sm">
                      {professor.moodle_user_status === "ACTIVE" ? (
                        <UserCheck size={14} className="text-emerald-500" />
                      ) : (
                        <UserX size={14} className="text-rose-500" />
                      )}
                    </div>
                  </div>

                  {/* Nombre, Rol y Profesión */}
                  <div className="space-y-2 text-center w-full">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 tracking-tight leading-tight">
                      {professor.profession || "No especificada"}
                    </h3>
                    <p className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                      Docente de Moodle
                    </p>

                    {/* Badge de Estado Moodle */}
                    <div className="pt-1 flex justify-center">
                      {professor.moodle_user_status === "ACTIVE" ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-transparent hover:bg-emerald-100 px-3 py-1 text-xs font-bold rounded-lg shadow-sm">
                          Activo en Moodle
                        </Badge>
                      ) : (
                        <Badge className="bg-rose-100 text-rose-800 border-transparent hover:bg-rose-100 px-3 py-1 text-xs font-bold rounded-lg shadow-sm">
                          Suspendido en Moodle
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Separador */}
                  <hr className="w-full border-slate-200/60 dark:border-slate-800/80" />

                  {/* Detalles de Contacto */}
                  <div className="w-full space-y-4 text-left">
                    <div className="flex items-start gap-3 w-full">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                        <Mail size={14} className="text-slate-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Email Personal</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 break-all block mt-0.5">
                          {professor.email}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 w-full">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Mail size={14} className="text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Email Institucional</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 break-all block mt-0.5">
                          {professor.corporate_email || "No registrado"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 w-full">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                        <Phone size={14} className="text-slate-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Celular</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mt-0.5">
                          {professor.cellphone || "No registrado"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 w-full">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                        <Layers size={14} className="text-slate-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">ID Cuenta Moodle</span>
                        <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 block mt-0.5">
                          {professor.moddle_account_id || "No vinculado"}
                        </span>
                      </div>
                    </div>

                    {/* Botones de acción CV y LinkedIn */}
                    {(professor.curriculum_vitae || professor.linkedin_account_url) && (
                      <div className="pt-2 flex flex-col gap-2 w-full">
                        {professor.linkedin_account_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full flex items-center justify-center gap-2 rounded-xl text-xs font-bold shadow-sm"
                            onClick={() => window.open(professor.linkedin_account_url, "_blank")}
                          >
                            <svg className="h-4 w-4 fill-current text-slate-700 dark:text-slate-300" viewBox="0 0 24 24">
                              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                            </svg>
                            Ver LinkedIn
                          </Button>
                        )}
                        {professor.curriculum_vitae && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full flex items-center justify-center gap-2 rounded-xl text-xs font-bold shadow-sm"
                            onClick={() => window.open(professor.curriculum_vitae, "_blank")}
                          >
                            <BookOpen size={14} className="text-slate-700 dark:text-slate-300" />
                            Ver Curriculum Vitae
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* PANEL DERECHO: TABS Y CARGA ACADÉMICA */}
            <div className="lg:col-span-8">
              <Tabs defaultValue="carga" className="w-full bg-white dark:bg-slate-950 p-6 rounded-xl border border-border/60 shadow-sm">
                <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <TabsTrigger 
                    value="carga" 
                    className="rounded-lg font-bold text-xs px-4 py-2"
                  >
                    Carga Académica
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="carga" className="mt-6 space-y-4">
                  <div className="flex flex-col gap-1 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Asignaciones Académicas
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <BookOpen size={16} className="text-primary" />
                      Carga Académica Asignada
                    </h4>
                  </div>

                  {!professor.assigned_editions || professor.assigned_editions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-200/80 rounded-2xl bg-slate-50/20 dark:border-slate-800/80 min-h-[220px]">
                      <BookOpen size={36} className="text-slate-300 mb-3" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Sin asignaciones asignadas actualmente</p>
                      <p className="text-[10px] text-muted-foreground mt-1 max-w-[220px] leading-normal">
                        Este docente no tiene cohortes ni cursos vinculados en la institución.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {professor.assigned_editions.map((ed: any, idx: number) => (
                        <div 
                          key={ed.edition_id || idx} 
                          className="w-full bg-slate-50/60 border border-slate-100 hover:bg-slate-50 rounded-xl flex flex-col items-start justify-between min-h-[140px] p-5 transition-all dark:bg-slate-900/10 dark:border-slate-800 dark:hover:bg-slate-900/20 cursor-pointer group"
                          onClick={() => navigate(`/admin/academic/editions/${ed.edition_id}`)}
                        >
                          {/* Bloque Superior */}
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug block w-full">
                            {ed.course?.name || "Curso Académico"}
                          </span>
                          
                          {/* Bloque Inferior */}
                          <div className="w-full flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 mt-auto">
                            {/* Al lado izquierdo */}
                            <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                              <Calendar size={12} className="inline shrink-0" />
                              Edición N° {ed.edition_number || "-"}
                            </span>
                            {/* Al lado derecho */}
                            <span className="text-xs font-bold text-primary group-hover:underline">
                              Ver Cohorte →
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}
