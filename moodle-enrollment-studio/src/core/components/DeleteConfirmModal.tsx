import { AlertTriangle } from "lucide-react";
import ModalWrapper from "./ModalWrapper";

interface DeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string;
  itemType?: string;
}

const DeleteConfirmModal = ({ open, onClose, onConfirm, itemName = "este registro", itemType = "elemento" }: DeleteConfirmModalProps) => {
  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={`Eliminar ${itemType}`}
      subtitle={`Esta acción no se puede deshacer.`}
      icon={<div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center"><AlertTriangle size={20} className="text-destructive" /></div>}
      maxWidth="max-w-md"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-destructive" onClick={() => { onConfirm(); onClose(); }}>Eliminar</button>
        </>
      }
    >
      <p className="text-sm text-muted-foreground">
        ¿Estás seguro de que deseas eliminar <strong className="text-foreground">{itemName}</strong>? Todos los datos asociados serán eliminados permanentemente del sistema.
      </p>
    </ModalWrapper>
  );
};

export default DeleteConfirmModal;
