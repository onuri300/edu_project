import type { Metadata } from "next";
import "./globals.css";
import "./editorial.css";

export const metadata: Metadata = {
  title: "메이킹 수업 스튜디오",
  description: "수업 계획, 최신 뉴스, 교안과 실제 수업일지를 한곳에서 관리합니다.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" data-studio-theme="mocha" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
