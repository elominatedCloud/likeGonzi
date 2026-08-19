"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Camera,
  FileText,
  Home,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { MCM_OFFICIAL_SHOP_URL } from "@/lib/navigation";

const items = [
  { href: "/home", label: "홈", icon: Home },
  { href: "/log/timeline", label: "로그", icon: FileText },
  { href: "/camera", label: "카메라", icon: Camera, fab: true },
  // 쇼핑은 앱 내부 기능이 아니라 MCM 공식몰로 바로 나간다.
  { href: MCM_OFFICIAL_SHOP_URL, label: "쇼핑", icon: ShoppingBag, external: true },
  { href: "/my", label: "마이", icon: UserRound },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 w-full -translate-x-1/2 border-t border-black/5 bg-paper/95 backdrop-blur-md"
      style={{
        maxWidth: "var(--app-frame)",
        // iOS 홈 인디케이터에 가리지 않도록
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <ul className="grid min-h-[var(--nav-height)] grid-cols-5 items-end px-2 pb-2 pt-1">
        {items.map((item) => {
          const active =
            item.external
              ? false
              : item.href === "/home"
                ? pathname === "/home"
                : item.href === "/log/timeline"
                  ? pathname.startsWith("/log")
                  : pathname.startsWith(item.href);
          const Icon = item.icon;

          if (item.fab) {
            return (
              <li key={item.href} className="flex justify-center">
                <Link
                  href={item.href}
                  className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-cognac-deep text-white shadow-[0_10px_24px_rgba(110,67,44,0.35)]"
                  aria-label="카메라"
                  aria-current={active ? "page" : undefined}
                >
                  <Icon size={22} strokeWidth={1.6} />
                </Link>
              </li>
            );
          }

          const className = cn(
            "flex flex-col items-center gap-1 py-1 text-[11px]",
            active ? "text-ink" : "text-muted",
          );

          if (item.external) {
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className={className}
                >
                  <Icon size={20} strokeWidth={1.5} />
                  <span>{item.label}</span>
                </a>
              </li>
            );
          }

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={className}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={20} strokeWidth={active ? 2 : 1.5} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
