import { X } from "lucide-react";
import { ReactNode } from "react";

interface ModalWrapperProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  footer: ReactNode;
  maxWidth?: string;
}

const ModalWrapper = ({ open, onClose, title, subtitle, icon, children, footer, maxWidth = "max-w-2xl" }: ModalWrapperProps) => {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-container ${maxWidth}`} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between px-8 pt-8 pb-2">
          <div className="flex items-start gap-3">
            {icon && <div className="mt-0.5">{icon}</div>}
            <div>
              <h2 className="text-xl font-bold text-foreground">{title}</h2>
              {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-6">{children}</div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-8 py-5 bg-muted/50 rounded-b-xl border-t border-border">
          {footer}
        </div>
      </div>
    </div>
  );
};

export default ModalWrapper;
