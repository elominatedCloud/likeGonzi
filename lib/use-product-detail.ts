"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { toProductDetailView, type ProductDetailData } from "@/lib/api-view";
import type { Product } from "@/types";

/**
 * /api/products/{id} 를 불러온다.
 * Supabase access_token이 브라우저에만 있어서 서버 컴포넌트가 아니라 화면에서 가져온다.
 */
export function useProductDetail(productId: string) {
  const [data, setData] = useState<ProductDetailData | null>(null);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  const retry = useCallback(() => {
    setError("");
    setRetryKey((value) => value + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    apiFetch<ProductDetailData>(`/api/products/${productId}`)
      .then((json) => {
        if (cancelled) return;
        if (json.ok) {
          setData(json.data);
          setError("");
        } else {
          setError(json.error.message);
        }
      })
      .catch(() => {
        if (!cancelled) setError("네트워크 연결을 확인한 뒤 다시 시도해주세요.");
      });
    return () => {
      cancelled = true;
    };
  }, [productId, retryKey]);

  const product: Product | null = data ? toProductDetailView(data) : null;
  return { data, product, error, retry };
}
