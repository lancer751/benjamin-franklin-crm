import { Award, FileText, Pencil } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import type { ProductCertificateResource } from "./ProductCertificationList";

interface ProductQuickActionsProps {
  brochureUrl?: string | null;
  hasCertification: boolean;
  certificateResources?: ProductCertificateResource[];
  canEdit: boolean;
  onEdit: () => void;
  compact?: boolean;
  showCertification?: boolean;
  showEdit?: boolean;
}

const ProductQuickActions = ({
  brochureUrl,
  hasCertification,
  certificateResources = [],
  canEdit,
  onEdit,
  compact = false,
  showCertification = true,
  showEdit = true,
}: ProductQuickActionsProps) => (
  <div className={compact ? `grid gap-2 ${canEdit ? "sm:grid-cols-3" : "sm:grid-cols-2"}` : "grid gap-2"}>
    {brochureUrl ? (
      <Button asChild variant="outline" className="justify-start rounded-xl">
        <a href={brochureUrl} target="_blank" rel="noopener noreferrer">
          <FileText size={15} />
          Ver brochure
        </a>
      </Button>
    ) : (
      <Button variant="outline" disabled className="justify-start rounded-xl">
        <FileText size={15} />
        Brochure no disponible
      </Button>
    )}

    {showCertification && certificateResources.length === 1 && (
      <Button asChild variant="outline" className="justify-start rounded-xl">
        <a href={certificateResources[0].url} target="_blank" rel="noopener noreferrer">
          <Award size={15} />
          Ver certificado
        </a>
      </Button>
    )}

    {showCertification && certificateResources.length > 1 && (
      <div className="space-y-2 rounded-xl border border-slate-200 p-3">
        <p className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Award size={14} />
          Ver certificados
        </p>
        <div className="grid gap-2">
          {certificateResources.map((certificate) => (
            <Button key={certificate.id} asChild size="sm" variant="outline" className="h-auto justify-start whitespace-normal rounded-lg py-2 text-left">
              <a href={certificate.url} target="_blank" rel="noopener noreferrer">
                {certificate.title}
              </a>
            </Button>
          ))}
        </div>
      </div>
    )}

    {showCertification && certificateResources.length === 0 && (
      <Button variant="outline" disabled className="justify-start rounded-xl">
        <Award size={15} />
        {hasCertification ? "Certificado sin archivo" : "Certificado no registrado"}
      </Button>
    )}

    {showEdit && canEdit && (
      <Button type="button" onClick={onEdit} className="justify-start rounded-xl bg-blue-600 text-white hover:bg-blue-700">
        <Pencil size={15} />
        Editar producto
      </Button>
    )}
  </div>
);

export default ProductQuickActions;
