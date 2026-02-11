import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const deviceId = req.nextUrl.searchParams.get("deviceId") ?? "";

    if (!deviceId) {
      return NextResponse.json(
        { message: "deviceId 为必填参数" },
        { status: 400 },
      );
    }

    const sessions = await prisma.session.findMany({
      where: {
        OR: [
          { initiatorDeviceId: deviceId },
          { partnerDeviceId: deviceId },
        ],
      },
      orderBy: { createdAt: "desc" },
      include: { result: true },
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("GET /api/v1/history error:", error);
    return NextResponse.json(
      { message: "获取历史测试记录失败，请稍后再试" },
      { status: 500 },
    );
  }
}

