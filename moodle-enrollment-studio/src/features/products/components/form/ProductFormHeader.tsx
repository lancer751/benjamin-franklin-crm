import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import ProductFormProgress from "./ProductFormProgress";

const statusLabels: Record<string, string> = {
  DRAFT: "Borrador",
  PUBLISHED: "Publicado",
  ON_SALE: "En venta",
  COMPLETED: "Finalizado",
  CANCELLED: "Cancelado",
};

interface ProductFormHeaderProps {
  isEdit: boolean;
  name?: string;
  status: string;
  progress: number;
  pendingCount: number;
  onBack: () => void;
  actions: ReactNode;
}

const ProductFormHeader = ({ isEdit, name, status, progress, pendingCount, onBack, actions }: ProductFormHeaderProps) => (
  <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <Button type="button" variant="ghost" size="icon" onClick={onBack} className="shrink-0 rounded-xl" aria-label="Volver a productos">
          <ArrowLeft size={18} />
        </Button>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-slate-950">{isEdit ? "Editar producto comercial" : "Crear producto comercial"}</h1>
            <Badge variant="outline" className="rounded-full bg-slate-50">{statusLabels[status] || status}</Badge>
          </div>
          <p className="mt-1 truncate text-sm text-slate-500">{name?.trim() || "Completa la información para crear el producto"}</p>
        </div>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
        <ProductFormProgress progress={progress} pendingCount={pendingCount} />
        <div className="hidden flex-wrap items-center gap-2 lg:flex">{actions}</div>
      </div>
    </div>
  </header>
);

export default ProductFormHeader;
