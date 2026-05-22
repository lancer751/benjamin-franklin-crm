import React from "react";

interface InfoFieldProps {
  label: string;
  value?: string | number | null;
  icon?: React.ComponentType<any>;
  iconColor?: string;
  mono?: boolean;
}

const InfoField = ({ 
  label, 
  value, 
  icon: Icon, 
  iconColor = "text-slate-400", 
  mono = false 
}: InfoFieldProps) => {
  // Strict conditional rendering: if raw value is not defined or is null, do not render label nor value.
  if (value === undefined || value === null || value === "" || value === "No definida" || value === "N/A" || value === "Fecha inválida") return null;

  return (
    <div className="space-y-1">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{label}</span>
      <div className="flex items-center gap-1.5 pt-0.5">
        {Icon && <Icon size={14} className={`${iconColor} shrink-0`} />}
        <span className={`text-xs font-semibold text-slate-800 ${mono ? 'font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-600 font-bold' : ''}`}>
          {value}
        </span>
      </div>
    </div>
  );
};

export default InfoField;
