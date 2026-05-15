import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/core/components/ui/dialog";
import { cn } from "@/core/lib/utils";

export interface ModalWrapperProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string; // Permite pasar clases como 'max-w-4xl', 'max-w-md', etc.
  className?: string; // Para estilos adicionales del contenedor principal
}

export const ModalWrapper: React.FC<ModalWrapperProps> = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "max-w-lg", // Tamaño por defecto si no se le pasa uno
  className,
}) => {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      {/* El ancho base es 95vw para móviles, 
        y en pantallas medianas (sm) adopta el maxWidth que le pases por props 
      */}
      <DialogContent 
        className={cn(
          "w-[95vw] overflow-hidden p-0 flex flex-col max-h-[90vh]", 
          `sm:${maxWidth}`, 
          className
        )}
      >
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0 border-b border-border/50">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            {title}
          </DialogTitle>
          {subtitle && (
            <DialogDescription className="text-sm text-muted-foreground mt-1.5">
              {subtitle}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Renderiza el contenido dinámico (el formulario, tablas, etc.) 
          El flex-1 asegura que el contenido ocupe el espacio restante si hay un footer
        */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};