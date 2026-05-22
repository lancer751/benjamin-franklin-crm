import React from "react";

interface PriceCardProps {
  attendanceMode?: string;
  cashPrice?: string;
  enrollmentFee?: string;
  installmentPrice?: string;
}

const PriceCard = ({ 
  attendanceMode, 
  cashPrice, 
  enrollmentFee, 
  installmentPrice 
}: PriceCardProps) => {
  return (
    <div className="p-4 rounded-xl border border-slate-200/85 bg-slate-50/45 hover:border-slate-350 hover:bg-slate-50/70 transition-all duration-200 space-y-3">
      {attendanceMode && (
        <div className="flex items-center gap-2 border-b border-slate-200/50 pb-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
            Modalidad {attendanceMode}
          </span>
        </div>
      )}
      
      <div className="grid gap-2">
        {enrollmentFee && enrollmentFee !== "S/ N/A" && enrollmentFee !== "N/A" && (
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Matrícula</span>
            <span className="font-bold text-slate-800">{enrollmentFee}</span>
          </div>
        )}
        {cashPrice && cashPrice !== "S/ N/A" && cashPrice !== "N/A" && (
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Contado</span>
            <span className="font-black text-emerald-600 text-sm">{cashPrice}</span>
          </div>
        )}
        {installmentPrice && installmentPrice !== "S/ N/A" && installmentPrice !== "N/A" && (
          <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200/60 border-dashed">
            <span className="text-slate-500 font-medium">En Cuotas</span>
            <span className="font-bold text-slate-800">{installmentPrice}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceCard;
