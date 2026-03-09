import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const err = requireAdmin(req);
  if (err) return err;

  try {
    const body = await req.json();
    const existing = await prisma.quizTrait.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return NextResponse.json({ message: "维度不存在" }, { status: 404 });
    }

    const updated = await prisma.quizTrait.update({
      where: { id: params.id },
      data: {
        key: body.key ?? existing.key,
        name: body.name ?? existing.name,
        description: body.description ?? existing.description,
        category: body.category ?? existing.category,
        icon: body.icon ?? existing.icon,
        color: body.color ?? existing.color,
      },
    });

    return NextResponse.json(updated);
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error("PUT /api/v1/admin/traits/[id] error:", error);
    return NextResponse.json(
      { message: "更新维度失败" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const err = requireAdmin(req);
  if (err) return err;

  try {
    await prisma.quizTrait.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error("DELETE /api/v1/admin/traits/[id] error:", error);
    return NextResponse.json(
      { message: "删除维度失败" },
      { status: 500 },
    );
  }
}

