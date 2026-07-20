import { z } from "zod";
import { BenefitSchema, CertificationSchema, FAQSchema } from "shared";

const temporaryUrl = z.union([z.literal(""), z.string().url("La URL del activo no es válida"), z.null()]).optional();

export const productCertificationFormSchema = CertificationSchema.omit({ id: true }).partial().extend({
  image_url: temporaryUrl,
  title: z.string().optional().default(""),
});

export const productFaqFormSchema = FAQSchema.omit({ id: true, order: true }).partial().extend({
  id: z.string().optional(),
  question: z.string(),
  answer: z.string(),
});

export const productMarketingFormSchema = z.object({
  image_url: temporaryUrl,
  brochure_url: temporaryUrl,
  benefit_ids: z.array(BenefitSchema.shape.id),
  faqs: z.array(productFaqFormSchema),
  certifications: z.array(CertificationSchema.shape.id).default([]),
  certification_id: z.string().nullable().optional(),
  certification_title: z.string().nullable().optional(),
  certification_description: z.string().nullable().optional(),
  certification_issuing_authority: z.string().nullable().optional(),
  certification_registry_validity: z.string().nullable().optional(),
  certification: productCertificationFormSchema.nullable().optional(),
});

export type ProductMarketingFormValues = z.input<typeof productMarketingFormSchema>;
