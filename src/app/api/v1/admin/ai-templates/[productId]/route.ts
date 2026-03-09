import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

async function getOrCreateTemplate(productId: string) {
  const existing = await prisma.productAiTemplate.findFirst({
    where: { productId },
  });
  if (existing) return existing;

  // 创建一个默认模板，便于后台编辑
  return prisma.productAiTemplate.create({
    data: {
      productId,
      modelName: "deepseek-chat",
      temperature: 0.7,
      maxTokens: 2048,
      systemPrompt:
        "你是一名专业的亲密关系咨询师，请用温柔、专业、通俗易懂的中文为用户解读情侣关系测评结果，不要给出医学诊断。",
      userPromptTemplate:
        "以下是情侣双方的测评结果与关键信息，请基于这些信息生成一份关系分析报告：\\n{{payload}}",
    },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { productId: string } },
) {
  const err = requireAdmin(req);
  if (err) return err;

  try {
    const tpl = await getOrCreateTemplate(params.productId);
    return NextResponse.json(tpl);
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error("GET /api/v1/admin/ai-templates/[productId] error:", error);
    return NextResponse.json(
      { message: "获取 AI 模板失败" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { productId: string } },
) {
  const err = requireAdmin(req);
  if (err) return err;

  try {
    const body = await req.json();
    const current = await getOrCreateTemplate(params.productId);

    const updated = await prisma.productAiTemplate.update({
      where: { id: current.id },
      data: {
        modelName: body.modelName ?? current.modelName,
        temperature:
          typeof body.temperature === "number"
            ? body.temperature
            : current.temperature,
        maxTokens:
          typeof body.maxTokens === "number"
            ? body.maxTokens
            : current.maxTokens,
        systemPrompt: body.systemPrompt ?? current.systemPrompt,
        userPromptTemplate:
          body.userPromptTemplate ?? current.userPromptTemplate,
        sectionsJson: body.sectionsJson ?? current.sectionsJson,
      },
    });

    return NextResponse.json(updated);
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error("PUT /api/v1/admin/ai-templates/[productId] error:", error);
    return NextResponse.json(
      { message: "更新 AI 模板失败" },
      { status: 500 },
    );
  }
}

