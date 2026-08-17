import { SafeImage } from "@/Components/ui/SafeImage";

export function ProductMiniCard({
  name,
  color,
  image,
}: {
  name: string;
  color: string;
  image: string;
}) {
  return (
    <div className="soft-card mx-4 mt-2 flex items-center gap-3 px-3 py-3">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-cream-deep">
        <SafeImage src={image} alt={name} fill className="object-contain p-1" sizes="56px" />
      </div>
      <div>
        <p className="text-[15px] font-semibold text-ink">{name}</p>
        <p className="mt-0.5 text-[11px] tracking-wide text-muted">
          {color.toUpperCase()}
        </p>
      </div>
    </div>
  );
}
