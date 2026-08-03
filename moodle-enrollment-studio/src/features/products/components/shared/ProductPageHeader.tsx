import React from "react";
import { Button } from "@/core/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ProductPageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  onBack: () => void;
  actions: React.ReactNode;
}

const ProductPageHeader = ({
  title,
  subtitle,
  onBack,
  actions,
}: ProductPageHeaderProps) => {
  return (
    <div className="pt-2 mb-6 border-b border-slate-200/80 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-xl bg-white border border-slate-200 hover:bg-slate-50 shadow-sm shrink-0"
          onClick={onBack}
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </Button>
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {title}
            </h1>
          </div>
          {subtitle && (
            <div className="text-[11px] text-muted-foreground mt-1">
              {subtitle}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
        {actions}
      </div>
    </div>
  );
};

export default ProductPageHeader;
