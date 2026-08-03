import { z } from "zod";
import { BenefitSchema, CertificationSchema, CreateFAQSchema, CreateRefinedCertificationSchema, FAQSchema } from "shared";

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
}).superRefine((data, context) => {
  data.faqs.forEach((faq, index) => {
    if (!faq.question.trim() && !faq.answer.trim()) return;
    const result = CreateFAQSchema.safeParse({ question: faq.question, answer: faq.answer, order: index });
    if (!result.success) {
      result.error.issues.forEach((issue) => context.addIssue({
        code: "custom",
        path: ["faqs", index, ...issue.path],
        message: issue.path[0] === "question"
          ? "La pregunta debe tener al menos 10 caracteres"
          : "La respuesta debe tener al menos 10 caracteres",
      }));
    }
  });

  if (data.certification?.title?.trim() || data.certification?.description?.trim()) {
    const result = CreateRefinedCertificationSchema.safeParse({
      title: data.certification.title,
      description: data.certification.description || "",
      image_url: data.certification.image_url || null,
      issuing_authority: data.certification.issuing_authority || "",
      registry_validity: data.certification.registry_validity || "",
      has_digital: data.certification.has_digital !== false,
      has_physical: data.certification.has_physical !== false,
    });
    if (!result.success) {
      context.addIssue({
        code: "custom",
        path: ["certification_title"],
        message: "El título de certificación debe tener al menos 4 caracteres",
      });
    }
  }
});

export type ProductMarketingFormValues = z.input<typeof productMarketingFormSchema>;
