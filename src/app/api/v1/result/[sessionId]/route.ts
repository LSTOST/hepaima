import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ATTACHMENT_LABELS, LOVE_LANGUAGE_LABELS } from "@/lib/resultGenerator";
import { getScenarioBySlug } from "@/lib/scenario-quizzes";
import { PERSONAL_DIMENSION_LABELS } from "@/lib/personal-readiness/questions";
import { personalTrackShortLabel } from "@/lib/personal-readiness/tracks";

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
      if (session.mode === "PERSONAL") {
        return NextResponse.json({
          mode: "PERSONAL",
          status: "in_progress",
          message: "测评尚未完成，可继续答题",
          quizPath: `/quiz/${sessionId}?mode=PERSONAL`,
          personalSlug: session.personalSlug,
          personalTrackLabel: personalTrackShortLabel(session.personalSlug),
        });
      }
      return NextResponse.json({
        mode: session.mode,
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
    const scenarioMeta = session.scenarioSlug
      ? getScenarioBySlug(session.scenarioSlug)
      : null;

    const isPersonal = session.mode === "PERSONAL";
    const dimLabels = isPersonal
      ? (PERSONAL_DIMENSION_LABELS as Record<string, string>)
      : undefined;

    const body = {
      mode: session.mode,
      status: "ready" as const,
      result: {
        id: r.id,
        isPersonal,
        personalSlug: session.personalSlug,
        personalTrackLabel: personalTrackShortLabel(session.personalSlug),
        scenarioSlug: session.scenarioSlug,
        scenarioTitle: scenarioMeta?.title ?? null,
        scenarioSubtitle: scenarioMeta?.subtitle ?? null,
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
        dimensionLabels: dimLabels ?? null,
        reportBasic: r.reportBasic,
        report: r.reportBasic ?? null,
        premiumReport: r.reportPremium ?? null,
        purchasedTier: r.purchasedTier ?? "FREE",
        reportStatus: {
          basic: r.reportBasic ? "ready" : "generating",
          premium: r.reportPremium ? "ready" : "generating",
        },
      },
    };
    return NextResponse.json(body, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        Pragma: "no-cache",
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

