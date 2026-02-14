import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ATTACHMENT_LABELS, LOVE_LANGUAGE_LABELS } from "@/lib/resultGenerator";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await ctx.params;

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { result: true },
    });

    if (!session) {
      return NextResponse.json(
        { message: "未找到对应的测试会话" },
        { status: 404 },
      );
    }

    if (session.status !== "COMPLETED") {
      return NextResponse.json({
        status: "waiting",
        message: "等待双方完成测试",
      });
    }

    if (!session.result) {
      return NextResponse.json({
        status: "generating",
        message: "报告生成中",
      });
    }

    const r = session.result;

    return NextResponse.json({
      status: "ready",
      result: {
        id: r.id,
        overallScore: r.overallScore,
        initiatorAttachment: ATTACHMENT_LABELS[r.initiatorAttachment] ?? r.initiatorAttachment,
        partnerAttachment: ATTACHMENT_LABELS[r.partnerAttachment] ?? r.partnerAttachment,
        initiatorAttachmentType: r.initiatorAttachment,
        partnerAttachmentType: r.partnerAttachment,
        initiatorLoveLanguage: LOVE_LANGUAGE_LABELS[r.initiatorLoveLanguage] ?? r.initiatorLoveLanguage,
        partnerLoveLanguage: LOVE_LANGUAGE_LABELS[r.partnerLoveLanguage] ?? r.partnerLoveLanguage,
        initiatorLoveLanguageType: r.initiatorLoveLanguage,
        partnerLoveLanguageType: r.partnerLoveLanguage,
        dimensions: r.dimensions,
        reportBasic: r.reportBasic,
        report: r.reportBasic ?? null,
        premiumReport: r.reportPremium ?? null,
        purchasedTier: r.purchasedTier ?? "FREE",
        reportStatus: {
          basic: r.reportBasic ? "ready" : "generating",
          premium: r.reportPremium ? "ready" : "generating",
        },
      },
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("GET /api/v1/result/[sessionId] error:", err.message);
    console.error("Stack:", err.stack);
    return NextResponse.json(
      { message: "获取测试结果失败，请稍后再试" },
      { status: 500 },
    );
  }
}

