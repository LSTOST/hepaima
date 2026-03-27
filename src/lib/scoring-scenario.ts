import type { AttachmentType, LoveLanguage } from "@prisma/client";
import {
  calculateOverallScore,
  type Dimensions,
} from "./scoring";
import {
  getScenarioBySlug,
  type ScenarioDefinition,
  type ScenarioDimension,
} from "./scenario-quizzes";

export type ScenarioValueAnswer = { questionId: number; value: number };

const DIM_KEYS: ScenarioDimension[] = [
  "attachment",
  "loveLanguage",
  "communication",
  "values",
  "lifestyle",
  "conflict",
];

function answerMap(
  answers: ScenarioValueAnswer[],
): Map<number, number> {
  const m = new Map<number, number>();
  for (const a of answers) {
    m.set(a.questionId, a.value);
  }
  return m;
}

/** 将 1–5 分转为该题对维度的贡献（0–100） */
function valueToScore(v: number): number {
  if (v < 1 || v > 5 || Number.isNaN(v)) return 0;
  return ((v - 1) / 4) * 100;
}

function personDimensionScores(
  answers: Map<number, number>,
  def: ScenarioDefinition,
): Dimensions {
  const sums: Record<ScenarioDimension, { sum: number; n: number }> = {
    attachment: { sum: 0, n: 0 },
    loveLanguage: { sum: 0, n: 0 },
    communication: { sum: 0, n: 0 },
    values: { sum: 0, n: 0 },
    lifestyle: { sum: 0, n: 0 },
    conflict: { sum: 0, n: 0 },
  };

  for (const q of def.questions) {
    const v = answers.get(q.id);
    if (v == null) continue;
    const slot = sums[q.dimension];
    slot.sum += valueToScore(v);
    slot.n += 1;
  }

  const neutral = 50;
  const out = {} as Dimensions;
  for (const k of DIM_KEYS) {
    const { sum, n } = sums[k];
    out[k] = n > 0 ? Math.round(sum / n) : neutral;
  }
  return out;
}

function mergePairDimensions(a: Dimensions, b: Dimensions): Dimensions {
  const out = {} as Dimensions;
  for (const k of DIM_KEYS) {
    out[k] = Math.round((a[k] + b[k]) / 2);
  }
  return out;
}

function attachmentFromDim(score: number): AttachmentType {
  if (score >= 72) return "SECURE";
  if (score >= 58) return "AVOIDANT";
  if (score >= 42) return "ANXIOUS";
  return "FEARFUL";
}

function loveLanguageFromDim(score: number): LoveLanguage {
  if (score >= 75) return "WORDS";
  if (score >= 62) return "TIME";
  if (score >= 50) return "TOUCH";
  if (score >= 38) return "GIFTS";
  return "SERVICE";
}

export function scoreScenarioPair(
  initiatorAnswers: ScenarioValueAnswer[],
  partnerAnswers: ScenarioValueAnswer[],
  slug: string,
): {
  dimensions: Dimensions;
  overallScore: number;
  initiatorAttachment: AttachmentType;
  partnerAttachment: AttachmentType;
  initiatorLoveLanguage: LoveLanguage;
  partnerLoveLanguage: LoveLanguage;
} {
  const def = getScenarioBySlug(slug);
  if (!def) {
    throw new Error(`未知专题 slug: ${slug}`);
  }

  const ia = answerMap(initiatorAnswers);
  const pa = answerMap(partnerAnswers);
  const di = personDimensionScores(ia, def);
  const dp = personDimensionScores(pa, def);
  const merged = mergePairDimensions(di, dp);
  const overallScore = calculateOverallScore(merged);

  return {
    dimensions: merged,
    overallScore,
    initiatorAttachment: attachmentFromDim(di.attachment),
    partnerAttachment: attachmentFromDim(dp.attachment),
    initiatorLoveLanguage: loveLanguageFromDim(di.loveLanguage),
    partnerLoveLanguage: loveLanguageFromDim(dp.loveLanguage),
  };
}
