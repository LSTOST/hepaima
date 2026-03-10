import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { Stage } from "@prisma/client";
import { ensurePresetQuestionsForProduct } from "@/lib/seed-preset-questions";

export async function GET(req: NextRequest) {
  const err = requireAdmin(req);
  if (err) return err;

  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId") ?? undefined;

    let list = await prisma.questionnaire.findMany({
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

    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });
      if (product) {
        await ensurePresetQuestionsForProduct(productId);
        list = await prisma.questionnaire.findMany({
          where: { productId },
          include: { _count: { select: { questions: true } } },
          orderBy: [{ stage: "asc" }, { createdAt: "asc" }],
        });
      }
    }

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

const VALID_STAGES: (Stage | null)[] = [null, "UNIVERSAL", "AMBIGUOUS", "ROMANCE", "STABLE"];

export async function POST(req: NextRequest) {
  const err = requireAdmin(req);
  if (err) return err;

  try {
    const body = await req.json();
    const productId = body.productId as string | undefined;
    const title = body.title as string | undefined;

    if (!productId || !title?.trim()) {
      return NextResponse.json(
        { message: "productId、title 为必填" },
        { status: 400 },
      );
    }

    const stage =
      body.stage === null || body.stage === undefined
        ? null
        : VALID_STAGES.includes(body.stage)
          ? body.stage
          : null;

    const created = await prisma.questionnaire.create({
      data: {
        productId,
        title: title.trim(),
        stage,
        isActive: body.isActive !== false,
      },
      include: {
        _count: { select: { questions: true } },
      },
    });

    return NextResponse.json(
      {
        id: created.id,
        title: created.title,
        stage: created.stage,
        isActive: created.isActive,
        questionCount: created._count.questions,
        createdAt: created.createdAt,
      },
      { status: 201 },
    );
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error("POST /api/v1/admin/questionnaires error:", error);
    return NextResponse.json(
      { message: "创建问卷失败" },
      { status: 500 },
    );
  }
}

