import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  PERSONAL_LEGACY_QUESTION_IDS,
  PERSONAL_QUIZ_SUBTITLE_LEGACY,
  PERSONAL_QUIZ_TITLE_LEGACY,
  PERSONAL_READINESS_QUESTIONS,
  PERSONAL_SCALE_LABELS,
  PERSONAL_SECTION_TITLE,
} from "@/lib/personal-readiness/questions";
import {
  PERSONAL_TRACK_CARD_COPY,
  getPersonalTrackQuestionIds,
  isValidPersonalSlug,
} from "@/lib/personal-readiness/tracks";

/** 个人自测题目：按 session.personalSlug 返回对应题组；无 slug 时兼容旧会话 15 题 */
export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("sessionId") ?? "";
    const deviceId = req.nextUrl.searchParams.get("deviceId") ?? "";

    if (!sessionId || !deviceId) {
      return NextResponse.json(
        { message: "缺少 sessionId 或 deviceId" },
        { status: 400 },
      );
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { mode: true, initiatorDeviceId: true, personalSlug: true },
    });

    if (!session || session.mode !== "PERSONAL") {
      return NextResponse.json(
        { message: "会话不存在或不是个人自测" },
        { status: 404 },
      );
    }

    if (session.initiatorDeviceId !== deviceId) {
      return NextResponse.json(
        { message: "当前设备无权获取该个人自测题目" },
        { status: 403 },
      );
    }

    const slug = session.personalSlug;
    const ids = getPersonalTrackQuestionIds(slug);

    let title: string;
    let subtitle: string;
    let questions: typeof PERSONAL_READINESS_QUESTIONS;
    let trackTitle: string | null = null;

    if (ids != null && slug && isValidPersonalSlug(slug)) {
      const meta = PERSONAL_TRACK_CARD_COPY[slug];
      trackTitle = meta.title;
      title = `${PERSONAL_SECTION_TITLE} · ${meta.title}`;
      subtitle = `共 ${ids.length} 题，1–5 分。${meta.subtitle}`;
      const idSet = new Set(ids);
      questions = PERSONAL_READINESS_QUESTIONS.filter((q) => idSet.has(q.id));
    } else {
      title = PERSONAL_QUIZ_TITLE_LEGACY;
      subtitle = PERSONAL_QUIZ_SUBTITLE_LEGACY;
      const legacySet = new Set(PERSONAL_LEGACY_QUESTION_IDS);
      questions = PERSONAL_READINESS_QUESTIONS.filter((q) =>
        legacySet.has(q.id),
      );
    }

    return NextResponse.json({
      personalSlug: slug,
      trackTitle,
      title,
      subtitle,
      scaleLabels: [...PERSONAL_SCALE_LABELS],
      questions,
    });
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("GET /api/v1/quiz/personal-questions error:", err);
    return NextResponse.json(
      { message: "获取个人自测题目失败" },
      { status: 500 },
    );
  }
}
