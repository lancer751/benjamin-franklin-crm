interface EditionInfoPanelProps {
  selectedEdition: any;
}

const EditionInfoPanel = ({ selectedEdition }: EditionInfoPanelProps) => {
  if (!selectedEdition) return null;

  return (
    <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 sm:grid-cols-3">
      <div>
        <label className="mb-0.5 block text-[9px] font-bold uppercase tracking-wider text-slate-400">Modalidad base</label>
        <div className="truncate text-xs font-semibold text-slate-700">
          {selectedEdition?.modality?.name || selectedEdition?.modality || "No definida"}
        </div>
      </div>
      <div>
        <label className="mb-0.5 block text-[9px] font-bold uppercase tracking-wider text-slate-400">Profesor principal</label>
        <div className="truncate text-xs font-semibold text-slate-700">
          {selectedEdition?.teacher_fullname || "Por asignar"}
        </div>
      </div>
      <div>
        <label className="mb-0.5 block text-[9px] font-bold uppercase tracking-wider text-slate-400">Código de cohorte</label>
        <div className="truncate font-mono text-xs font-bold text-slate-900">
          {selectedEdition?.edition_code || "Sin código"}
        </div>
      </div>
    </div>
  );
};

export default EditionInfoPanel;
