import type { Metadata, Viewport } from "next";
import { Abhaya_Libre, Cormorant_Garamond, Noto_Sans_KR } from "next/font/google";
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

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MCM · STORYBOOK",
  description: "당신의 MCM 이야기를 기록하는 Storybook",
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
    <html
      lang="ko"
      className={`${abhaya.variable} ${notoSansKr.variable} ${cormorant.variable} h-full`}
    >
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
