import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const err = requireAdmin(req);
  if (err) return err;

  try {
    const { searchParams } = new URL(req.url);
    const questionnaireId = searchParams.get("questionnaireId");

    if (!questionnaireId) {
      return NextResponse.json(
        { message: "questionnaireId 为必填参数" },
        { status: 400 },
      );
    }

    const questions = await prisma.quizQuestion.findMany({
      where: { questionnaireId },
      orderBy: { order: "asc" },
      include: {
        options: {
          orderBy: { order: "asc" },
        },
      },
    });

    const result = questions.map((q) => ({
      id: q.id,
      externalId: q.externalId,
      order: q.order,
      text: q.text,
      category: q.category,
      type: q.type,
      helpText: q.helpText,
      required: q.required,
      options: q.options.map((opt) => ({
        id: opt.id,
        key: opt.key,
        text: opt.text,
        order: opt.order,
      })),
    }));

    return NextResponse.json(result);
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error("GET /api/v1/admin/questions error:", error);
    return NextResponse.json(
      { message: "获取题目列表失败" },
      { status: 500 },
    );
  }
}

