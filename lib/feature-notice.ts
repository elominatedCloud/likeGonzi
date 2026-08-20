export type DeferredFeature =
  | "notifications"
  | "signup"
  | "passwordRecovery"
  | "repairContact";

const notices: Record<DeferredFeature, string> = {
  notifications: "알림 기능은 준비 중입니다.",
  signup: "이메일 회원가입은 인증 API 연동 후 제공됩니다.",
  passwordRecovery: "비밀번호 찾기는 인증 API 연동 후 제공됩니다.",
  repairContact: "담당 매장 문의는 운영 시스템 연동 후 제공됩니다.",
};

let notificationToastTimer: number | undefined;

function showNotificationToast(message: string) {
  const previous = document.getElementById("feature-notification-toast");
  previous?.remove();
  if (notificationToastTimer) window.clearTimeout(notificationToastTimer);

  const toast = document.createElement("div");
  toast.id = "feature-notification-toast";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.textContent = message;
  Object.assign(toast.style, {
    position: "fixed",
    left: "50%",
    bottom: "84px",
    zIndex: "9999",
    transform: "translateX(-50%)",
    width: "max-content",
    maxWidth: "calc(100vw - 40px)",
    padding: "11px 16px",
    borderRadius: "999px",
    background: "#2d1f11",
    color: "#fff",
    boxShadow: "0 6px 22px rgba(45, 31, 17, 0.24)",
    fontSize: "13px",
    fontWeight: "700",
    textAlign: "center",
  });
  document.body.appendChild(toast);
  notificationToastTimer = window.setTimeout(() => toast.remove(), 2200);
}

export function showFeatureNotice(feature: DeferredFeature) {
  if (feature === "notifications") {
    showNotificationToast(notices[feature]);
    return;
  }
  window.alert(notices[feature]);
}
