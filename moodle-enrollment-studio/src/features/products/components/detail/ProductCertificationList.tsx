import { Award, ExternalLink, ShieldCheck } from "lucide-react";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import type { UIProduct } from "../../types/product.types";

interface ProductCertificationListProps {
  product: UIProduct;
  compact?: boolean;
}

type CertificationItem = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  issuingAuthority: string;
  registryValidity: string;
  hasDigital: boolean;
  hasPhysical: boolean;
};

export type ProductCertificateResource = {
  id: string;
  title: string;
  url: string;
};

const getCertifications = (product: UIProduct): CertificationItem[] => {
  const related = (product.relatedCertifications || [])
    .map((item) => item.certification)
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description || "",
      imageUrl: item.image_url || "",
      issuingAuthority: item.issuing_authority || "",
      registryValidity: item.registry_validity || "",
      hasDigital: item.has_digital !== false,
      hasPhysical: item.has_physical !== false,
    }));

  if (related.length > 0) return related;
  return product.certification ? [product.certification] : [];
};

export const getProductCertificationCount = (product: UIProduct) => getCertifications(product).length;

export const hasProductCertification = (product: UIProduct) => getProductCertificationCount(product) > 0;

export const getProductCertificateResources = (product: UIProduct): ProductCertificateResource[] =>
  getCertifications(product)
    .filter((certification) => Boolean(certification.imageUrl))
    .map((certification) => ({
      id: certification.id,
      title: certification.title || "Certificación",
      url: certification.imageUrl,
    }));

const ProductCertificationList = ({ product, compact = false }: ProductCertificationListProps) => {
  const certifications = getCertifications(product);

  if (certifications.length === 0) {
    return <p className="rounded-xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">No hay certificaciones registradas.</p>;
  }

  const visibleCertifications = compact ? certifications.slice(0, 1) : certifications;

  return (
    <div className="grid gap-4">
      {visibleCertifications.map((certification) => (
        <div key={certification.id} className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Award size={18} />
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900">{certification.title || "Certificación oficial"}</h3>
                {certification.description && <p className="mt-1 text-xs leading-relaxed text-slate-600">{certification.description}</p>}
                {certification.issuingAuthority && (
                  <p className="mt-2 text-xs font-medium text-slate-500">Emitido por {certification.issuingAuthority}</p>
                )}
              </div>
            </div>
            {certification.imageUrl && (
              <Button asChild size="sm" variant="outline" className="shrink-0 rounded-xl">
                <a href={certification.imageUrl} target="_blank" rel="noopener noreferrer">
                  Visualizar certificado <ExternalLink size={13} />
                </a>
              </Button>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {certification.hasDigital && <Badge variant="outline" className="border-blue-100 bg-blue-50 text-blue-700">Formato digital</Badge>}
            {certification.hasPhysical && <Badge variant="outline" className="border-purple-100 bg-purple-50 text-purple-700">Formato físico</Badge>}
            {certification.registryValidity && (
              <Badge variant="outline" className="border-emerald-100 bg-emerald-50 text-emerald-700">
                <ShieldCheck size={12} className="mr-1" /> {certification.registryValidity}
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductCertificationList;
