import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { QuestionType } from "@prisma/client";

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

const VALID_QUESTION_TYPES: QuestionType[] = ["SINGLE_CHOICE", "MULTI_CHOICE", "SCALE"];

export async function POST(req: NextRequest) {
  const err = requireAdmin(req);
  if (err) return err;

  try {
    const body = await req.json();
    const questionnaireId = body.questionnaireId as string | undefined;
    const text = body.text as string | undefined;
    const type = body.type as string | undefined;
    const order = typeof body.order === "number" ? body.order : undefined;

    if (!questionnaireId || !text?.trim()) {
      return NextResponse.json(
        { message: "questionnaireId、text 为必填" },
        { status: 400 },
      );
    }
    if (!type || !VALID_QUESTION_TYPES.includes(type as QuestionType)) {
      return NextResponse.json(
        { message: "type 须为 SINGLE_CHOICE / MULTI_CHOICE / SCALE" },
        { status: 400 },
      );
    }

    const maxOrder = await prisma.quizQuestion
      .aggregate({
        where: { questionnaireId },
        _max: { order: true },
      })
      .then((r) => r._max.order ?? 0);
    const orderNum = typeof order === "number" && order >= 1 ? order : maxOrder + 1;

    const options = Array.isArray(body.options)
      ? (body.options as Array<{ key: string; text: string; order?: number }>)
      : [];

    const question = await prisma.quizQuestion.create({
      data: {
        questionnaireId,
        text: text.trim(),
        type: type as QuestionType,
        order: orderNum,
        category: body.category ?? null,
        helpText: body.helpText ?? null,
        required: typeof body.required === "boolean" ? body.required : true,
        options:
          options.length > 0
            ? {
                create: options.map((opt, i) => ({
                  key: String(opt.key ?? i + 1),
                  text: String(opt.text ?? "").trim() || `选项 ${i + 1}`,
                  order: typeof opt.order === "number" ? opt.order : i + 1,
                })),
              }
            : undefined,
      },
      include: {
        options: { orderBy: { order: "asc" } },
      },
    });

    const result = {
      id: question.id,
      externalId: question.externalId,
      order: question.order,
      text: question.text,
      category: question.category,
      type: question.type,
      helpText: question.helpText,
      required: question.required,
      options: question.options.map((o) => ({
        id: o.id,
        key: o.key,
        text: o.text,
        order: o.order,
      })),
    };
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error("POST /api/v1/admin/questions error:", error);
    return NextResponse.json(
      { message: "创建题目失败" },
      { status: 500 },
    );
  }
}

