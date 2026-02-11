import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await ctx.params;

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { message: "未找到对应的测试会话" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      status: session.status,
      stage: session.stage,
      inviteCode: session.inviteCode,
      initiatorName: session.initiatorName,
      partnerName: session.partnerName,
      initiatorCompleted: !!session.initiatorCompletedAt,
      partnerCompleted: !!session.partnerCompletedAt,
    });
  } catch (error) {
    console.error("GET /api/v1/quiz/status/[sessionId] error:", error);
    return NextResponse.json(
      { message: "查询测试状态失败，请稍后再试" },
      { status: 500 },
    );
  }
}

