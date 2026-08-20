"use client";

import { useEffect } from "react";

const RELOAD_FLAG = "likegonzi-chunk-reload";

/**
 * 에러가 어디에 담겨 오는지가 제각각이다.
 * - ErrorEvent.message 에만 있는 경우
 * - 던져진 값이 Error가 아닌 객체라 event.error.name / .message 에만 있는 경우
 *   (이때 String(값)은 "[object Object]"가 되어 메시지 검사만으로는 놓친다)
 * 그래서 가능한 출처를 모두 합쳐서 본다.
 */
function isChunkError(...parts: unknown[]) {
  const haystack = parts
    .map((part) => {
      if (!part) return "";
      if (typeof part === "string") return part;
      const value = part as { name?: string; message?: string };
      return `${value.name ?? ""} ${value.message ?? ""}`;
    })
    .join(" ");
  return /ChunkLoadError|Failed to load chunk|Loading chunk .* failed|Loading CSS chunk/i.test(
    haystack,
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

    const recover = (...parts: unknown[]) => {
      if (!isChunkError(...parts)) return;
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
      recover(event.message, event.error);
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      recover(event.reason);
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
