import type { Metadata } from "next";
import "./globals.css";
import { prisma } from "@/lib/db";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";

const DEFAULT_METADATA = {
  title: "合拍吗 - 超级准的情侣契合度测试",
  description: "用科学的方式，读懂你们的爱情密码",
} as const;

/** 带超时的数据库查询，避免 DB 挂起导致整站 502 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error("Metadata DB timeout")), ms)
    ),
  ]).catch(() => null);
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await withTimeout(
      prisma.siteSettings.findFirst(),
      3000
    );
    if (!settings) {
      return DEFAULT_METADATA;
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
    return DEFAULT_METADATA;
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
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </body>
    </html>
  );
}
