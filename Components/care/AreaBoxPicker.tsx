"use client";

import { SafeImage } from "@/Components/ui/SafeImage";
import { cn } from "@/lib/cn";
import { AREA_TAGS, UNPLACED_AREA_IDS, areaLabel, getAreaBoxes } from "@/lib/repair";

interface AreaBoxPickerProps {
  /** 제품 실사. product_units.cutout_image 를 받는다. */
  image: string;
  /** 좌표 한 벌을 고르는 키(slug/id). */
  productKey?: string;
  value: string;
  onChange: (areaId: string) => void;
}

/**
 * 제품 실사 위에 수선 부위를 박스로 얹어 고르게 한다.
 * 좌표가 %라 반응형에서 그대로 스케일된다.
 */
export function AreaBoxPicker({ image, productKey, value, onChange }: AreaBoxPickerProps) {
  const boxes = getAreaBoxes(productKey);
  const unplaced = AREA_TAGS.filter((t) => UNPLACED_AREA_IDS.includes(t.id));
  const picked = boxes.some((b) => b.id === value);

  return (
    <div>
      <div className="soft-card relative aspect-square w-full overflow-hidden">
        {/* 이미지와 박스가 같은 정사각 좌표계를 쓴다.
            컨테이너에 패딩을 주면 둘이 어긋나므로 안쪽 래퍼로 함께 줄인다. */}
        <div className="absolute inset-[5%]">
        <SafeImage src={image} alt="" fill className="object-contain" unoptimized />

        {boxes.map((box) => {
          const on = value === box.id;
          return (
            <button
              key={box.id}
              type="button"
              aria-pressed={on}
              aria-label={`수선 부위 ${areaLabel(box.id)}`}
              onClick={() => onChange(box.id)}
              style={{
                left: `${box.x}%`,
                top: `${box.y}%`,
                width: `${box.w}%`,
                height: `${box.h}%`,
              }}
              className={cn(
                "absolute rounded-[5px] border transition-all",
                on
                  ? "border-2 border-cognac bg-cognac/20 ring-[3px] ring-cognac/20"
                  : "border-cognac/40 bg-cognac/[0.07] hover:border-cognac/70 hover:bg-cognac/15",
                picked && !on && "opacity-30",
              )}
            >
              <span
                className={cn(
                  "absolute -top-2.5 left-1 whitespace-nowrap rounded-full border border-cognac/50",
                  "bg-paper px-1.5 py-px text-[10px] font-medium text-ink transition-opacity",
                  on ? "opacity-100" : "opacity-0",
                )}
              >
                {areaLabel(box.id)}
              </span>
            </button>
          );
        })}
        </div>
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-muted">
        {picked
          ? `${areaLabel(value)} 선택됨. 다른 부위를 누르면 바뀝니다.`
          : "그림에서 수선할 부위를 눌러주세요."}
      </p>

      {unplaced.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {unplaced.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => onChange(tag.id)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-[13px]",
                value === tag.id
                  ? "border-ink bg-ink text-white"
                  : "border-black/15 bg-white/70 text-ink-soft",
              )}
            >
              {tag.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
