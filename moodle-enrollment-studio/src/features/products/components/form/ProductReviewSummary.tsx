import { AlertTriangle, BadgeCheck, Globe2, Megaphone, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import type { ProductRequirements } from "../../utils/productFormRequirements";
import type { ProductFormValues } from "../../schemas";
import ProductCompletionChecklist from "./ProductCompletionChecklist";

interface ProductReviewSummaryProps {
  form: ProductFormValues;
  requirements: ProductRequirements;
}

const ProductReviewSummary = ({ form, requirements }: ProductReviewSummaryProps) => {
  const sections = [
    { title: "Información comercial", icon: ShoppingBag, items: requirements.sections.commercial },
    { title: "Material comercial", icon: Megaphone, items: requirements.sections.marketing },
    { title: "Publicación web", icon: Globe2, items: requirements.sections.web },
  ];
  const blockedOnSale = form.sales_status === "ON_SALE" && !requirements.canSell;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><BadgeCheck size={20} className="text-primary" /></div><div><h2 className="text-base font-bold text-slate-900">Revisa antes de guardar</h2><p className="mt-1 text-xs text-slate-500">Confirma la información y resuelve los elementos marcados antes de publicar o poner en venta.</p></div></div>
      </div>
      {blockedOnSale && <div className="rounded-2xl border border-red-200 bg-red-50 p-5"><div className="flex gap-3"><AlertTriangle size={19} className="shrink-0 text-red-600" /><div><p className="text-sm font-bold text-red-800">No puedes poner este producto en venta todavía</p><ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-red-700">{requirements.missingForPublication.map((item) => <li key={item.id}>{item.label}</li>)}</ul></div></div></div>}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {sections.map(({ title, icon: Icon, items }) => <Card key={title} className="rounded-2xl border-slate-200 shadow-sm"><CardHeader className="border-b border-slate-100"><CardTitle className="flex items-center gap-2 text-sm"><Icon size={16} className="text-primary" /> {title}</CardTitle></CardHeader><CardContent className="p-5"><ProductCompletionChecklist items={items} /></CardContent></Card>)}
      </div>
    </div>
  );
};

export default ProductReviewSummary;
