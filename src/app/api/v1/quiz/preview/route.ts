import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const STAGE_LABELS: Record<string, string> = {
  UNIVERSAL: "通用版",
  AMBIGUOUS: "暧昧期",
  ROMANCE: "热恋期",
  STABLE: "稳定期",
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code")?.trim();

    if (!code || code.length !== 6) {
      return NextResponse.json(
        { message: "邀请码格式无效" },
        { status: 400 },
      );
    }

    const session = await prisma.session.findUnique({
      where: { inviteCode: code.toUpperCase() },
      select: { stage: true, expiresAt: true, partnerDeviceId: true },
    });

    if (!session) {
      return NextResponse.json(
        { message: "邀请码无效" },
        { status: 404 },
      );
    }

    const now = new Date();
    if (session.expiresAt < now) {
      return NextResponse.json(
        { message: "邀请码已过期" },
        { status: 400 },
      );
    }

    if (session.partnerDeviceId) {
      return NextResponse.json(
        { message: "该测试已有人参与" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      stage: session.stage,
      stageLabel: STAGE_LABELS[session.stage] ?? session.stage,
    });
  } catch (error) {
    console.error("GET /api/v1/quiz/preview error:", error);
    return NextResponse.json(
      { message: "查询失败" },
      { status: 500 },
    );
  }
}
