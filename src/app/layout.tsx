import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "合拍吗 - 超级准的情侣契合度测试",
  description: "用科学的方式，读懂你们的爱情密码",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
