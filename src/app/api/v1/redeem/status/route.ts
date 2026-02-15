import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const ALL_STAGES = ["UNIVERSAL", "AMBIGUOUS", "ROMANCE", "STABLE"] as const;

function normalizeCode(code: string): string {
  return code.replace(/\s/g, "").toUpperCase();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const code = typeof body?.code === "string" ? body.code : "";

    if (!code) {
      return NextResponse.json(
        { message: "code 为必填项" },
        { status: 400 },
      );
    }

    const normalizedCode = normalizeCode(code);

    const redeemCode = await prisma.redeemCode.findUnique({
      where: { code: normalizedCode },
      include: {
        usages: {
          orderBy: { usedAt: "asc" },
          select: { stage: true, usedAt: true },
        },
      },
    });

    if (!redeemCode) {
      return NextResponse.json({ message: "兑换码不存在" }, { status: 404 });
    }

    const usedStages = new Set(redeemCode.usages.map((u) => u.stage));
    const remainingStages = ALL_STAGES.filter((s) => !usedStages.has(s));

    return NextResponse.json({
      code: redeemCode.code,
      usages: redeemCode.usages.map((u) => ({
        stage: u.stage,
        usedAt: u.usedAt.toISOString(),
      })),
      remainingStages,
      totalStages: ALL_STAGES.length,
      usedCount: redeemCode.usages.length,
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("POST /api/v1/redeem/status error:", err.message);
    return NextResponse.json(
      { message: "查询失败，请稍后再试" },
      { status: 500 },
    );
  }
}
