interface EditionInfoPanelProps {
  selectedEdition: any;
}

const EditionInfoPanel = ({ selectedEdition }: EditionInfoPanelProps) => {
  if (!selectedEdition) return null;

  return (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Modalidad Base</label>
        <div className="text-sm font-semibold text-slate-700 truncate">
          {selectedEdition?.modality?.name || selectedEdition?.modality || "No definida"}
        </div>
      </div>
      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Profesor Principal</label>
        <div className="text-sm font-semibold text-slate-700 truncate">
          {selectedEdition?.teacher_fullname || "Por asignar"}
        </div>
      </div>
      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Código Cohorte</label>
        <div className="text-sm font-mono font-bold text-slate-900 truncate">
          {selectedEdition?.edition_code || "Sin código"}
        </div>
      </div>
    </div>
  );
};

export default EditionInfoPanel;
