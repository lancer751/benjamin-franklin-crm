import { ImageOff } from "lucide-react";
import { Card } from "@/core/components/ui/card";

interface ProductCoverCardProps {
  imageUrl?: string | null;
  productName: string;
}

const ProductCoverCard = ({ imageUrl, productName }: ProductCoverCardProps) => (
  <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-sm">
    <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4">
      <h2 className="text-sm font-semibold text-slate-900">Portada comercial</h2>
    </div>
    <div className="p-4">
      <div className="flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
        {imageUrl ? (
          <img src={imageUrl} alt={`Portada de ${productName}`} className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <ImageOff size={24} />
            <span className="text-xs font-medium">Portada no disponible</span>
          </div>
        )}
      </div>
    </div>
  </Card>
);

export default ProductCoverCard;
