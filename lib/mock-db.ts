/**
 * MVP 인메모리 DB — Supabase 연결 전 멋사 엔드포인트 검수용
 */

import { IMG } from "@/lib/images";

export type Membership = "SILVER" | "GOLD" | "PLATINUM";

export interface DbUser {
  id: string;
  email: string;
  password: string;
  display_name: string;
  membership: Membership;
  birthday: string | null;
  lifestyle_chips: string[];
  cleaning_coupons: number;
  repair_vouchers: number;
}

export interface DbProduct {
  id: string;
  name: string;
  model_no: string;
  serial: string;
  tag_code: string;
  material: string;
  color: string;
  year: number;
  store: string;
  cutout_image: string;
  care_score: number;
  repair_vouchers: number;
  cleaning_vouchers: number;
}

export interface Ownership {
  user_id: string;
  product_id: string;
  registered_at: string;
}

export type RepairStatus = "submitted" | "in_progress" | "completed" | "cancelled";

export interface DbRepair {
  id: string;
  product_id: string;
  title: string;
  location: string;
  thumbnail_url: string;
  source: "store" | "ai_custom" | "user";
  status: RepairStatus;
  condition_tags: string[];
  receipt_no: string;
  memo?: string;
  ai_image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface TransferRequest {
  id: string;
  product_id: string;
  from_user_id: string;
  to_email: string;
  direction: "sent" | "received";
  status: "pending" | "completed" | "cancelled";
  created_at: string;
}

const g = globalThis as typeof globalThis & {
  __likegonziDb?: {
    users: DbUser[];
    products: DbProduct[];
    ownerships: Ownership[];
    repairs: DbRepair[];
    transfers: TransferRequest[];
    sessions: Map<string, string>;
  };
};

function db() {
  if (!g.__likegonziDb) {
    g.__likegonziDb = {
      users: [
        {
          id: "user-gonji",
          email: "gonji@mcm.test",
          password: "password123",
          display_name: "곤지",
          membership: "GOLD",
          birthday: "1996-09-02",
          lifestyle_chips: ["출장", "도시 여행", "아트 워크", "주말 산책"],
          cleaning_coupons: 1,
          repair_vouchers: 1,
        },
      ],
      products: [
        {
          id: "stark",
          name: "Stark Backpack",
          model_no: "MWKCSVE01C",
          serial: "MWKCSVE01C0001",
          tag_code: "UNIT-STARK-0001",
          material: "Visetos",
          color: "Cognac",
          year: 2024,
          store: "MCM Seoul",
          cutout_image: IMG.stark,
          care_score: 92,
          repair_vouchers: 1,
          cleaning_vouchers: 1,
        },
        {
          id: "ella",
          name: "Ella Boston Bag",
          model_no: "MWEBSVE01B",
          serial: "MWEBSVE01B0002",
          tag_code: "UNIT-ELLA-0002",
          material: "Visetos leather",
          color: "Black",
          year: 2023,
          store: "MCM Gangnam",
          cutout_image: IMG.ella,
          care_score: 88,
          repair_vouchers: 0,
          cleaning_vouchers: 1,
        },
        {
          id: "pina",
          name: "Pina Studded Wallet",
          model_no: "MWPINA01",
          serial: "MWPINA01C0003",
          tag_code: "UNIT-PINA-0003",
          material: "Calfskin",
          color: "Black",
          year: 2025,
          store: "MCM Seoul",
          cutout_image: IMG.pina,
          care_score: 90,
          repair_vouchers: 1,
          cleaning_vouchers: 0,
        },
        {
          id: "campaign-only",
          name: "Stark Side Studs (Campaign)",
          model_no: "MWKCCAMP01",
          serial: "MWKCCAMP01X999",
          tag_code: "CAMP-STARK-999",
          material: "Visetos",
          color: "Cognac",
          year: 2026,
          store: "Campaign",
          cutout_image: IMG.stark,
          care_score: 100,
          repair_vouchers: 0,
          cleaning_vouchers: 0,
        },
      ],
      ownerships: [
        {
          user_id: "user-gonji",
          product_id: "stark",
          registered_at: "2024-05-12T00:00:00.000Z",
        },
        {
          user_id: "user-gonji",
          product_id: "ella",
          registered_at: "2023-11-08T00:00:00.000Z",
        },
        {
          user_id: "user-other",
          product_id: "campaign-only",
          registered_at: "2026-01-01T00:00:00.000Z",
        },
      ],
      repairs: [
        {
          id: "repair-1",
          product_id: "stark",
          title: "오른쪽 숄더 스트랩 교체",
          location: "강남 플래그십 스토어",
          thumbnail_url: IMG.strap,
          source: "store",
          status: "completed",
          condition_tags: ["strap", "wear"],
          receipt_no: "R-20260512-001",
          ai_image_url: IMG.strap,
          created_at: "2026-05-12T00:00:00.000Z",
          updated_at: "2026-05-20T00:00:00.000Z",
        },
        {
          id: "repair-2",
          product_id: "stark",
          title: "오른쪽 숄더 스트랩 보강",
          location: "AI 커스텀 진단",
          thumbnail_url: IMG.strap,
          source: "ai_custom",
          status: "submitted",
          condition_tags: ["strap", "wear"],
          receipt_no: "R-20240816-014",
          ai_image_url: IMG.strap,
          created_at: "2026-06-01T00:00:00.000Z",
          updated_at: "2026-08-10T00:00:00.000Z",
        },
        {
          id: "repair-3",
          product_id: "ella",
          title: "코너 마모 보강 접수",
          location: "접수 대기",
          thumbnail_url: IMG.ella,
          source: "user",
          status: "submitted",
          condition_tags: ["corner", "wear"],
          receipt_no: "R-20260812-008",
          created_at: "2026-08-12T00:00:00.000Z",
          updated_at: "2026-08-12T00:00:00.000Z",
        },
      ],
      transfers: [
        {
          id: "tr-1",
          product_id: "ella",
          from_user_id: "user-gonji",
          to_email: "friend@mcm.test",
          direction: "sent",
          status: "pending",
          created_at: "2026-08-01T00:00:00.000Z",
        },
      ],
      sessions: new Map(),
    };
  }
  return g.__likegonziDb;
}

/** FE alias: stark-backpack → stark */
export function normalizeProductId(id: string) {
  const map: Record<string, string> = {
    "stark-backpack": "stark",
    "ella-boston": "ella",
  };
  return map[id] ?? id;
}

export function getUserByEmail(email: string) {
  return db().users.find((u) => u.email === email) ?? null;
}

export function getUserById(id: string) {
  return db().users.find((u) => u.id === id) ?? null;
}

export function createUser(input: {
  email: string;
  password: string;
  display_name: string;
  birthday?: string;
  lifestyle_chips?: string[];
}) {
  if (getUserByEmail(input.email)) return null;
  const user: DbUser = {
    id: `user-${Date.now()}`,
    email: input.email,
    password: input.password,
    display_name: input.display_name,
    membership: "SILVER",
    birthday: input.birthday ?? null,
    lifestyle_chips: input.lifestyle_chips ?? [],
    cleaning_coupons: 0,
    repair_vouchers: 0,
  };
  db().users.push(user);
  return user;
}

export function createSession(userId: string) {
  const token = `tok_${userId}_${Date.now()}`;
  db().sessions.set(token, userId);
  return token;
}

export function userFromAuthHeader(header: string | null) {
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice(7);
  const userId = db().sessions.get(token);
  return userId ? getUserById(userId) : null;
}

export function getProduct(productId: string) {
  const id = normalizeProductId(productId);
  return db().products.find((p) => p.id === id) ?? null;
}

export function getProductByTag(tagCode: string) {
  return db().products.find((p) => p.tag_code === tagCode) ?? null;
}

export function getOwnershipStatus(userId: string, productId: string) {
  const id = normalizeProductId(productId);
  const owner = db().ownerships.find((o) => o.product_id === id);
  if (!owner) return "unregistered" as const;
  if (owner.user_id === userId) return "owned_by_me" as const;
  return "owned_by_other" as const;
}

export function isOwnedBy(userId: string, productId: string) {
  return getOwnershipStatus(userId, productId) === "owned_by_me";
}


export function listMyProducts(userId: string) {
  return db()
    .ownerships.filter((o) => o.user_id === userId)
    .map((o) => {
      const p = getProduct(o.product_id)!;
      return {
        ...p,
        registered_at: o.registered_at,
        is_favorite: o.product_id === "stark",
      };
    });
}

export function registerProduct(userId: string, productId: string) {
  const id = normalizeProductId(productId);
  const product = getProduct(id);
  if (!product) return { error: "PRODUCT_NOT_FOUND" as const };
  const status = getOwnershipStatus(userId, id);
  if (status === "owned_by_me") return { error: "ALREADY_REGISTERED" as const };
  if (status === "owned_by_other") return { error: "OWNED_BY_OTHER" as const };
  const ownership: Ownership = {
    user_id: userId,
    product_id: id,
    registered_at: new Date().toISOString(),
  };
  db().ownerships.push(ownership);
  return { ownership, product };
}

export function unregisterProduct(userId: string, productId: string) {
  const id = normalizeProductId(productId);
  const list = db().ownerships;
  const idx = list.findIndex(
    (o) => o.user_id === userId && o.product_id === id,
  );
  if (idx < 0) return false;
  list.splice(idx, 1);
  return true;
}

export function listRepairs(productId: string) {
  const id = normalizeProductId(productId);
  return db()
    .repairs.filter((r) => r.product_id === id)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export function getRepair(productId: string, repairId: string) {
  const id = normalizeProductId(productId);
  return (
    db().repairs.find((r) => r.id === repairId && r.product_id === id) ?? null
  );
}

export function listMyRepairs(userId: string) {
  const owned = new Set(listMyProducts(userId).map((p) => p.id));
  return db()
    .repairs.filter((r) => owned.has(r.product_id))
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export function createRepair(
  productId: string,
  body: {
    title?: string;
    condition_tags?: string[];
    location?: string;
    thumbnail_url?: string;
    source?: DbRepair["source"];
    ai_image_url?: string;
    memo?: string;
  },
) {
  const id = normalizeProductId(productId);
  if (!getProduct(id)) return null;
  const now = new Date().toISOString();
  const ymd = now.slice(0, 10).replaceAll("-", "");
  const seq = String(db().repairs.length + 1).padStart(3, "0");
  const repair: DbRepair = {
    id: `repair-${Date.now()}`,
    product_id: id,
    title: body.title ?? "수선 접수",
    location: body.location ?? "접수 대기",
    thumbnail_url: body.thumbnail_url ?? IMG.strap,
    source: body.source ?? "user",
    status: "submitted",
    condition_tags: body.condition_tags ?? [],
    receipt_no: `R-${ymd}-${seq}`,
    memo: body.memo,
    ai_image_url: body.ai_image_url,
    created_at: now,
    updated_at: now,
  };
  db().repairs.unshift(repair);
  return repair;
}

export function listTransfers(userId: string) {
  return db().transfers.filter(
    (t) =>
      t.from_user_id === userId ||
      (t.direction === "received" && t.to_email === getUserById(userId)?.email),
  );
}

export function createTransfer(input: {
  userId: string;
  product_id: string;
  to_email: string;
}) {
  const id = normalizeProductId(input.product_id);
  if (!getProduct(id)) return null;
  if (!isOwnedBy(input.userId, id)) return null;
  const tr: TransferRequest = {
    id: `tr-${Date.now()}`,
    product_id: id,
    from_user_id: input.userId,
    to_email: input.to_email,
    direction: "sent",
    status: "pending",
    created_at: new Date().toISOString(),
  };
  db().transfers.unshift(tr);
  return tr;
}

export function buildHome(userId: string) {
  const user = getUserById(userId)!;
  const myProducts = listMyProducts(userId);
  const primary = myProducts[0];

  const birthday = user.birthday ? new Date(user.birthday) : null;
  let dDay = 12;
  if (birthday) {
    const now = new Date();
    const next = new Date(now.getFullYear(), birthday.getMonth(), birthday.getDate());
    if (next < now) next.setFullYear(now.getFullYear() + 1);
    dDay = Math.ceil((next.getTime() - now.getTime()) / 86400000);
  }

  return {
    user: {
      id: user.id,
      display_name: user.display_name,
      membership: user.membership,
      lifestyle_chips: user.lifestyle_chips,
    },
    products: myProducts,
    care_reminder: primary
      ? {
          season: "MONSOON",
          material: primary.material,
          title: `${primary.material} 캔버스, 습도 케어가 필요해요`,
          ventilation: 40,
          product_id: primary.id,
        }
      : null,
    benefit: {
      tier: user.membership,
      title: "생일 혜택이 곧 도착해요",
      detail: `클리닝 쿠폰 ${user.cleaning_coupons} · 등급 혜택 보기`,
      d_day: dDay,
      cleaning_coupons: user.cleaning_coupons,
    },
    lifestyle_suggestions: {
      chips: user.lifestyle_chips.slice(0, 3),
      ai_storybook: {
        title: "서울의 7월, 영상으로 다시 만나기",
        cta: "PLAY",
      },
    },
    esg: {
      label: "VISION 2030",
      title: "오래 쓰는 럭셔리가 곧 ESG",
      description:
        "수선·클리닝·소유권 이전으로 제품 수명을 늘려 MCM의 순환 가치를 실천해요.",
    },
  };
}

export function publicUser(user: DbUser) {
  return {
    id: user.id,
    email: user.email,
    display_name: user.display_name,
    membership: user.membership,
    birthday: user.birthday,
    lifestyle_chips: user.lifestyle_chips,
  };
}
