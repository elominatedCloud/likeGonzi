import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MCM Storybook",
  description: "MCM Storybook log experience demo",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
