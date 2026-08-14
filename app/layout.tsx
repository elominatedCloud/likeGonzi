import type { Metadata } from "next";
import { Abhaya_Libre, Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const abhaya = Abhaya_Libre({
  weight: "600",
  subsets: ["latin"],
  variable: "--font-abhaya",
  display: "swap",
});

const notoSansKr = Noto_Sans_KR({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-noto-sans-kr",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MCM Storybook",
  description: "당신의 MCM 이야기를 기록하는 Storybook",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${abhaya.variable} ${notoSansKr.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}