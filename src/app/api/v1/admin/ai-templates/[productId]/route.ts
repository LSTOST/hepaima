import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

async function getOrCreateTemplate(productId: string) {
  const existing = await prisma.productAiTemplate.findFirst({
    where: { productId },
  });
  if (existing) return existing;

  // 默认模板：报告生成时会用实际测评数据替换 {{payload}}
  const defaultUserPrompt = `## 测试数据
{{payload}}

请输出以下 JSON，overallAnalysis 为对象含 summary、highlights(4条)、advice：
{
  "summary": "一句话总结（15-20字）",
  "overallAnalysis": {
    "summary": "整体总结（60-80字）",
    "highlights": [
      { "emoji": "🛡️", "title": "依恋（4-8字）", "detail": "40-60字" },
      { "emoji": "🗣️", "title": "爱的语言（4-8字）", "detail": "40-60字" },
      { "emoji": "💡", "title": "优势维度（4-8字）", "detail": "40-60字" },
      { "emoji": "🌱", "title": "成长维度（4-8字）", "detail": "40-60字" }
    ],
    "advice": "温暖建议（20-30字）"
  },
  "attachmentAnalysis": { "title": "3-5字", "description": "180-250字", "tips": ["建议1", "建议2", "建议3"] },
  "loveLanguageAnalysis": { "title": "3-5字", "description": "150-200字", "tips": ["建议1", "建议2", "建议3"] },
  "strengths": ["优势1", "优势2", "优势3"],
  "challenges": ["挑战1", "挑战2"],
  "actionItems": [
    { "title": "任务1（5-10字）", "description": "做法（30-50字）" },
    { "title": "任务2", "description": "做法2" },
    { "title": "任务3", "description": "做法3" }
  ]
}`;
  return prisma.productAiTemplate.create({
    data: {
      productId,
      modelName: "deepseek/deepseek-chat-v3-0324",
      temperature: 0.5,
      maxTokens: 2048,
      systemPrompt:
        "你是关系心理咨询师，根据情侣测试数据生成温暖、有洞察力的关系分析报告。用中文、亲切语气。overallAnalysis 为对象：summary(60-80字)、highlights(恰好4条: emoji+title+detail)、advice(20-30字)。只输出 JSON，无 markdown 标记。",
      userPromptTemplate: defaultUserPrompt,
    },
  });
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ productId: string }> },
) {
  const err = requireAdmin(req);
  if (err) return err;

  try {
    const { productId } = await ctx.params;
    const tpl = await getOrCreateTemplate(productId);
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
  ctx: { params: Promise<{ productId: string }> },
) {
  const err = requireAdmin(req);
  if (err) return err;

  try {
    const { productId } = await ctx.params;
    const body = await req.json();
    const current = await getOrCreateTemplate(productId);

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

