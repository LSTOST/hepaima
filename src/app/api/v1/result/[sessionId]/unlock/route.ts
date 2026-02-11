import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** 免费解锁深度报告：一方解锁后，双方打开结果页都会看到已解锁（与双方答完题双方都看到报告一致） */
export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await ctx.params;

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { result: true },
    });

    if (!session) {
      return NextResponse.json(
        { message: "未找到对应的测试会话" },
        { status: 404 },
      );
    }

    if (session.status !== "COMPLETED") {
      return NextResponse.json(
        { message: "测试未完成，无法解锁" },
        { status: 400 },
      );
    }

    if (!session.result) {
      return NextResponse.json(
        { message: "报告尚未生成，请稍后再试" },
        { status: 400 },
      );
    }

    await prisma.result.update({
      where: { id: session.result.id },
      data: { purchasedTier: "PREMIUM" },
    });

    return NextResponse.json({ success: true, purchasedTier: "PREMIUM" });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("POST /api/v1/result/[sessionId]/unlock error:", err.message);
    return NextResponse.json(
      { message: "解锁失败，请稍后再试" },
      { status: 500 },
    );
  }
}
