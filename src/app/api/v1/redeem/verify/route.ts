import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const ALL_STAGES = ["UNIVERSAL", "AMBIGUOUS", "ROMANCE", "STABLE"] as const;
type StageValue = (typeof ALL_STAGES)[number];

const STAGE_LABELS: Record<string, string> = {
  UNIVERSAL: "通用版",
  AMBIGUOUS: "暧昧期",
  ROMANCE: "热恋期",
  STABLE: "稳定期",
};

function normalizeCode(code: string): string {
  return code.replace(/\s/g, "").toUpperCase();
}

function isValidStage(s: string): s is StageValue {
  return ALL_STAGES.includes(s as StageValue);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const code = typeof body?.code === "string" ? body.code : "";
    const deviceId = typeof body?.deviceId === "string" ? body.deviceId : "";
    const stageRaw = body?.stage as string | undefined;

    if (!code || !deviceId || !stageRaw) {
      return NextResponse.json(
        { message: "code、deviceId、stage 都是必填项" },
        { status: 400 },
      );
    }

    if (!isValidStage(stageRaw)) {
      return NextResponse.json(
        { message: "stage 不合法，应为 UNIVERSAL / AMBIGUOUS / ROMANCE / STABLE" },
        { status: 400 },
      );
    }

    const stage = stageRaw as StageValue;
    const normalizedCode = normalizeCode(code);

    const redeemCode = await prisma.redeemCode.findUnique({
      where: { code: normalizedCode },
      include: { usages: true },
    });

    if (!redeemCode) {
      return NextResponse.json({ message: "兑换码不存在" }, { status: 404 });
    }

    if (redeemCode.disabled) {
      return NextResponse.json({ message: "兑换码已失效" }, { status: 400 });
    }

    if (redeemCode.expiresAt && new Date() > redeemCode.expiresAt) {
      return NextResponse.json({ message: "兑换码已过期" }, { status: 400 });
    }

    const hasThisStage = redeemCode.usages.some((u) => u.stage === stage);
    if (hasThisStage) {
      const label = STAGE_LABELS[stage] ?? stage;
      return NextResponse.json(
        { message: `该兑换码已完成【${label}】测评，请选择其他阶段` },
        { status: 400 },
      );
    }

    if (
      redeemCode.usedByDeviceId != null &&
      redeemCode.usedByDeviceId !== deviceId
    ) {
      return NextResponse.json(
        { message: "该兑换码已绑定其他设备" },
        { status: 400 },
      );
    }

    const now = new Date();

    const [updatedCode, usage] = await prisma.$transaction(async (tx) => {
      if (redeemCode.usedByDeviceId == null) {
        await tx.redeemCode.update({
          where: { id: redeemCode.id },
          data: {
            usedByDeviceId: deviceId,
            firstUsedAt: now,
          },
        });
      }
      const newUsage = await tx.redeemCodeUsage.create({
        data: {
          redeemCodeId: redeemCode.id,
          stage,
          sessionId: null,
          usedAt: now,
        },
      });
      const updated = await tx.redeemCode.findUnique({
        where: { id: redeemCode.id },
        include: { usages: true },
      });
      return [updated!, newUsage];
    });

    const usedStages = new Set(updatedCode!.usages.map((u) => u.stage));
    const remainingStages = ALL_STAGES.filter((s) => !usedStages.has(s));

    return NextResponse.json({
      valid: true,
      codeId: redeemCode.id,
      usageId: usage.id,
      remainingStages,
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("POST /api/v1/redeem/verify error:", err.message);
    return NextResponse.json(
      { message: "验证失败，请稍后再试" },
      { status: 500 },
    );
  }
}
