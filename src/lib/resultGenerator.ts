/**
 * 测试报告生成逻辑
 * 双方完成后计算契合度并创建 Result 记录
 */

import type { PrismaClient } from "@prisma/client";
import { getQuestionsByStage } from "@/lib/questions";
import type { Stage } from "@/lib/questions";
import {
  calculateAttachmentType,
  calculateLoveLanguage,
  calculateDimensions,
  calculateOverallScore,
} from "@/lib/scoring";
import type { AnswerItem, Dimensions } from "@/lib/scoring";

const ATTACHMENT_LABELS: Record<string, string> = {
  SECURE: "安全型",
  ANXIOUS: "焦虑型",
  AVOIDANT: "回避型",
  FEARFUL: "混乱型",
};

const LOVE_LANGUAGE_LABELS: Record<string, string> = {
  WORDS: "肯定言辞",
  TIME: "精心时刻",
  GIFTS: "礼物",
  SERVICE: "服务行为",
  TOUCH: "身体接触",
};

export async function generateResult(
  prisma: PrismaClient,
  sessionId: string
): Promise<void> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session || session.status !== "COMPLETED") return;
  if (session.initiatorAnswers == null || session.partnerAnswers == null) return;

  const initiatorAnswers = session.initiatorAnswers as unknown as AnswerItem[];
  const partnerAnswers = session.partnerAnswers as unknown as AnswerItem[];
  const stage = session.stage as Stage;
  const questions = getQuestionsByStage(stage);

  const initiatorAttachment = calculateAttachmentType(initiatorAnswers, questions);
  const partnerAttachment = calculateAttachmentType(partnerAnswers, questions);
  const initiatorLoveLanguage = calculateLoveLanguage(initiatorAnswers, questions);
  const partnerLoveLanguage = calculateLoveLanguage(partnerAnswers, questions);

  const initiatorDims = calculateDimensions(initiatorAnswers, questions);
  const partnerDims = calculateDimensions(partnerAnswers, questions);

  const dims: Dimensions = {
    attachment: Math.round((initiatorDims.attachment + partnerDims.attachment) / 2),
    loveLanguage: Math.round((initiatorDims.loveLanguage + partnerDims.loveLanguage) / 2),
    communication: Math.round((initiatorDims.communication + partnerDims.communication) / 2),
    values: Math.round((initiatorDims.values + partnerDims.values) / 2),
    lifestyle: Math.round((initiatorDims.lifestyle + partnerDims.lifestyle) / 2),
    conflict: Math.round((initiatorDims.conflict + partnerDims.conflict) / 2),
  };

  const overallScore = calculateOverallScore(dims);

  await prisma.result.upsert({
    where: { sessionId },
    create: {
      sessionId,
      overallScore,
      dimensions: dims as unknown as Record<string, number>,
      initiatorAttachment,
      partnerAttachment,
      initiatorLoveLanguage,
      partnerLoveLanguage,
    },
    update: {
      overallScore,
      dimensions: dims as unknown as Record<string, number>,
      initiatorAttachment,
      partnerAttachment,
      initiatorLoveLanguage,
      partnerLoveLanguage,
    },
  });
}

export { ATTACHMENT_LABELS, LOVE_LANGUAGE_LABELS };
