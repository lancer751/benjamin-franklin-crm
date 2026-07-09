import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/core/components/ui/dialog";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    first_name: string;
    last_name: string;
    email: string;
    cellphone: string;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export default function NewLeadModal({ isOpen, onClose, onSubmit, isSubmitting }: NewLeadModalProps) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    cellphone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name.trim()) {
      toast.error("El nombre es requerido");
      return;
    }
    if (!formData.last_name.trim()) {
      toast.error("El apellido es requerido");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("El email es requerido");
      return;
    }
    if (!formData.cellphone.trim()) {
      toast.error("El celular es requerido");
      return;
    }

    try {
      await onSubmit({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        cellphone: formData.cellphone.trim(),
      });
      // Reset form after successful submission
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        cellphone: "",
      });
    } catch (err) {
      // Errors handled by parent component / query
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      cellphone: "",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[480px] w-[95vw] rounded-2xl p-6 bg-card border border-border shadow-2xl flex flex-col gap-4">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
            <UserPlus className="h-5 w-5 text-primary" /> Registrar Nuevo Lead
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Ingresa la información básica para registrar el prospecto de forma manual en esta campaña.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="first_name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Nombre
              </Label>
              <Input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Ej. Juan"
                className="h-10 bg-slate-50/20 focus:bg-card border-border rounded-xl text-sm"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="last_name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Apellido
              </Label>
              <Input
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Ej. Pérez"
                className="h-10 bg-slate-50/20 focus:bg-card border-border rounded-xl text-sm"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ejemplo@correo.com"
                className="h-10 bg-slate-50/20 focus:bg-card border-border rounded-xl text-sm"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="cellphone" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Celular
              </Label>
              <Input
                id="cellphone"
                name="cellphone"
                type="tel"
                value={formData.cellphone}
                onChange={handleChange}
                placeholder="Ej. 987654321"
                className="h-10 bg-slate-50/20 focus:bg-card border-border rounded-xl text-sm"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-border mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="h-10 rounded-xl px-4 text-xs font-semibold border-border hover:bg-muted"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 rounded-xl px-4 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                "Registrar Lead"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
