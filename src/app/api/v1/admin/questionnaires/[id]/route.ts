import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { Stage } from "@prisma/client";

const VALID_STAGES: (Stage | null)[] = [null, "UNIVERSAL", "AMBIGUOUS", "ROMANCE", "STABLE"];

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const err = requireAdmin(req);
  if (err) return err;

  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const existing = await prisma.questionnaire.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json({ message: "问卷不存在" }, { status: 404 });
    }

    const title = body.title !== undefined ? String(body.title).trim() : existing.title;
    const stage =
      body.stage === null || body.stage === undefined
        ? existing.stage
        : VALID_STAGES.includes(body.stage)
          ? body.stage
          : existing.stage;
    const isActive =
      typeof body.isActive === "boolean" ? body.isActive : existing.isActive;

    const updated = await prisma.questionnaire.update({
      where: { id },
      data: { title, stage, isActive },
      include: {
        _count: { select: { questions: true } },
      },
    });

    return NextResponse.json({
      id: updated.id,
      title: updated.title,
      stage: updated.stage,
      isActive: updated.isActive,
      questionCount: updated._count.questions,
      createdAt: updated.createdAt,
    });
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error("PUT /api/v1/admin/questionnaires/[id] error:", error);
    return NextResponse.json(
      { message: "更新问卷失败" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const err = requireAdmin(_req);
  if (err) return err;

  try {
    const { id } = await ctx.params;
    await prisma.$transaction([
      prisma.quizQuestionOption.deleteMany({
        where: { question: { questionnaireId: id } },
      }),
      prisma.quizQuestion.deleteMany({
        where: { questionnaireId: id },
      }),
      prisma.questionnaire.delete({
        where: { id },
      }),
    ]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error("DELETE /api/v1/admin/questionnaires/[id] error:", error);
    return NextResponse.json(
      { message: "删除问卷失败" },
      { status: 500 },
    );
  }
}
