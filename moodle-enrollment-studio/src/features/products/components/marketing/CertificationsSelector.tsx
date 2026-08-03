import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Award, Plus, X } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import EntitySelectorModal from "../shared/EntitySelectorModal";
import { getCertifications } from "../../services/certificationService";

interface CertificationsSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[], selected?: any) => void;
}

const CertificationsSelector = ({ selectedIds, onChange }: CertificationsSelectorProps) => {
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError } = useQuery({ queryKey: ["certifications"], queryFn: getCertifications });
  const certifications = (data as any)?.data || [];
  const selected = certifications.filter((item: any) => selectedIds.includes(item.id));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="flex items-center gap-2 text-sm font-bold text-slate-900"><Award size={16} className="text-amber-600" /> Certificaciones vinculadas</h3><p className="mt-1 text-xs text-slate-500">Busca y vincula certificaciones existentes; debajo puedes editar la principal.</p></div><Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => setOpen(true)} disabled={isError}><Plus size={14} className="mr-1" /> Seleccionar</Button></div>
      {isError ? <p className="mt-4 flex items-center gap-2 text-xs text-red-600"><AlertTriangle size={14} /> No se pudo cargar el catálogo de certificaciones.</p> : selected.length === 0 ? <p className="mt-4 rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">No hay certificaciones seleccionadas.</p> : <div className="mt-4 flex flex-wrap gap-2">{selected.map((item: any) => <span key={item.id} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">{item.title}<button type="button" onClick={() => { const next = selectedIds.filter((id) => id !== item.id); onChange(next, certifications.find((cert: any) => cert.id === next[0])); }} aria-label={`Quitar ${item.title}`}><X size={13} /></button></span>)}</div>}
      <EntitySelectorModal title="Seleccionar certificaciones" description="Puedes asociar una o varias certificaciones al producto." entityList={certifications} selectedIds={selectedIds} onSelect={(ids) => onChange(ids, certifications.find((item: any) => item.id === ids[0]))} isOpen={open} onClose={() => setOpen(false)} isLoading={isLoading} />
    </div>
  );
};

export default CertificationsSelector;
