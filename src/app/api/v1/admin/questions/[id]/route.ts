import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const err = requireAdmin(req);
  if (err) return err;

  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const existing = await prisma.quizQuestion.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json({ message: "题目不存在" }, { status: 404 });
    }

    const updated = await prisma.quizQuestion.update({
      where: { id },
      data: {
        text: body.text ?? existing.text,
        category: body.category ?? existing.category,
        order:
          typeof body.order === "number" ? Math.max(1, body.order) : existing.order,
        helpText: body.helpText ?? existing.helpText,
        required:
          typeof body.required === "boolean"
            ? body.required
            : existing.required,
      },
    });

    return NextResponse.json(updated);
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error("PUT /api/v1/admin/questions/[id] error:", error);
    return NextResponse.json(
      { message: "更新题目失败" },
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
    await prisma.quizQuestion.delete({
      where: { id },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error("DELETE /api/v1/admin/questions/[id] error:", error);
    return NextResponse.json(
      { message: "删除题目失败" },
      { status: 500 },
    );
  }
}

