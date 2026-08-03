import { Skeleton } from "@/core/components/ui/skeleton";

export function SellerDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 sm:p-6">
      <Skeleton className="h-4 w-44" />
      <Skeleton className="h-28 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-28 rounded-xl" />)}
      </div>
      <Skeleton className="h-28 w-full rounded-2xl" />
      <div className="grid gap-4 lg:grid-cols-2"><Skeleton className="h-72 rounded-xl" /><Skeleton className="h-72 rounded-xl" /></div>
    </div>
  );
}
