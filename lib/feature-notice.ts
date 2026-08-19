export type DeferredFeature =
  | "notifications"
  | "signup"
  | "passwordRecovery"
  | "repairContact";

const notices: Record<DeferredFeature, string> = {
  notifications: "알림 기능은 백엔드 연동 후 제공됩니다.",
  signup: "이메일 회원가입은 인증 API 연동 후 제공됩니다.",
  passwordRecovery: "비밀번호 찾기는 인증 API 연동 후 제공됩니다.",
  repairContact: "담당 매장 문의는 운영 시스템 연동 후 제공됩니다.",
};

export function showFeatureNotice(feature: DeferredFeature) {
  window.alert(notices[feature]);
}
