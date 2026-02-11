import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  calculateAttachmentType,
  calculateLoveLanguage,
  calculateDimensions,
  calculateOverallScore,
} from "@/lib/scoring";
import type { AnswerItem, Dimensions } from "@/lib/scoring";
import { getQuestionsByStage } from "@/lib/questions";
import type { Stage } from "@/lib/questions";
import { ATTACHMENT_LABELS, LOVE_LANGUAGE_LABELS } from "@/lib/resultGenerator";
import { generatePremiumReport } from "@/lib/ai";
import {
  calculateUniversalScores,
  determineAttachmentType as determineUniversalAttachmentType,
  determineLoveLanguage as determineUniversalLoveLanguage,
  calculateUniversalCompatibility,
  calculateUniversalDimensions,
} from "@/lib/scoring-universal";
import { universalQuestions } from "@/lib/questions-universal";

interface AnswerPayloadStaged {
  questionId: number;
  answer: string;
}

interface AnswerPayloadUniversal {
  questionId: number;
  value: number;
}

function toAnswerItems(answers: unknown): AnswerItem[] {
  const arr = Array.isArray(answers) ? answers : [];
  return arr.map((item) => ({
    questionId: Number((item as { questionId?: unknown }).questionId),
    answer: String((item as { answer?: unknown }).answer ?? ""),
  }));
}

function toUniversalAnswerItems(answers: unknown): { questionId: number; value: number }[] {
  const arr = Array.isArray(answers) ? answers : [];
  return arr.map((item) => ({
    questionId: Number((item as { questionId?: unknown }).questionId),
    value: Number((item as { value?: unknown }).value ?? 0),
  }));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    const sessionId = body?.sessionId as string | undefined;
    const deviceId = body?.deviceId as string | undefined;
    const answers = body?.answers as AnswerPayloadStaged[] | AnswerPayloadUniversal[] | undefined;

    if (!sessionId || !deviceId || !Array.isArray(answers)) {
      return NextResponse.json(
        { message: "sessionId、deviceId、answers 都是必填项" },
        { status: 400 },
      );
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { message: "未找到对应的测试会话" },
        { status: 404 },
      );
    }

    let role: "initiator" | "partner" | null = null;
    if (deviceId === session.initiatorDeviceId) {
      role = "initiator";
    } else if (deviceId === session.partnerDeviceId) {
      role = "partner";
    }

    if (!role) {
      return NextResponse.json(
        { message: "当前设备无权提交该测试的答案" },
        { status: 403 },
      );
    }

    const now = new Date();
    const data: Record<string, unknown> = {};

    if (role === "initiator") {
      data.initiatorAnswers = answers;
      data.initiatorCompletedAt = now;
    } else {
      data.partnerAnswers = answers;
      data.partnerCompletedAt = now;
    }

    let updated = await prisma.session.update({
      where: { id: sessionId },
      data,
    });

    const bothCompleted =
      !!updated.initiatorCompletedAt && !!updated.partnerCompletedAt;

    let resultReady = false;
    const sessionMode = (session as { mode?: string }).mode ?? "STAGED";

    if (bothCompleted && updated.status !== "COMPLETED") {
      console.log("===== 双方完成，开始处理 =====");
      console.log("时间:", new Date().toISOString());

      type ReportPayload = {
        stage: string;
        initiatorName: string;
        partnerName: string;
        initiatorAttachment: string;
        partnerAttachment: string;
        initiatorLoveLanguage: string;
        partnerLoveLanguage: string;
        overallScore: number;
        dimensions: Record<string, number>;
      };
      let reportPayload: ReportPayload | null = null;
      let createdResultId: string | null = null;

      const scoreStart = Date.now();
      if (sessionMode === "UNIVERSAL") {
        const initiatorAnswers = toUniversalAnswerItems(updated.initiatorAnswers);
        const partnerAnswers = toUniversalAnswerItems(updated.partnerAnswers);

        const initiatorScores = calculateUniversalScores(
          initiatorAnswers,
          universalQuestions
        );
        const partnerScores = calculateUniversalScores(
          partnerAnswers,
          universalQuestions
        );

        const initiatorAttachment = determineUniversalAttachmentType(
          initiatorScores.attachment
        );
        const partnerAttachment = determineUniversalAttachmentType(
          partnerScores.attachment
        );
        const initiatorLoveLanguage = determineUniversalLoveLanguage(
          initiatorScores.loveLanguage
        );
        const partnerLoveLanguage = determineUniversalLoveLanguage(
          partnerScores.loveLanguage
        );

        const overallScore = calculateUniversalCompatibility(
          initiatorScores,
          partnerScores
        );
        const dimensions = calculateUniversalDimensions(
          initiatorScores,
          partnerScores
        );

        const resultStart = Date.now();
        const result = await prisma.result.create({
          data: {
            sessionId,
            overallScore,
            dimensions: dimensions as unknown as Record<string, number>,
            initiatorAttachment,
            partnerAttachment,
            initiatorLoveLanguage,
            partnerLoveLanguage,
            initiatorTraits: initiatorScores.personality,
            partnerTraits: partnerScores.personality,
          },
        });
        createdResultId = result.id;
        console.log("计分完成，耗时:", Date.now() - scoreStart, "ms");
        console.log("Result 创建完成，耗时:", Date.now() - resultStart, "ms");

        reportPayload = {
          stage: updated.stage as string,
          initiatorName: updated.initiatorName,
          partnerName: updated.partnerName ?? "TA",
          initiatorAttachment: ATTACHMENT_LABELS[initiatorAttachment] ?? initiatorAttachment,
          partnerAttachment: ATTACHMENT_LABELS[partnerAttachment] ?? partnerAttachment,
          initiatorLoveLanguage: LOVE_LANGUAGE_LABELS[initiatorLoveLanguage] ?? initiatorLoveLanguage,
          partnerLoveLanguage: LOVE_LANGUAGE_LABELS[partnerLoveLanguage] ?? partnerLoveLanguage,
          overallScore,
          dimensions: dimensions as Record<string, number>,
        };
      } else {
        const initiatorAnswers = toAnswerItems(updated.initiatorAnswers);
        const partnerAnswers = toAnswerItems(updated.partnerAnswers);
        const stage = updated.stage as Stage;
        const questions = getQuestionsByStage(stage);

        const initiatorAttachment = calculateAttachmentType(
          initiatorAnswers,
          questions
        );
        const partnerAttachment = calculateAttachmentType(
          partnerAnswers,
          questions
        );
        const initiatorLoveLanguage = calculateLoveLanguage(
          initiatorAnswers,
          questions
        );
        const partnerLoveLanguage = calculateLoveLanguage(
          partnerAnswers,
          questions
        );

        const initiatorDimensions = calculateDimensions(
          initiatorAnswers,
          questions
        );
        const partnerDimensions = calculateDimensions(
          partnerAnswers,
          questions
        );

        const mergedDimensions: Dimensions = {
          attachment: Math.round(
            (initiatorDimensions.attachment + partnerDimensions.attachment) / 2
          ),
          loveLanguage: Math.round(
            (initiatorDimensions.loveLanguage + partnerDimensions.loveLanguage) / 2
          ),
          communication: Math.round(
            (initiatorDimensions.communication +
              partnerDimensions.communication) /
              2
          ),
          values: Math.round(
            (initiatorDimensions.values + partnerDimensions.values) / 2
          ),
          lifestyle: Math.round(
            (initiatorDimensions.lifestyle + partnerDimensions.lifestyle) / 2
          ),
          conflict: Math.round(
            (initiatorDimensions.conflict + partnerDimensions.conflict) / 2
          ),
        };

        const overallScore = calculateOverallScore(mergedDimensions);

        const resultStart = Date.now();
        const result = await prisma.result.create({
          data: {
            sessionId,
            overallScore,
            dimensions: mergedDimensions as unknown as Record<string, number>,
            initiatorAttachment,
            partnerAttachment,
            initiatorLoveLanguage,
            partnerLoveLanguage,
          },
        });
        createdResultId = result.id;
        console.log("计分完成，耗时:", Date.now() - scoreStart, "ms");
        console.log("Result 创建完成，耗时:", Date.now() - resultStart, "ms");

        reportPayload = {
          stage: updated.stage as string,
          initiatorName: updated.initiatorName,
          partnerName: updated.partnerName ?? "TA",
          initiatorAttachment: ATTACHMENT_LABELS[initiatorAttachment] ?? initiatorAttachment,
          partnerAttachment: ATTACHMENT_LABELS[partnerAttachment] ?? partnerAttachment,
          initiatorLoveLanguage: LOVE_LANGUAGE_LABELS[initiatorLoveLanguage] ?? initiatorLoveLanguage,
          partnerLoveLanguage: LOVE_LANGUAGE_LABELS[partnerLoveLanguage] ?? partnerLoveLanguage,
          overallScore,
          dimensions: mergedDimensions as Record<string, number>,
        };
      }

      await prisma.session.update({
        where: { id: sessionId },
        data: { status: "COMPLETED" },
      });

      // 基础报告由前端通过 GET /api/v1/result/[sessionId]/report/stream 流式拉取
      if (reportPayload && createdResultId) {
        const payload = reportPayload;
        const resultId = createdResultId;
        generatePremiumReport(payload)
          .then(async (premiumReport) => {
            await prisma.result.update({
              where: { id: resultId },
              data: { reportPremium: JSON.parse(JSON.stringify(premiumReport)) },
            });
            console.log("深度报告生成完毕");
          })
          .catch((err) => {
            console.error("深度报告生成失败:", err);
          });
      }

      resultReady = true;
    }

    return NextResponse.json({
      success: true,
      bothCompleted,
      resultReady,
    });
  } catch (error) {
    console.error("POST /api/v1/quiz/submit error:", error);
    return NextResponse.json(
      { message: "提交答案失败，请稍后再试" },
      { status: 500 },
    );
  }
}
