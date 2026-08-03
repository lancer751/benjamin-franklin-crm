import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, HelpCircle, Plus, X } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import EntitySelectorModal from "../shared/EntitySelectorModal";
import { getFAQs } from "../../services/faqService";

interface FaqSelectorProps {
  faqs: Array<{ id?: string; question: string; answer: string }>;
  onChange: (faqs: Array<{ id?: string; question: string; answer: string }>) => void;
}

const FaqSelector = ({ faqs, onChange }: FaqSelectorProps) => {
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError } = useQuery({ queryKey: ["faqs"], queryFn: getFAQs });
  const catalog = ((data as any)?.data || []).map((item: any) => ({ ...item, title: item.question, description: item.answer }));
  const selectedIds = faqs.map((item) => item.id).filter(Boolean) as string[];

  const applySelection = (ids: string[]) => {
    const retained = faqs.filter((item) => !item.id || ids.includes(item.id));
    const retainedIds = new Set(retained.map((item) => item.id));
    const added = catalog.filter((item: any) => ids.includes(item.id) && !retainedIds.has(item.id)).map((item: any) => ({ id: item.id, question: item.question, answer: item.answer }));
    onChange([...retained, ...added]);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="flex items-center gap-2 text-sm font-bold text-slate-900"><HelpCircle size={16} className="text-purple-600" /> FAQs del catálogo</h3><p className="mt-1 text-xs text-slate-500">Reutiliza preguntas existentes o crea contenido personalizado debajo.</p></div><Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => setOpen(true)} disabled={isError}><Plus size={14} className="mr-1" /> Seleccionar</Button></div>
      {isError ? <p className="mt-4 flex items-center gap-2 text-xs text-red-600"><AlertTriangle size={14} /> No se pudo cargar el catálogo de FAQs.</p> : selectedIds.length === 0 ? <p className="mt-4 rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">No hay FAQs del catálogo seleccionadas.</p> : <div className="mt-4 flex flex-wrap gap-2">{faqs.filter((item) => item.id).map((item) => <span key={item.id} className="inline-flex max-w-full items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-800"><span className="truncate">{item.question}</span><button type="button" onClick={() => applySelection(selectedIds.filter((id) => id !== item.id))} aria-label={`Quitar ${item.question}`}><X size={13} /></button></span>)}</div>}
      <EntitySelectorModal title="Seleccionar preguntas frecuentes" description="Busca y selecciona varias preguntas del catálogo." entityList={catalog} selectedIds={selectedIds} onSelect={applySelection} isOpen={open} onClose={() => setOpen(false)} isLoading={isLoading} />
    </div>
  );
};

export default FaqSelector;
