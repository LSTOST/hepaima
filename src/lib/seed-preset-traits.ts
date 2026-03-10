/**
 * 为指定产品写入通用版预设维度（与 scoring-universal / 报告维度一致），仅当该产品尚无维度时写入。
 */
import { prisma } from "@/lib/db";

const PRESET_TRAITS: {
  key: string;
  name: string;
  category: string;
  description?: string;
  icon?: string;
  color?: string;
}[] = [
  { key: "attachment_secure", name: "安全型依恋", category: "attachment", description: "对亲密关系感到安全、信任对方" },
  { key: "attachment_anxious", name: "焦虑型依恋", category: "attachment", description: "渴望亲密又担心被抛弃" },
  { key: "attachment_avoidant", name: "回避型依恋", category: "attachment", description: "习惯保持距离、不太依赖对方" },
  { key: "attachment_fearful", name: "恐惧型依恋", category: "attachment", description: "既想靠近又害怕受伤" },
  { key: "loveLanguage_words", name: "肯定的言辞", category: "loveLanguage", description: "赞美与鼓励让我感到被爱" },
  { key: "loveLanguage_time", name: "精心的时刻", category: "loveLanguage", description: "专注的陪伴让我感到被爱" },
  { key: "loveLanguage_gifts", name: "接受礼物", category: "loveLanguage", description: "礼物和惊喜让我感到被爱" },
  { key: "loveLanguage_service", name: "服务的行动", category: "loveLanguage", description: "对方为我做事让我感到被爱" },
  { key: "loveLanguage_touch", name: "身体的接触", category: "loveLanguage", description: "拥抱、牵手等让我感到被爱" },
  { key: "communication_openness", name: "开放表达", category: "communication" },
  { key: "communication_listening", name: "倾听", category: "communication" },
  { key: "communication_direct", name: "直接沟通", category: "communication" },
  { key: "values_family", name: "家庭观", category: "values" },
  { key: "values_frugal", name: "消费观", category: "values" },
  { key: "values_independence", name: "独立性", category: "values" },
  { key: "personality_introvert", name: "内向", category: "personality" },
  { key: "personality_extrovert", name: "外向", category: "personality" },
  { key: "personality_thinking", name: "思维型", category: "personality" },
  { key: "personality_feeling", name: "情感型", category: "personality" },
  { key: "conflict_withdraw", name: "回避冲突", category: "conflict", description: "倾向独处冷静或沉默" },
  { key: "conflict_repair", name: "主动修复", category: "conflict", description: "倾向道歉、沟通化解矛盾" },
];

export async function ensurePresetTraitsForProduct(productId: string): Promise<void> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });
  if (!product) return;

  const existing = await prisma.quizTrait.count({
    where: { productId },
  });
  if (existing > 0) return;

  await prisma.quizTrait.createMany({
    data: PRESET_TRAITS.map((t) => ({
      productId,
      key: t.key,
      name: t.name,
      category: t.category,
      description: t.description ?? null,
      icon: t.icon ?? null,
      color: t.color ?? null,
    })),
  });
}
