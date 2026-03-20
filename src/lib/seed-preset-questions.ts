/**
 * 将代码内预设题目融入后台：为指定产品确保存在
 * 通用版(UNIVERSAL) + 了解期/热恋期/稳定期 问卷并写入预设题目（仅当该问卷尚无题目时写入）。
 */
import { prisma } from "@/lib/db";
import { getQuestionsByStage } from "@/lib/questions";
import type { Stage } from "@/lib/questions";
import {
  universalQuestions,
  universalOptions,
} from "@/lib/questions-universal";
import { Stage as PrismaStage, QuestionType } from "@prisma/client";

const STAGES: { stage: Stage; prismaStage: PrismaStage; title: string }[] = [
  { stage: "AMBIGUOUS", prismaStage: "AMBIGUOUS", title: "了解期" },
  { stage: "ROMANCE", prismaStage: "ROMANCE", title: "热恋期" },
  { stage: "STABLE", prismaStage: "STABLE", title: "稳定期" },
];

const SCALE_OPTIONS = universalOptions.map((o, i) => ({
  key: String(o.value),
  text: o.label,
  order: i + 1,
}));

export async function ensurePresetQuestionsForProduct(productId: string): Promise<void> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });
  if (!product) return;

  let genericQ = await prisma.questionnaire.findFirst({
    where: { productId, stage: null },
    include: { _count: { select: { questions: true } } },
  });
  if (!genericQ) {
    genericQ = await prisma.questionnaire.create({
      data: {
        productId,
        title: `${product.name}测评（通用）`,
        stage: null,
        isActive: true,
      },
      include: { _count: { select: { questions: true } } },
    });
  }
  if (genericQ._count.questions === 0) {
    let order = 1;
    for (const q of universalQuestions) {
      await prisma.quizQuestion.create({
        data: {
          questionnaireId: genericQ!.id,
          externalId: q.id,
          order: order++,
          text: q.text,
          category: q.category,
          type: QuestionType.SCALE,
          required: true,
          scoringJson: q.scoring as object,
          options: {
            create: SCALE_OPTIONS.map((opt) => ({
              key: opt.key,
              text: opt.text,
              order: opt.order,
            })),
          },
        },
      });
    }
  }

  let universalQ = await prisma.questionnaire.findFirst({
    where: { productId, stage: "UNIVERSAL" },
    include: { _count: { select: { questions: true } } },
  });
  if (!universalQ) {
    universalQ = await prisma.questionnaire.create({
      data: {
        productId,
        title: `${product.name}-通用版`,
        stage: "UNIVERSAL",
        isActive: true,
      },
      include: { _count: { select: { questions: true } } },
    });
  }
  if (universalQ._count.questions === 0) {
    let order = 1;
    for (const q of universalQuestions) {
      await prisma.quizQuestion.create({
        data: {
          questionnaireId: universalQ!.id,
          externalId: q.id,
          order: order++,
          text: q.text,
          category: q.category,
          type: QuestionType.SCALE,
          required: true,
          scoringJson: q.scoring as object,
          options: {
            create: SCALE_OPTIONS.map((opt) => ({
              key: opt.key,
              text: opt.text,
              order: opt.order,
            })),
          },
        },
      });
    }
  }

  for (const { stage, prismaStage, title } of STAGES) {
    let questionnaire = await prisma.questionnaire.findFirst({
      where: { productId, stage: prismaStage },
      include: { _count: { select: { questions: true } } },
    });

    if (!questionnaire) {
      questionnaire = await prisma.questionnaire.create({
        data: {
          productId,
          title: `${product.name}-${title}`,
          stage: prismaStage,
          isActive: true,
        },
        include: { _count: { select: { questions: true } } },
      });
    }

    if (questionnaire._count.questions > 0) continue;

    const questions = getQuestionsByStage(stage);
    let order = 1;
    for (const q of questions) {
      await prisma.quizQuestion.create({
        data: {
          questionnaireId: questionnaire.id,
          externalId: q.id,
          order: order++,
          text: q.text,
          category: q.category,
          type: QuestionType.SINGLE_CHOICE,
          required: true,
          options: {
            create: q.options.map((opt, i) => ({
              key: opt.key,
              text: opt.text,
              order: i + 1,
              scoringJson:
                typeof (opt as { scores?: object }).scores === "object"
                  ? ((opt as { scores: object }).scores as object)
                  : undefined,
            })),
          },
        },
      });
    }
  }
}
