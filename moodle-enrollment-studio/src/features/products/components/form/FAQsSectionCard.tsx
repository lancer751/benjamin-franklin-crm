import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/core/components/ui/card";
import { HelpCircle, Sparkles, Plus, Trash2 } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { cn } from "@/core/lib/utils";

interface FAQItem {
  id?: string;
  question: string;
  answer: string;
}

interface FAQsSectionCardProps {
  form: {
    faqs: FAQItem[];
  };
  setFieldValue: (key: string, value: any) => void;
  handleLoadDefaultFAQs: () => void;
}

const FAQsSectionCard = ({
  form,
  setFieldValue,
  handleLoadDefaultFAQs,
}: FAQsSectionCardProps) => {
  const faqs = form.faqs || [];

  const handleUpdateFAQ = (index: number, field: keyof FAQItem, value: string) => {
    const updated = [...faqs];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setFieldValue("faqs", updated);
  };

  const handleAddFAQ = () => {
    setFieldValue("faqs", [
      ...faqs,
      { question: "", answer: "" },
    ]);
  };

  const handleRemoveFAQ = (index: number) => {
    const updated = faqs.filter((_, idx) => idx !== index);
    setFieldValue("faqs", updated);
  };

  return (
    <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-colors">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
              <HelpCircle size={16} className="text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-slate-900">Preguntas Frecuentes (FAQs)</CardTitle>
              <CardDescription className="text-xs">Configura o importa las dudas más recurrentes sobre las clases y acreditaciones.</CardDescription>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLoadDefaultFAQs}
            className="rounded-xl border-purple-200 bg-purple-50/30 text-purple-700 hover:bg-purple-50 hover:text-purple-800 gap-1.5 self-start sm:self-auto text-xs font-semibold py-2"
          >
            <Sparkles size={14} className="text-purple-600 animate-pulse" />
            Cargar FAQs Institucionales
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {faqs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/40">
            <HelpCircle size={32} className="text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-slate-600">No hay preguntas configuradas</p>
            <p className="text-[11px] text-slate-450 mt-1 max-w-[280px]">
              Carga las 4 preguntas institucionales por defecto o añade una pregunta personalizada.
            </p>
            <div className="flex gap-3 mt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl text-xs border-slate-200"
                onClick={handleAddFAQ}
              >
                <Plus size={14} className="mr-1" /> Añadir Personalizada
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                className="rounded-xl text-xs bg-purple-600 hover:bg-purple-750 gap-1"
                onClick={handleLoadDefaultFAQs}
              >
                <Sparkles size={13} /> Importar Plantillas
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={faq.id || index}
                className="relative group p-4 border border-slate-200/80 rounded-2xl bg-slate-50/20 hover:border-slate-300 hover:bg-slate-50/40 transition-all duration-200"
              >
                {/* Delete button (top-right of item card) */}
                <button
                  type="button"
                  onClick={() => handleRemoveFAQ(index)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Eliminar pregunta"
                >
                  <Trash2 size={13} />
                </button>

                <div className="space-y-3 pr-6">
                  <div>
                    <label className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block mb-1.5">
                      Pregunta #{index + 1}
                    </label>
                    <input
                      type="text"
                      className="form-input rounded-xl h-10 border-slate-200 text-xs font-semibold text-slate-800"
                      placeholder="Escribe la duda del alumno..."
                      value={faq.question}
                      onChange={(e) => handleUpdateFAQ(index, "question", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Respuesta #{index + 1}
                    </label>
                    <textarea
                      className="form-input rounded-xl min-h-[60px] border-slate-200 py-2.5 text-xs text-slate-650 leading-relaxed"
                      placeholder="Escribe la respuesta formal..."
                      value={faq.answer}
                      onChange={(e) => handleUpdateFAQ(index, "answer", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full rounded-xl border-dashed border-2 border-slate-200 hover:border-primary/50 text-slate-600 hover:text-primary gap-1.5 py-3 h-auto text-xs font-medium"
              onClick={handleAddFAQ}
            >
              <Plus size={14} /> Añadir Pregunta Personalizada
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FAQsSectionCard;
