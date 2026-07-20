import { z } from "zod";
import { productCommercialFormSchema } from "./productCommercialForm.schema";
import { productMarketingFormSchema } from "./productMarketingForm.schema";
import { productWebContentFormSchema } from "./productWebContentForm.schema";

export const productFormSchema = productCommercialFormSchema
  .and(productMarketingFormSchema)
  .and(productWebContentFormSchema)
  .superRefine((data, context) => {
    if (data.sales_status === "ON_SALE" && data.pricing_status === "INVALID") {
      context.addIssue({
        code: "custom",
        path: ["sales_status"],
        message: "Corrige los precios antes de poner el producto en venta",
      });
    }

    if ((data.sales_status === "PUBLISHED" || data.sales_status === "ON_SALE") && data.benefit_ids.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["benefit_ids"],
        message: "Selecciona al menos un beneficio para publicar",
      });
    }
  });

export type ProductFormValues = z.input<typeof productFormSchema>;
