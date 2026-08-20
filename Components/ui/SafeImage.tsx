"use client";

import { useState } from "react";
import NextImage, { type ImageProps } from "next/image";
import { IMG } from "@/lib/images";

type Props = Omit<ImageProps, "src"> & { src?: string | null };

export function SafeImage({ src, alt, ...rest }: Props) {
  const [failed, setFailed] = useState(false);
  const resolved = !src || failed ? IMG.fallback : src;
  const skipOptimize =
    resolved.startsWith("/") ||
    resolved.startsWith("data:") ||
    resolved.startsWith("blob:") ||
    // Supabase Storage 서명 URL. 토큰이 만료마다 바뀌어 최적화 캐시가 매번 미스라
    // 최적화해봐야 손해고, next.config의 remotePatterns에도 없어서 차단당한다.
    resolved.includes("/storage/v1/object/sign/") ||
    Boolean(rest.unoptimized);

  return (
    <NextImage
      {...rest}
      src={resolved}
      alt={alt}
      unoptimized={skipOptimize}
      onError={() => setFailed(true)}
    />
  );
}
