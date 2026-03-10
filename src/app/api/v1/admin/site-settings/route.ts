import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

async function getOrCreateSiteSettings() {
  const existing = await prisma.siteSettings.findFirst();
  if (existing) return existing;
  // 创建一条默认配置，避免前端拿不到数据
  return prisma.siteSettings.create({
    data: {
      siteName: "合拍吗",
      siteSubtitle: "基于心理学的关系测评工具",
      primaryColor: "#EC4899",
      secondaryColor: "#8B5CF6",
      seoTitle: "合拍吗 - 超级准的情侣契合度测试",
      seoDescription: "用科学的方式，读懂你们的爱情密码",
    },
  });
}

export async function GET(req: NextRequest) {
  const err = requireAdmin(req);
  if (err) return err;

  try {
    const settings = await getOrCreateSiteSettings();
    return NextResponse.json(settings);
  } catch (e) {
    const errObj = e instanceof Error ? e : new Error(String(e));
    console.error("GET /api/v1/admin/site-settings error:", errObj);
    return NextResponse.json(
      {
        message: "获取站点设置失败",
        hint: "请检查数据库连接与是否已执行 prisma 迁移",
      },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  const err = requireAdmin(req);
  if (err) return err;

  try {
    const body = await req.json();
    const current = await getOrCreateSiteSettings();

    const updated = await prisma.siteSettings.update({
      where: { id: current.id },
      data: {
        siteName: body.siteName ?? current.siteName,
        siteSubtitle: body.siteSubtitle ?? current.siteSubtitle,
        primaryColor: body.primaryColor ?? current.primaryColor,
        secondaryColor: body.secondaryColor ?? current.secondaryColor,
        logoUrl: body.logoUrl ?? current.logoUrl,
        faviconUrl: body.faviconUrl ?? current.faviconUrl,
        seoTitle: body.seoTitle ?? current.seoTitle,
        seoDescription: body.seoDescription ?? current.seoDescription,
        seoKeywords: body.seoKeywords ?? current.seoKeywords,
        ogImageUrl: body.ogImageUrl ?? current.ogImageUrl,
        icpRecord: body.icpRecord ?? current.icpRecord,
        footerHtml: body.footerHtml ?? current.footerHtml,
        ga4MeasurementId: body.ga4MeasurementId !== undefined ? body.ga4MeasurementId : current.ga4MeasurementId,
        enableGa4: body.enableGa4 !== undefined ? body.enableGa4 : current.enableGa4,
        umamiScriptUrl: body.umamiScriptUrl !== undefined ? body.umamiScriptUrl : current.umamiScriptUrl,
        umamiWebsiteId: body.umamiWebsiteId !== undefined ? body.umamiWebsiteId : current.umamiWebsiteId,
        enableUmami: body.enableUmami !== undefined ? body.enableUmami : current.enableUmami,
        clarityProjectId: body.clarityProjectId !== undefined ? body.clarityProjectId : current.clarityProjectId,
        enableClarity: body.enableClarity !== undefined ? body.enableClarity : current.enableClarity,
        privacyContent: body.privacyContent !== undefined ? body.privacyContent : current.privacyContent,
        termsContent: body.termsContent !== undefined ? body.termsContent : current.termsContent,
        contactContent: body.contactContent !== undefined ? body.contactContent : current.contactContent,
      },
    });

    return NextResponse.json(updated);
  } catch (e) {
    const errObj = e instanceof Error ? e : new Error(String(e));
    console.error("PUT /api/v1/admin/site-settings error:", errObj);
    return NextResponse.json(
      {
        message: "更新站点设置失败",
      },
      { status: 500 },
    );
  }
}

