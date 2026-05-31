import React from "react";
import { useQuery } from "@tanstack/react-query";
import { ModalWrapper } from "@/core/components/modals/ModalWrapper";
import { getProfessorById } from "../services/professorService";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { 
  GraduationCap, 
  Mail, 
  Phone, 
  Loader2, 
  BookOpen, 
  UserCheck, 
  UserX,
  Calendar,
  Layers
} from "lucide-react";

interface ProfessorDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  professorId: string | null;
}

export const ProfessorDetailModal = ({ isOpen, onClose, professorId }: ProfessorDetailModalProps) => {
  // Query to fetch professor detail from backend
  const { data: professorData, isLoading, isError } = useQuery({
    queryKey: ["professor", professorId],
    queryFn: () => getProfessorById(professorId as string),
    enabled: isOpen && !!professorId,
    staleTime: 0, // Ensure fresh load
  });

  const professor = professorData; // Hono returns direct object in backend's custom response formatting

  return (
    <ModalWrapper
      open={isOpen}
      onClose={onClose}
      title="Expediente del Docente"
      subtitle="Visualiza el estado de Moodle, contactos y carga académica actual."
      maxWidth="max-w-5xl"
    >
      <div className="h-auto w-full flex flex-col bg-white dark:bg-slate-950">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 text-muted-foreground gap-3 min-h-[300px]">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-semibold animate-pulse">Cargando expediente completo...</p>
          </div>
        ) : isError || !professor ? (
          <div className="flex flex-col items-center justify-center p-12 text-destructive gap-2 text-center min-h-[300px]">
            <p className="font-bold">Error al cargar la información.</p>
            <p className="text-xs text-muted-foreground">El docente no pudo ser encontrado en el aula o servidor.</p>
            <Button variant="outline" className="mt-4 rounded-xl" onClick={onClose}>Cerrar</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 items-start">
            
            {/* LADO IZQUIERDO: PERFIL Y ESTADO (5 de 12 columnas) */}
            <div className="md:col-span-5 flex flex-col items-center text-center space-y-6 border-r border-slate-100 dark:border-slate-800 pr-6">
              
              {/* Gran Avatar Circular */}
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

              {/* Nombre, Rol y Badges */}
              <div className="space-y-2 w-full">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-tight whitespace-normal md:whitespace-nowrap">
                  {`${professor.name || ""} ${professor.lastname || ""}`.trim()}
                </h3>
                
                <p className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                  Docente de Moodle
                </p>

                {/* Badge de Estado Moodle */}
                <div className="pt-1">
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

              {/* Detalles de Contacto Alineados a la Izquierda de Ancho Completo */}
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
              </div>
            </div>

            {/* LADO DERECHO: CARGA ACADÉMICA (7 de 12 columnas) */}
            <div className="md:col-span-7 space-y-4">
              <div className="flex flex-col gap-1 pb-2 border-b border-slate-100 dark:border-slate-800">
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
                <div className="space-y-3">
                  {professor.assigned_editions.map((ed: any, idx: number) => (
                    <div 
                      key={ed.edition_id || idx} 
                      className="w-full bg-slate-50/60 border border-slate-100 hover:bg-slate-50 rounded-xl p-4 flex items-center justify-between gap-4 transition-all dark:bg-slate-900/10 dark:border-slate-800 dark:hover:bg-slate-900/20"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug break-words">
                          {ed.course?.name || "Curso Académico"}
                        </h5>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold">
                          <Calendar size={11} className="inline shrink-0" />
                          Edición N° {ed.edition_number || "-"}
                        </p>
                      </div>
                      
                      <span className="font-mono text-xs bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-800 px-2 py-0.5 rounded-md text-slate-600 dark:text-slate-400 shrink-0 font-bold shadow-sm self-center">
                        {ed.edition_code || "TBD"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
          </div>
        )}
        
        <div className="px-6 py-4 border-t border-border/50 flex justify-end bg-muted/20 shrink-0">
          <Button type="button" className="rounded-xl px-8 font-bold transition-all shadow-sm shadow-slate-100 hover:shadow" onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </ModalWrapper>
  );
};
