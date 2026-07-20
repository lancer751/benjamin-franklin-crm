import type { ProductFormValues } from "../../schemas";
import type { ProductRequirement } from "../../utils/productFormRequirements";
import CommercialConfigCard from "../form/CommercialConfigCard";
import ProductPublicationRequirements from "./ProductPublicationRequirements";

interface ProductWebContentSectionProps {
  form: ProductFormValues;
  errors: Record<string, string>;
  setFieldValue: (key: string, value: any) => void;
  requirements: ProductRequirement[];
  disabled?: boolean;
}

const ProductWebContentSection = ({ form, errors, setFieldValue, requirements, disabled }: ProductWebContentSectionProps) => (
  <fieldset disabled={disabled} className="m-0 grid grid-cols-1 gap-6 border-0 p-0 xl:grid-cols-[minmax(0,1fr)_320px]">
    <CommercialConfigCard form={form} errors={errors} setFieldValue={setFieldValue} />
    <ProductPublicationRequirements requirements={requirements} isOnSale={form.sales_status === "ON_SALE"} />
  </fieldset>
);

export default ProductWebContentSection;
