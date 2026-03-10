import { prisma } from "@/lib/db";

export type AiTemplateForReport = {
  modelName: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  userPromptTemplate: string;
};

/** 取第一个激活产品的 AI 模板，供报告生成使用；无则返回 null（走代码内默认） */
export async function getAiTemplateForReport(): Promise<AiTemplateForReport | null> {
  const product = await prisma.product.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });
  if (!product) return null;

  const tpl = await prisma.productAiTemplate.findFirst({
    where: { productId: product.id },
  });
  if (!tpl) return null;

  return {
    modelName: tpl.modelName,
    temperature: tpl.temperature,
    maxTokens: tpl.maxTokens,
    systemPrompt: tpl.systemPrompt,
    userPromptTemplate: tpl.userPromptTemplate,
  };
}
