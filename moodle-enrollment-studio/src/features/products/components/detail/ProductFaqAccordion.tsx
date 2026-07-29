import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/core/components/ui/accordion";
import type { UIProduct } from "../../types/product.types";

interface ProductFaqAccordionProps {
  product: UIProduct;
}

const ProductFaqAccordion = ({ product }: ProductFaqAccordionProps) => {
  const relatedFaqs = (product.frequentQuestions || [])
    .map((item) => item.faq)
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const faqs = relatedFaqs.length > 0 ? relatedFaqs : product.faqs;

  if (faqs.length === 0) {
    return <p className="rounded-xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">No hay preguntas frecuentes registradas.</p>;
  }

  return (
    <Accordion type="single" collapsible className="space-y-2">
      {faqs.map((faq, index) => (
        <AccordionItem key={faq.id || index} value={`faq-${faq.id || index}`} className="rounded-xl border border-slate-200 px-4">
          <AccordionTrigger className="text-left text-sm font-semibold text-slate-800 hover:no-underline">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="text-sm leading-relaxed text-slate-600">{faq.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default ProductFaqAccordion;
