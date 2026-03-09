import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const err = requireAdmin(req);
  if (err) return err;

  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId") ?? undefined;

    const list = await prisma.questionnaire.findMany({
      where: {
        ...(productId ? { productId } : {}),
      },
      include: {
        _count: {
          select: { questions: true },
        },
      },
      orderBy: [{ stage: "asc" }, { createdAt: "asc" }],
    });

    const result = list.map((q) => ({
      id: q.id,
      title: q.title,
      stage: q.stage,
      isActive: q.isActive,
      questionCount: q._count.questions,
      createdAt: q.createdAt,
    }));

    return NextResponse.json(result);
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error("GET /api/v1/admin/questionnaires error:", error);
    return NextResponse.json(
      { message: "获取问卷列表失败" },
      { status: 500 },
    );
  }
}

