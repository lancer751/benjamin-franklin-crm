import { AlertTriangle, PackageOpen } from "lucide-react";
import type { ChangeEvent } from "react";
import type { ProductFormValues } from "../../schemas";
import BenefitsCard from "../form/BenefitsCard";
import CertificationCard from "../form/CertificationCard";
import CoverImageUploader from "../form/CoverImageUploader";
import FAQsSectionCard from "../form/FAQsSectionCard";
import ProductBrochureUploader from "./ProductBrochureUploader";
import CertificationsSelector from "./CertificationsSelector";
import FaqSelector from "./FaqSelector";

interface ProductMarketingSectionProps {
  form: ProductFormValues;
  errors: Record<string, string>;
  setFieldValue: (key: string, value: any) => void;
  availableBenefits: any[];
  isLoadingBenefits: boolean;
  isBenefitsError: boolean;
  onToggleBenefit: (id: string) => void;
  isUploadingCover: boolean;
  onCoverUpload: (file: File) => void;
  isUploadingBrochure: boolean;
  onBrochureFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveBrochure: () => void;
  onLoadDefaultFAQs: () => void;
  disabled?: boolean;
}

const ProductMarketingSection = (props: ProductMarketingSectionProps) => (
  <fieldset disabled={props.disabled} className="m-0 space-y-6 border-0 p-0">
    <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white p-5">
      <div className="flex items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white"><PackageOpen size={18} /></div><div><h2 className="text-sm font-bold text-slate-900">Panel de activos comerciales</h2><p className="mt-1 text-xs leading-relaxed text-slate-500">Prepara la portada, documentos y argumentos que Marketing mostrará al posible alumno.</p></div></div>
    </div>
    {props.isBenefitsError && <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertTriangle size={18} /> No se pudo cargar el catálogo de beneficios. Tus selecciones actuales se conservarán.</div>}
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <CoverImageUploader imageUrl={props.form.image_url || undefined} isUploading={props.isUploadingCover} onUpload={props.onCoverUpload} onRemove={() => props.setFieldValue("image_url", "")} />
      <ProductBrochureUploader url={props.form.brochure_url} isUploading={props.isUploadingBrochure} onFileChange={props.onBrochureFileChange} onRemove={props.onRemoveBrochure} />
    </div>
    <CertificationsSelector selectedIds={props.form.certifications || []} onChange={(ids, selected) => {
      props.setFieldValue("certifications", ids);
      props.setFieldValue("certification_id", ids[0] || "");
      if (selected) {
        props.setFieldValue("certification", {
          image_url: selected.image_url || "",
          title: selected.title || "",
          description: selected.description || "",
          issuing_authority: selected.issuing_authority || "Corporación Educativa Benjamin Franklin",
          registry_validity: selected.registry_validity || "",
          has_digital: selected.has_digital !== false,
          has_physical: selected.has_physical !== false,
        });
      } else if (ids.length === 0) {
        props.setFieldValue("certification", null);
        props.setFieldValue("certification_title", "");
        props.setFieldValue("certification_description", "");
      }
    }} />
    <CertificationCard form={props.form} errors={props.errors} setFieldValue={props.setFieldValue} />
    <BenefitsCard availableBenefits={props.availableBenefits} isLoadingBenefits={props.isLoadingBenefits} benefitIds={props.form.benefit_ids || []} errors={props.errors} onToggle={props.onToggleBenefit} setFieldValue={props.setFieldValue} />
    <FaqSelector faqs={props.form.faqs || []} onChange={(faqs) => props.setFieldValue("faqs", faqs)} />
    <FAQsSectionCard form={props.form} setFieldValue={props.setFieldValue} handleLoadDefaultFAQs={props.onLoadDefaultFAQs} />
  </fieldset>
);

export default ProductMarketingSection;
