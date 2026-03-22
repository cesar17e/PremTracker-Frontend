import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

type SectionSkeletonsProps = {
  sections: string[];
  className?: string;
};

export function SectionSkeletons({
  sections,
  className = "",
}: SectionSkeletonsProps) {
  return (
    <div className={`w-full max-w-5xl space-y-4 ${className}`.trim()}>
      {sections.map((height, index) => (
        <LoadingSkeleton key={`${height}-${index}`} className={`${height} rounded-[2rem]`} />
      ))}
    </div>
  );
}
