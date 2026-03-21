import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function AppLoading() {
  return (
    <div className="w-full max-w-5xl space-y-4">
      <LoadingSkeleton className="h-24 rounded-[2rem]" />
      <LoadingSkeleton className="h-52 rounded-[2rem]" />
      <LoadingSkeleton className="h-32 rounded-[2rem]" />
    </div>
  );
}
