import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    const deviceId = body?.deviceId as string | undefined;
    const inviteCode = body?.inviteCode as string | undefined;
    const nickname = body?.nickname as string | undefined;

    if (!deviceId || !inviteCode || !nickname) {
      return NextResponse.json(
        { message: "deviceId、inviteCode、nickname 都是必填项" },
        { status: 400 },
      );
    }

    const session = await prisma.session.findUnique({
      where: { inviteCode },
    });

    if (!session) {
      return NextResponse.json(
        { message: "未找到对应的测试会话" },
        { status: 404 },
      );
    }

    const now = new Date();
    if (session.expiresAt < now) {
      return NextResponse.json(
        { message: "邀请码已过期，请让对方重新创建测试" },
        { status: 400 },
      );
    }

    if (session.partnerDeviceId) {
      return NextResponse.json(
        { message: "该测试已有人加入" },
        { status: 400 },
      );
    }

    if (deviceId === session.initiatorDeviceId) {
      return NextResponse.json(
        { message: "不能自己和自己测，请在另一台设备或浏览器加入" },
        { status: 400 },
      );
    }

    const updated = await prisma.session.update({
      where: { id: session.id },
      data: {
        partnerDeviceId: deviceId,
        partnerName: nickname,
        status: "IN_PROGRESS",
      },
      select: {
        id: true,
        mode: true,
        stage: true,
        initiatorName: true,
      },
    });

    return NextResponse.json({
      sessionId: updated.id,
      mode: updated.mode,
      stage: updated.stage,
      initiatorName: updated.initiatorName,
    });
  } catch (error) {
    console.error("POST /api/v1/quiz/join error:", error);
    return NextResponse.json(
      { message: "加入测试失败，请稍后再试" },
      { status: 500 },
    );
  }
}

