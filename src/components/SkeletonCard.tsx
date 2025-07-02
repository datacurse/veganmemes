import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCard() {
  return (
    <div className="relative rounded-2xl bg-muted animate-pulse">
      {/* Image placeholder */}
      <Skeleton className="w-full h-64 rounded-2xl" />

      {/* Bottom overlay placeholder */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between items-center p-2 bg-gradient-to-t from-black/50 to-transparent">
        {/* Copy + Download buttons placeholders */}
        <div className="flex gap-1">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>

        {/* Like count and button placeholders */}
        <div className="flex items-center gap-1">
          <Skeleton className="h-4 w-6 rounded" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}