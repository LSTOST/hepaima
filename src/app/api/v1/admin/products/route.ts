import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { ensurePresetQuestionsForProduct } from "@/lib/seed-preset-questions";

export async function GET(req: NextRequest) {
  const err = requireAdmin(req);
  if (err) return err;

  try {
    let list = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    if (list.length === 0) {
      const defaultProduct = await prisma.product.create({
        data: {
          slug: "couple-compatibility",
          name: "情侣契合度",
          isActive: true,
        },
      });
      await ensurePresetQuestionsForProduct(defaultProduct.id);
      list = [defaultProduct];
    }
    return NextResponse.json(list);
  } catch (e) {
    const errObj = e instanceof Error ? e : new Error(String(e));
    console.error("GET /api/v1/admin/products error:", errObj);
    return NextResponse.json(
      {
        message: "获取产品列表失败",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const err = requireAdmin(req);
  if (err) return err;

  try {
    const body = await req.json();
    if (!body.slug || !body.name) {
      return NextResponse.json(
        { message: "slug 和名称为必填" },
        { status: 400 },
      );
    }

    const created = await prisma.product.create({
      data: {
        slug: body.slug,
        name: body.name,
        shortDescription: body.shortDescription,
        coverImageUrl: body.coverImageUrl,
        icon: body.icon,
        themeConfigJson: body.themeConfigJson ?? undefined,
        isActive: body.isActive ?? true,
        seoTitle: body.seoTitle,
        seoDescription: body.seoDescription,
        seoKeywords: body.seoKeywords,
        priceCents:
          typeof body.priceCents === "number" && body.priceCents >= 0
            ? Math.floor(body.priceCents)
            : 0,
        allowRedeemCode:
          typeof body.allowRedeemCode === "boolean"
            ? body.allowRedeemCode
            : true,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    const errObj = e instanceof Error ? e : new Error(String(e));
    console.error("POST /api/v1/admin/products error:", errObj);
    return NextResponse.json(
      {
        message: "创建产品失败",
      },
      { status: 500 },
    );
  }
}

