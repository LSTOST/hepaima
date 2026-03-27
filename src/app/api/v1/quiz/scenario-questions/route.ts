import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getScenarioBySlug } from "@/lib/scenario-quizzes";

/**
 * 专题量表题目：按 session 上的 scenarioSlug 返回，避免客户端篡改 slug。
 */
export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("sessionId") ?? "";
    if (!sessionId) {
      return NextResponse.json(
        { message: "缺少 sessionId" },
        { status: 400 },
      );
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { mode: true, scenarioSlug: true },
    });

    if (!session || session.mode !== "SCENARIO" || !session.scenarioSlug) {
      return NextResponse.json(
        { message: "会话不是专题测评或缺少专题标识" },
        { status: 404 },
      );
    }

    const def = getScenarioBySlug(session.scenarioSlug);
    if (!def) {
      return NextResponse.json(
        { message: "专题配置不存在" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      slug: def.slug,
      title: def.title,
      questions: def.questions,
    });
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("GET /api/v1/quiz/scenario-questions error:", err);
    return NextResponse.json(
      { message: "获取专题题目失败" },
      { status: 500 },
    );
  }
}
