import { prisma } from "@/lib/db";
import type { UniversalQuestion } from "./questions-universal";
import type { Question, Stage as LegacyStage } from "./questions";
import { Stage as PrismaStage, QuestionType } from "@prisma/client";

// 单产品场景下，先简单取任意一个激活问卷。后续多产品可按 productId 过滤。
async function getActiveQuestionnaire(stage: PrismaStage | "UNIVERSAL") {
  const q = await prisma.questionnaire.findFirst({
    where: {
      stage,
      isActive: true,
    },
    include: {
      questions: {
        include: { options: true },
        orderBy: { order: "asc" },
      },
    },
  });
  if (!q) {
    throw new Error(`找不到阶段为 ${stage} 的问卷配置，请先在后台配置或运行 seed 脚本`);
  }
  return q;
}

export async function getUniversalQuestionsFromDb(): Promise<UniversalQuestion[]> {
  const questionnaire = await getActiveQuestionnaire("UNIVERSAL");

  return questionnaire.questions.map((q) => {
    const scoring =
      (q.scoringJson as UniversalQuestion["scoring"] | null) ?? [];

    return {
      id: q.externalId ?? q.order,
      category: (q.category ??
        "attachment") as UniversalQuestion["category"],
      text: q.text,
      scoring,
    };
  });
}

export async function getStagedQuestionsFromDb(
  stage: LegacyStage,
): Promise<Question[]> {
  const prismaStage = stage as unknown as PrismaStage;
  const questionnaire = await getActiveQuestionnaire(prismaStage);

  return questionnaire.questions.map((q) => {
    const options = q.options
      .sort((a, b) => a.order - b.order)
      .map((opt) => ({
        key: opt.key,
        text: opt.text,
        scores: (opt.scoringJson as Question["options"][number]["scores"]) ??
          {},
      }));

    return {
      id: q.externalId ?? q.order,
      stage,
      category: (q.category ?? "attachment") as Question["category"],
      text: q.text,
      options,
    };
  });
}

