import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/core/components/ui/dialog";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { getCourseEditionById } from "../services/courseService";
import { Calendar, User, Video, MapPin, Loader2, Link as LinkIcon } from "lucide-react";

interface EditionDetailModalProps {
  open: boolean;
  onClose: () => void;
  editionId: string | null;
}

export default function EditionDetailModal({ open, onClose, editionId }: EditionDetailModalProps) {
  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["edition", editionId],
    queryFn: () => getCourseEditionById(editionId as string),
    enabled: !!editionId && open,
  });

  const edition = response?.success ? response.data : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl w-[95vw]">
        <DialogHeader>
          <DialogTitle>Detalle de la Edición</DialogTitle>
          <DialogDescription>
            Información completa de esta apertura programada.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col p-10 items-center justify-center text-muted-foreground">
            <Loader2 className="animate-spin h-8 w-8 mb-4 text-primary" />
            <p>Obteniendo información profunda...</p>
          </div>
        ) : isError || !edition ? (
          <div className="flex flex-col p-10 items-center justify-center text-destructive">
            <p className="font-semibold">Error al cargar la edición o fue eliminada.</p>
          </div>
        ) : (
          <div className="flex flex-col max-h-[85vh] overflow-hidden py-4 relative">
            {/* Cuerpo del Modal (Área de Scroll) */}
            <div className="flex-1 overflow-y-auto px-1 pb-4 flex flex-col gap-6">
              {/* Header info */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-foreground">Edición {edition.edition_number || "-"}</h3>
                  <p className="text-sm font-mono text-muted-foreground mt-1 bg-muted/40 px-2 py-0.5 rounded border border-border/40 inline-flex">
                    CÓDIGO: {edition.edition_code || "N/A"}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className={
                    edition.edition_status === "OPEN" || edition.edition_status === "IN_PROGRESS"
                      ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-transparent shadow-none"
                      : edition.edition_status === "SCHEDULED"
                      ? "bg-blue-100 text-blue-800 hover:bg-blue-100 border-transparent shadow-none"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-100 border-transparent shadow-none"
                  }
                >
                  {edition.edition_status || "DRAFT"}
                </Badge>
              </div>

              <div className="flex flex-col gap-5">
                {/* Información Académica */}
                <div className="bg-muted/20 border border-border/40 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2 border-b border-border/50 pb-2">
                    <User className="h-4 w-4 text-primary/70" />
                    Información Académica
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-medium">Modalidad</p>
                      <p className="text-sm font-medium flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground/70" />
                        {edition.modality?.name || edition.modality || "No definida"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-medium">Docente Encargado</p>
                      <p className="text-sm font-medium flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-muted-foreground/70" />
                        {edition.teacher_fullname || "Sin asignar"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-medium">Fecha de Inicio</p>
                      <p className="text-sm font-medium flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                        {edition.start_date ? new Date(edition.start_date).toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric' }) : "Pendiente"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-medium">Fecha de Fin</p>
                      <p className="text-sm font-medium flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                        {edition.end_date ? new Date(edition.end_date).toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric' }) : "Pendiente"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Enlaces y Campaña */}
                <div className="bg-muted/20 border border-border/40 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2 border-b border-border/50 pb-2">
                    <LinkIcon className="h-4 w-4 text-primary/70" />
                    Enlaces y Campaña
                  </h4>
                  
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-3 bg-background border border-border/40 rounded-lg gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-0.5">Enlace de Aula Virtual (Meet)</p>
                        {edition.meet_link ? (
                          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium truncate max-w-[250px]">
                            {edition.meet_link}
                          </p>
                        ) : (
                          <p className="text-sm text-foreground/70 italic">No se proporcionó enlace.</p>
                        )}
                      </div>
                      {edition.meet_link && (
                        <Button onClick={() => window.open(edition.meet_link, '_blank')} className="gap-2 shrink-0 h-9" variant="default">
                          <Video size={16} />
                          Unirse a la Sesión
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Fijo */}
            <div className="shrink-0 bg-white pt-4 pb-2 border-t mt-2 flex justify-end gap-2">
              <Button onClick={onClose} variant="outline">Cerrar</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
