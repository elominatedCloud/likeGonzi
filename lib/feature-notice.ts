export type DeferredFeature =
  | "notifications"
  | "signup"
  | "passwordRecovery"
  | "productTransfer"
  | "productRemoval";

const notices: Record<DeferredFeature, string> = {
  notifications: "알림 기능은 백엔드 연동 후 제공됩니다.",
  signup: "이메일 회원가입은 인증 API 연동 후 제공됩니다.",
  passwordRecovery: "비밀번호 찾기는 인증 API 연동 후 제공됩니다.",
  productTransfer: "제품 소유권 이전은 후속 기능으로 준비 중입니다.",
  productRemoval: "제품 등록 해제는 제품 관리 API 연동 후 제공됩니다.",
};

export function showFeatureNotice(feature: DeferredFeature) {
  window.alert(notices[feature]);
}
