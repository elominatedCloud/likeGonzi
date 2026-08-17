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
