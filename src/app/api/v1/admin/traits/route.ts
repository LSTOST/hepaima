import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { ensurePresetTraitsForProduct } from "@/lib/seed-preset-traits";

export async function GET(req: NextRequest) {
  const err = requireAdmin(req);
  if (err) return err;

  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    const where = productId ? { productId } : {};

    let list = await prisma.quizTrait.findMany({
      where,
      orderBy: { createdAt: "asc" },
    });

    if (productId && list.length === 0) {
      await ensurePresetTraitsForProduct(productId);
      list = await prisma.quizTrait.findMany({
        where: { productId },
        orderBy: { createdAt: "asc" },
      });
    }

    return NextResponse.json(list);
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error("GET /api/v1/admin/traits error:", error);
    return NextResponse.json(
      { message: "获取维度列表失败" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const err = requireAdmin(req);
  if (err) return err;

  try {
    const body = await req.json();
    if (!body.productId || !body.key || !body.name) {
      return NextResponse.json(
        { message: "productId、key、name 为必填" },
        { status: 400 },
      );
    }

    const created = await prisma.quizTrait.create({
      data: {
        productId: body.productId,
        key: body.key,
        name: body.name,
        description: body.description,
        category: body.category,
        icon: body.icon,
        color: body.color,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error("POST /api/v1/admin/traits error:", error);
    return NextResponse.json(
      { message: "创建维度失败" },
      { status: 500 },
    );
  }
}

