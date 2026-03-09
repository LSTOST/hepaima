import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest, { params }: any) {
  const err = requireAdmin(req);
  if (err) return err;

  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });
    if (!product) {
      return NextResponse.json({ message: "产品不存在" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (e) {
    const errObj = e instanceof Error ? e : new Error(String(e));
    console.error("GET /api/v1/admin/products/[id] error:", errObj);
    return NextResponse.json(
      {
        message: "获取产品失败",
      },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest, { params }: any) {
  const err = requireAdmin(req);
  if (err) return err;

  try {
    const body = await req.json();
    const existing = await prisma.product.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return NextResponse.json({ message: "产品不存在" }, { status: 404 });
    }

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: {
        slug: body.slug ?? existing.slug,
        name: body.name ?? existing.name,
        shortDescription: body.shortDescription ?? existing.shortDescription,
        coverImageUrl: body.coverImageUrl ?? existing.coverImageUrl,
        icon: body.icon ?? existing.icon,
        themeConfigJson: body.themeConfigJson ?? existing.themeConfigJson,
        isActive:
          typeof body.isActive === "boolean" ? body.isActive : existing.isActive,
        seoTitle: body.seoTitle ?? existing.seoTitle,
        seoDescription: body.seoDescription ?? existing.seoDescription,
        seoKeywords: body.seoKeywords ?? existing.seoKeywords,
        priceCents:
          typeof body.priceCents === "number" && body.priceCents >= 0
            ? Math.floor(body.priceCents)
            : existing.priceCents,
        allowRedeemCode:
          typeof body.allowRedeemCode === "boolean"
            ? body.allowRedeemCode
            : existing.allowRedeemCode,
      },
    });

    return NextResponse.json(updated);
  } catch (e) {
    const errObj = e instanceof Error ? e : new Error(String(e));
    console.error("PUT /api/v1/admin/products/[id] error:", errObj);
    return NextResponse.json(
      {
        message: "更新产品失败",
      },
      { status: 500 },
    );
  }
}

