import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function normalizeCode(code: string): string {
  return code.replace(/\s/g, "").toUpperCase();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const code = typeof body?.code === "string" ? body.code : "";
    const deviceId = typeof body?.deviceId === "string" ? body.deviceId : "";

    if (!code || !deviceId) {
      return NextResponse.json(
        { message: "code、deviceId 都是必填项" },
        { status: 400 },
      );
    }

    const normalizedCode = normalizeCode(code);
    const redeemCode = await prisma.redeemCode.findUnique({
      where: { code: normalizedCode },
    });

    if (!redeemCode) {
      return NextResponse.json({ message: "兑换码不存在" }, { status: 404 });
    }

    if (redeemCode.status === "USED") {
      return NextResponse.json({ message: "已被使用" }, { status: 400 });
    }

    if (redeemCode.status === "DISABLED") {
      return NextResponse.json({ message: "已失效" }, { status: 400 });
    }

    if (redeemCode.expiresAt && new Date() > redeemCode.expiresAt) {
      await prisma.redeemCode.update({
        where: { id: redeemCode.id },
        data: { status: "EXPIRED" },
      });
      return NextResponse.json({ message: "兑换码已过期" }, { status: 400 });
    }

    await prisma.redeemCode.update({
      where: { id: redeemCode.id },
      data: {
        status: "USED",
        usedByDeviceId: deviceId,
        usedAt: new Date(),
      },
    });

    return NextResponse.json({
      valid: true,
      codeId: redeemCode.id,
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
