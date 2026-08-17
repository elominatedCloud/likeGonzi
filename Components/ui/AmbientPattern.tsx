"use client";

import { useEffect, useRef, type CSSProperties } from "react";

type AmbientPatternVariant = "home" | "product" | "log" | "generic";
type Point = readonly [number, number];
type Curve = readonly [Point, Point, Point, Point];

const MOTIFS = [
  [13, 8], [46, 8], [79, 8],
  [27, 20], [61, 20], [94, 20],
  [13, 33], [46, 33], [79, 33],
  [27, 46], [61, 46], [94, 46],
  [13, 59], [46, 59], [79, 59],
  [27, 72], [61, 72], [94, 72],
  [13, 85], [46, 85], [79, 85],
  [27, 97], [61, 97], [94, 97],
] as const;

const CURVES: readonly Curve[] = [
  [[-0.14, 0.82], [0.2, 0.62], [0.33, 0.72], [1.14, 0.18]],
  [[1.12, 0.68], [0.76, 0.48], [0.42, 0.2], [-0.12, 0.34]],
  [[-0.12, 0.2], [0.28, 0.05], [0.7, 0.58], [1.12, 0.48]],
  [[0.84, 1.12], [0.62, 0.78], [0.28, 0.46], [0.16, -0.12]],
];

const ROUTE_OFFSET: Record<AmbientPatternVariant, number> = {
  home: 0,
  product: 1,
  log: 2,
  generic: 3,
};

const TRAVEL_TIMES = [8200, 9600, 7600, 10400] as const;
const REST_TIMES = [2800, 4300, 3400, 5200] as const;

function cubicPoint(curve: Curve, progress: number) {
  const inverse = 1 - progress;
  const [p0, p1, p2, p3] = curve;
  const x =
    inverse ** 3 * p0[0] +
    3 * inverse ** 2 * progress * p1[0] +
    3 * inverse * progress ** 2 * p2[0] +
    progress ** 3 * p3[0];
  const y =
    inverse ** 3 * p0[1] +
    3 * inverse ** 2 * progress * p1[1] +
    3 * inverse * progress ** 2 * p2[1] +
    progress ** 3 * p3[1];
  const dx =
    3 * inverse ** 2 * (p1[0] - p0[0]) +
    6 * inverse * progress * (p2[0] - p1[0]) +
    3 * progress ** 2 * (p3[0] - p2[0]);
  const dy =
    3 * inverse ** 2 * (p1[1] - p0[1]) +
    6 * inverse * progress * (p2[1] - p1[1]) +
    3 * progress ** 2 * (p3[1] - p2[1]);
  const length = Math.hypot(dx, dy) || 1;

  return { x, y, tangentX: dx / length, tangentY: dy / length };
}

function resetMotifs(motifs: HTMLElement[], hidden = false) {
  motifs.forEach((motif) => {
    motif.style.opacity = hidden ? "0" : "0.08";
    motif.style.transform = "translate3d(0, 0, 0) rotate(0deg) scale(1)";
    motif.style.removeProperty("--wind-energy");
  });
}

export function AmbientPattern({
  variant = "generic",
}: {
  variant?: AmbientPatternVariant;
}) {
  const fieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;

    const motifs = Array.from(
      field.querySelectorAll<HTMLElement>("[data-wind-motif]"),
    );
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let routeStep = ROUTE_OFFSET[variant];
    let cycleStartedAt = performance.now();

    const animate = (now: number) => {
      if (reducedMotion.matches) {
        resetMotifs(motifs, true);
        return;
      }

      const routeIndex = routeStep % CURVES.length;
      const travelTime = TRAVEL_TIMES[routeIndex];
      const restTime = REST_TIMES[routeIndex];
      const elapsed = now - cycleStartedAt;

      if (elapsed >= travelTime + restTime) {
        routeStep += 1;
        cycleStartedAt = now;
        frame = requestAnimationFrame(animate);
        return;
      }

      const rect = field.getBoundingClientRect();
      const isTravelling = elapsed < travelTime;
      const progress = Math.min(elapsed / travelTime, 1);
      const wind = cubicPoint(CURVES[routeIndex], progress);
      const windX = wind.x * rect.width;
      const windY = wind.y * rect.height;
      const radius = Math.min(112, rect.width * 0.27);
      const edgeFade = Math.min(1, progress / 0.08, (1 - progress) / 0.08);

      motifs.forEach((motif, index) => {
        const anchorX = (Number(motif.dataset.windX) / 100) * rect.width;
        const anchorY = (Number(motif.dataset.windY) / 100) * rect.height;
        const distance = Math.hypot(anchorX - windX, anchorY - windY);
        const proximity = isTravelling ? Math.max(0, 1 - distance / radius) : 0;
        const smoothProximity = proximity * proximity * (3 - 2 * proximity);
        const energy = smoothProximity * Math.max(0, edgeFade);
        const flutter = Math.sin(now * 0.019 + index * 1.73) * energy;
        const push = energy * (6.5 + (index % 3) * 0.9);
        const shiftX = wind.tangentX * push - wind.tangentY * flutter * 2.1;
        const shiftY = wind.tangentY * push + wind.tangentX * flutter * 2.1;
        const rotation = energy * (wind.tangentY * 7 + flutter * 5);
        const scaleX = 1 + energy * 0.09;
        const scaleY = 1 - energy * 0.035;

        motif.style.setProperty("--wind-energy", energy.toFixed(3));
        motif.style.opacity = (0.08 + energy * 0.5).toFixed(3);
        motif.style.transform = `translate3d(${shiftX.toFixed(2)}px, ${shiftY.toFixed(2)}px, 0) rotate(${rotation.toFixed(2)}deg) scale(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)})`;
      });

      frame = requestAnimationFrame(animate);
    };

    const handleMotionPreference = () => {
      cancelAnimationFrame(frame);
      resetMotifs(motifs, reducedMotion.matches);
      if (!reducedMotion.matches) {
        cycleStartedAt = performance.now();
        frame = requestAnimationFrame(animate);
      }
    };

    reducedMotion.addEventListener("change", handleMotionPreference);
    handleMotionPreference();

    return () => {
      cancelAnimationFrame(frame);
      reducedMotion.removeEventListener("change", handleMotionPreference);
    };
  }, [variant]);

  return (
    <div
      ref={fieldRef}
      className={`ambient-pattern ambient-pattern--${variant}`}
      aria-hidden="true"
    >
      {MOTIFS.map(([x, y], index) => (
        <span
          key={`${x}-${y}`}
          className="ambient-wind-motif"
          data-wind-motif
          data-wind-x={x}
          data-wind-y={y}
          style={
            {
              left: `${x}%`,
              top: `${y}%`,
              "--motif-scale": index % 5 === 0 ? 1.12 : index % 3 === 0 ? 0.9 : 1,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
