import React from "react";

interface DiscountBadgeProps {
  title: string;
  price: string;
  icon: React.ComponentType<any>;
  bgColor: string;
  borderColor: string;
  textColor: string;
  iconColor: string;
}

const DiscountBadge = ({ 
  title, 
  price, 
  icon: Icon, 
  bgColor, 
  borderColor, 
  textColor, 
  iconColor 
}: DiscountBadgeProps) => {
  return (
    <div className={`${bgColor} p-4.5 rounded-xl border ${borderColor} flex items-center justify-between transition-all duration-200 hover:scale-[1.02] shadow-xs`}>
      <div className="flex items-center gap-2">
        <Icon size={14} className={iconColor} />
        <span className={`text-[9px] font-bold uppercase tracking-wider ${textColor}`}>{title}</span>
      </div>
      <span className={`font-black text-xs ${textColor}`}>{price}</span>
    </div>
  );
};

export default DiscountBadge;
