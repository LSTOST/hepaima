import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateInviteCode } from "@/lib/invite";

const VALID_MODES = ["UNIVERSAL", "STAGED"] as const;
type ModeValue = (typeof VALID_MODES)[number];

const VALID_STAGES = ["UNIVERSAL", "AMBIGUOUS", "ROMANCE", "STABLE"] as const;
type StageValue = (typeof VALID_STAGES)[number];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    const deviceId = body?.deviceId as string | undefined;
    const mode = (body?.mode as ModeValue | undefined) ?? "STAGED";
    const stageRaw = body?.stage as string | undefined;
    const nickname = body?.nickname as string | undefined;
    const usageId = body?.usageId as string | undefined;

    if (!deviceId || !nickname) {
      return NextResponse.json(
        { message: "deviceId、nickname 都是必填项" },
        { status: 400 },
      );
    }

    if (!VALID_MODES.includes(mode)) {
      return NextResponse.json(
        { message: "mode 参数不合法" },
        { status: 400 },
      );
    }

    const stage: StageValue =
      mode === "UNIVERSAL"
        ? "UNIVERSAL"
        : VALID_STAGES.includes(stageRaw as StageValue) &&
            stageRaw !== "UNIVERSAL"
          ? (stageRaw as StageValue)
          : "ROMANCE";

    // 保证邀请码在合理范围内唯一（冲突概率极低）
    let inviteCode = generateInviteCode();
    for (let i = 0; i < 4; i++) {
      const existing = await prisma.session.findUnique({
        where: { inviteCode },
        select: { id: true },
      });
      if (!existing) break;
      inviteCode = generateInviteCode();
    }

    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const session = await prisma.session.create({
      data: {
        inviteCode,
        mode,
        stage,
        status: "WAITING_PARTNER",
        initiatorDeviceId: deviceId,
        initiatorName: nickname,
        expiresAt,
      },
      select: {
        id: true,
        inviteCode: true,
        expiresAt: true,
      },
    });

    if (usageId) {
      await prisma.redeemCodeUsage.updateMany({
        where: { id: usageId },
        data: { sessionId: session.id },
      });
    }

    return NextResponse.json({
      sessionId: session.id,
      inviteCode: session.inviteCode,
      expiresAt: session.expiresAt,
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("POST /api/v1/quiz/start error:", err.message);
    console.error(err.stack);
    const message =
      process.env.NODE_ENV === "development"
        ? `创建测试会话失败: ${err.message}`
        : "创建测试会话失败，请稍后再试";
    return NextResponse.json({ message }, { status: 500 });
  }
}
