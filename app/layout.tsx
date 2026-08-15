import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
});

export const metadata: Metadata = {
  title: "MCM · STORYBOOK",
  description: "합리적인 럭셔리 아카이브 — MCM 제품 케어와 스토리",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#f6f2ec",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${cormorant.variable} h-full`}>
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body
        className="min-h-full antialiased"
        style={{ fontFamily: "Pretendard, Apple SD Gothic Neo, sans-serif" }}
      >
        <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-cream shadow-[0_0_60px_rgba(43,33,28,0.12)]">
          {children}
        </div>
      </body>
    </html>
  );
}
