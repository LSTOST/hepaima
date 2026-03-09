import type { Metadata } from "next";
import "./globals.css";
import { prisma } from "@/lib/db";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await prisma.siteSettings.findFirst();
    if (!settings) {
      return {
        title: "合拍吗 - 超级准的情侣契合度测试",
        description: "用科学的方式，读懂你们的爱情密码",
      };
    }
    return {
      title:
        settings.seoTitle ??
        `${settings.siteName} - ${settings.siteSubtitle ?? "基于心理学的关系测评工具"}`,
      description:
        settings.seoDescription ??
        "用科学的方式，读懂你们的爱情密码",
      keywords: settings.seoKeywords ?? undefined,
      openGraph: {
        title:
          settings.seoTitle ??
          `${settings.siteName} - ${settings.siteSubtitle ?? "基于心理学的关系测评工具"}`,
        description:
          settings.seoDescription ??
          "用科学的方式，读懂你们的爱情密码",
        images: settings.ogImageUrl ? [settings.ogImageUrl] : undefined,
      },
    };
  } catch {
    return {
      title: "合拍吗 - 超级准的情侣契合度测试",
      description: "用科学的方式，读懂你们的爱情密码",
    };
  }
}

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
