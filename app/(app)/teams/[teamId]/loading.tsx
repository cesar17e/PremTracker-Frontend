import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function TeamDetailLoading() {
  return (
    <div className="w-full max-w-6xl space-y-5">
      <LoadingSkeleton className="h-10 w-32 rounded-full" />
      <LoadingSkeleton className="h-52 rounded-[1.8rem]" />
      <LoadingSkeleton className="h-12 rounded-[1.4rem]" />
      <LoadingSkeleton className="h-72 rounded-[1.8rem]" />
    </div>
  );
}
