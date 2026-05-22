import React from "react";
import { Card } from "@/core/components/ui/card";

interface DetailSectionProps {
  title: string;
  description?: string;
  icon: React.ComponentType<any>;
  iconBg?: string;
  iconColor?: string;
  children: React.ReactNode;
}

const DetailSection = ({ 
  title, 
  description, 
  icon: Icon, 
  iconBg = "bg-primary/10", 
  iconColor = "text-primary", 
  children 
}: DetailSectionProps) => {
  return (
    <Card className="shadow-sm border border-slate-200/80 rounded-2xl overflow-hidden hover:border-slate-350 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 bg-white">
      <div className="bg-slate-50/50 border-b border-slate-100 p-5">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
            <Icon size={16} className={iconColor} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">{title}</h3>
            {description && <p className="text-[11px] text-slate-500">{description}</p>}
          </div>
        </div>
      </div>
      <div className="p-6 space-y-6">
        {children}
      </div>
    </Card>
  );
};

export default DetailSection;
