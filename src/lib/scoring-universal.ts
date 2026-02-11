/**
 * 通用版测试计分逻辑
 * 答案格式：{ questionId, value }，value 为 1-7
 */

import type { UniversalQuestion } from "./questions-universal";

export interface UniversalScores {
  attachment: { secure: number; anxious: number; avoidant: number; fearful: number };
  loveLanguage: { words: number; time: number; gifts: number; service: number; touch: number };
  communication: { openness: number; listening: number; direct: number };
  values: { family: number; frugal: number; independence: number };
  personality: { introvert: number; extrovert: number; thinking: number; feeling: number };
  conflict: { withdraw: number; repair: number };
}

const EMPTY_SCORES: UniversalScores = {
  attachment: { secure: 0, anxious: 0, avoidant: 0, fearful: 0 },
  loveLanguage: { words: 0, time: 0, gifts: 0, service: 0, touch: 0 },
  communication: { openness: 0, listening: 0, direct: 0 },
  values: { family: 0, frugal: 0, independence: 0 },
  personality: { introvert: 0, extrovert: 0, thinking: 0, feeling: 0 },
  conflict: { withdraw: 0, repair: 0 },
};

function parseDimension(dimension: string): { category: keyof UniversalScores; key: string } | null {
  const idx = dimension.indexOf("_");
  if (idx === -1) return null;
  const category = dimension.slice(0, idx) as keyof UniversalScores;
  const key = dimension.slice(idx + 1);
  if (!(category in EMPTY_SCORES)) return null;
  const shape = EMPTY_SCORES[category] as Record<string, number>;
  if (!(key in shape)) return null;
  return { category, key };
}

/**
 * 根据答案和题目计算各维度原始分数
 */
export function calculateUniversalScores(
  answers: Array<{ questionId: number; value: number }>,
  questions: UniversalQuestion[]
): UniversalScores {
  const scores: UniversalScores = JSON.parse(JSON.stringify(EMPTY_SCORES));

  const questionMap = new Map(questions.map((q) => [q.id, q]));

  for (const answer of answers) {
    const question = questionMap.get(answer.questionId);
    if (!question) continue;
    const value = Math.min(7, Math.max(1, answer.value));
    const index = value - 1;

    for (const scoring of question.scoring) {
      if (!scoring.weights || scoring.weights.length !== 7) continue;
      const parsed = parseDimension(scoring.dimension);
      if (!parsed) continue;
      const weight = scoring.weights[index] ?? 0;
      const categoryScores = scores[parsed.category] as Record<string, number>;
      categoryScores[parsed.key] = (categoryScores[parsed.key] ?? 0) + weight;
    }
  }

  return scores;
}

/**
 * 依恋类型：返回得分最高的类型
 */
export function determineAttachmentType(
  attachmentScores: UniversalScores["attachment"]
): "SECURE" | "ANXIOUS" | "AVOIDANT" | "FEARFUL" {
  const entries = Object.entries(attachmentScores) as [keyof typeof attachmentScores, number][];
  const [type] = entries.sort((a, b) => b[1] - a[1])[0] ?? ["SECURE", 0];
  const map: Record<string, "SECURE" | "ANXIOUS" | "AVOIDANT" | "FEARFUL"> = {
    secure: "SECURE",
    anxious: "ANXIOUS",
    avoidant: "AVOIDANT",
    fearful: "FEARFUL",
  };
  return map[type] ?? "SECURE";
}

/**
 * 爱的语言：返回得分最高的类型
 */
export function determineLoveLanguage(
  loveLanguageScores: UniversalScores["loveLanguage"]
): "WORDS" | "TIME" | "GIFTS" | "SERVICE" | "TOUCH" {
  const entries = Object.entries(loveLanguageScores) as [keyof typeof loveLanguageScores, number][];
  const [lang] = entries.sort((a, b) => b[1] - a[1])[0] ?? ["words", 0];
  const map: Record<string, "WORDS" | "TIME" | "GIFTS" | "SERVICE" | "TOUCH"> = {
    words: "WORDS",
    time: "TIME",
    gifts: "GIFTS",
    service: "SERVICE",
    touch: "TOUCH",
  };
  return map[lang] ?? "WORDS";
}

/**
 * 余弦相似度，归一化到 0-1（零向量返回 0.5 表示中性）
 */
function cosineSimilarityNormalized(a: number[], b: number[]): number {
  const dot = a.reduce((sum, val, i) => sum + val * (b[i] ?? 0), 0);
  const magA = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
  const magB = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
  if (magA === 0 || magB === 0) return 0.5;
  const cos = dot / (magA * magB);
  return (cos + 1) / 2;
}

/**
 * 依恋契合度：安全型高、焦虑/回避互补等，这里用向量相似度简化
 */
function attachmentCompatibility(
  a: UniversalScores["attachment"],
  b: UniversalScores["attachment"]
): number {
  const va = Object.values(a);
  const vb = Object.values(b);
  return cosineSimilarityNormalized(va, vb);
}

/**
 * 冲突处理契合度：withdraw/repair 互补或一致均可，用向量相似度
 */
function conflictCompatibility(
  a: UniversalScores["conflict"],
  b: UniversalScores["conflict"]
): number {
  const va = Object.values(a);
  const vb = Object.values(b);
  return cosineSimilarityNormalized(va, vb);
}

/**
 * 计算两人综合契合度 0-100
 * 权重：attachment 30%，loveLanguage 25%，communication 20%，values 15%，conflict 10%
 */
export function calculateUniversalCompatibility(
  scoresA: UniversalScores,
  scoresB: UniversalScores
): number {
  const w1 = 0.3;
  const w2 = 0.25;
  const w3 = 0.2;
  const w4 = 0.15;
  const w5 = 0.1;

  const c1 = attachmentCompatibility(scoresA.attachment, scoresB.attachment);
  const c2 = cosineSimilarityNormalized(
    Object.values(scoresA.loveLanguage),
    Object.values(scoresB.loveLanguage)
  );
  const c3 = cosineSimilarityNormalized(
    Object.values(scoresA.communication),
    Object.values(scoresB.communication)
  );
  const c4 = cosineSimilarityNormalized(
    Object.values(scoresA.values),
    Object.values(scoresB.values)
  );
  const c5 = conflictCompatibility(scoresA.conflict, scoresB.conflict);

  const raw = c1 * w1 + c2 * w2 + c3 * w3 + c4 * w4 + c5 * w5;
  return Math.round(Math.min(100, Math.max(0, raw * 100)));
}

/**
 * 各维度契合度 0-100，用于六维进度条
 * 返回 attachment, loveLanguage, communication, values, personality, conflict
 */
export function calculateUniversalDimensions(
  scoresA: UniversalScores,
  scoresB: UniversalScores
): Record<string, number> {
  const toPct = (sim: number) => Math.round(Math.min(100, Math.max(0, sim * 100)));

  return {
    attachment: toPct(attachmentCompatibility(scoresA.attachment, scoresB.attachment)),
    loveLanguage: toPct(
      cosineSimilarityNormalized(
        Object.values(scoresA.loveLanguage),
        Object.values(scoresB.loveLanguage)
      )
    ),
    communication: toPct(
      cosineSimilarityNormalized(
        Object.values(scoresA.communication),
        Object.values(scoresB.communication)
      )
    ),
    values: toPct(
      cosineSimilarityNormalized(Object.values(scoresA.values), Object.values(scoresB.values))
    ),
    personality: toPct(
      cosineSimilarityNormalized(
        Object.values(scoresA.personality),
        Object.values(scoresB.personality)
      )
    ),
    conflict: toPct(conflictCompatibility(scoresA.conflict, scoresB.conflict)),
  };
}
