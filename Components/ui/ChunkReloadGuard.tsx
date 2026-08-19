"use client";

import { useEffect } from "react";

const RELOAD_FLAG = "likegonzi-chunk-reload";

function isChunkError(message: string) {
  return /ChunkLoadError|Failed to load chunk|Loading chunk .* failed|Loading CSS chunk/i.test(
    message,
  );
}

/**
 * 배포 직후 청크 404 자동 복구.
 *
 * 앱을 열어둔 채로 새 버전이 배포되면, 클라이언트 라우팅이 이전 빌드의 청크를
 * 요청하다가 404를 맞고 화면이 통째로 깨진다("This page couldn't load").
 * 사용자는 원인을 알 수 없으므로 한 번만 자동으로 새로고침해서 최신 빌드를 받게 한다.
 *
 * 무한 새로고침을 막기 위해 sessionStorage 플래그를 쓴다.
 * 새로고침이 성공해 이 컴포넌트가 다시 마운트되면 플래그를 지우므로,
 * 다음 배포 때도 한 번은 다시 복구할 수 있다.
 */
export function ChunkReloadGuard() {
  useEffect(() => {
    // 여기까지 왔다는 건 앱이 정상적으로 떴다는 뜻이다.
    try {
      sessionStorage.removeItem(RELOAD_FLAG);
    } catch {}

    const recover = (message: string) => {
      if (!isChunkError(message)) return;
      try {
        // 새로고침해도 계속 실패하면 더 시도하지 않는다. 무한 루프 방지.
        if (sessionStorage.getItem(RELOAD_FLAG)) return;
        sessionStorage.setItem(RELOAD_FLAG, "1");
      } catch {
        return;
      }
      window.location.reload();
    };

    const onError = (event: ErrorEvent) => {
      recover(event.message || String(event.error ?? ""));
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason as { name?: string; message?: string } | undefined;
      recover(`${reason?.name ?? ""} ${reason?.message ?? String(reason ?? "")}`);
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
