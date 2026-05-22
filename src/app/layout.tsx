import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 教育业务系统",
  description: "教师资格证考试培训管理后台"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
