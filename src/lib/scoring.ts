/**
 * 测试计分逻辑
 */

import type { Question, QuestionOption } from "./questions";

export type AnswerItem = { questionId: number; answer: string };

export type AttachmentType = "SECURE" | "ANXIOUS" | "AVOIDANT" | "FEARFUL";
export type LoveLanguageType = "WORDS" | "TIME" | "GIFTS" | "SERVICE" | "TOUCH";

export interface Dimensions {
  attachment: number;
  loveLanguage: number;
  communication: number;
  values: number;
  lifestyle: number;
  conflict: number;
}

function getAnswerMap(answers: AnswerItem[]): Map<number, string> {
  const map = new Map<number, string>();
  for (const a of answers) {
    map.set(a.questionId, a.answer);
  }
  return map;
}

function findSelectedOption(optionKey: string, options: QuestionOption[]): QuestionOption | undefined {
  return options.find((o) => o.key === optionKey);
}

/**
 * 统计每种依恋类型的总分，返回得分最高的类型
 */
export function calculateAttachmentType(
  answers: AnswerItem[],
  questions: Question[]
): AttachmentType {
  const answerMap = getAnswerMap(answers);
  const totals = { secure: 0, anxious: 0, avoidant: 0, fearful: 0 };

  for (const q of questions) {
    if (q.category !== "attachment") continue;
    const answerKey = answerMap.get(q.id);
    if (!answerKey) continue;

    const opt = findSelectedOption(answerKey, q.options);
    const att = opt?.scores?.attachment;
    if (att) {
      totals.secure += att.secure ?? 0;
      totals.anxious += att.anxious ?? 0;
      totals.avoidant += att.avoidant ?? 0;
      totals.fearful += att.fearful ?? 0;
    }
  }

  const entries = Object.entries(totals) as [keyof typeof totals, number][];
  const max = entries.reduce((a, b) => (b[1] > a[1] ? b : a), entries[0] ?? ["secure", 0]);
  const typeMap = { secure: "SECURE", anxious: "ANXIOUS", avoidant: "AVOIDANT", fearful: "FEARFUL" } as const;
  return typeMap[max[0]];
}

/**
 * 统计每种爱的语言的总分，返回得分最高的类型
 */
export function calculateLoveLanguage(
  answers: AnswerItem[],
  questions: Question[]
): LoveLanguageType {
  const answerMap = getAnswerMap(answers);
  const totals = { words: 0, time: 0, gifts: 0, service: 0, touch: 0 };

  for (const q of questions) {
    if (q.category !== "loveLanguage") continue;
    const answerKey = answerMap.get(q.id);
    if (!answerKey) continue;

    const opt = findSelectedOption(answerKey, q.options);
    const ll = opt?.scores?.loveLanguage;
    if (ll) {
      totals.words += ll.words ?? 0;
      totals.time += ll.time ?? 0;
      totals.gifts += ll.gifts ?? 0;
      totals.service += ll.service ?? 0;
      totals.touch += ll.touch ?? 0;
    }
  }

  const entries = Object.entries(totals) as [keyof typeof totals, number][];
  const max = entries.reduce((a, b) => (b[1] > a[1] ? b : a), entries[0] ?? ["words", 0]);
  const typeMap = { words: "WORDS", time: "TIME", gifts: "GIFTS", service: "SERVICE", touch: "TOUCH" } as const;
  return typeMap[max[0]];
}

/**
 * 按 category 分组计算每个维度的百分比得分（0-100）
 */
export function calculateDimensions(
  answers: AnswerItem[],
  questions: Question[]
): Dimensions {
  const answerMap = getAnswerMap(answers);
  const sums: Record<string, number> = {
    attachment: 0,
    loveLanguage: 0,
    communication: 0,
    values: 0,
    lifestyle: 0,
    conflict: 0,
  };
  const maxSums: Record<string, number> = { ...sums };

  for (const q of questions) {
    const answerKey = answerMap.get(q.id);
    if (!answerKey) continue;

    const opt = findSelectedOption(answerKey, q.options);
    if (!opt?.scores) continue;

    const cat = q.category;
    if (cat === "attachment") {
      const att = opt.scores.attachment;
      const secure = att?.secure ?? 0;
      sums.attachment += secure;
      maxSums.attachment += 4;
    } else if (cat === "loveLanguage") {
      const ll = opt.scores.loveLanguage;
      const maxSub = Math.max(
        ll?.words ?? 0,
        ll?.time ?? 0,
        ll?.gifts ?? 0,
        ll?.service ?? 0,
        ll?.touch ?? 0
      );
      sums.loveLanguage += maxSub;
      maxSums.loveLanguage += 4;
    } else if (cat === "communication") {
      sums.communication += opt.scores.communication ?? 0;
      maxSums.communication += 4;
    } else if (cat === "values") {
      sums.values += opt.scores.values ?? 0;
      maxSums.values += 4;
    } else if (cat === "lifestyle") {
      sums.lifestyle += opt.scores.lifestyle ?? 0;
      maxSums.lifestyle += 4;
    } else if (cat === "conflict") {
      sums.conflict += opt.scores.conflict ?? 0;
      maxSums.conflict += 4;
    }
  }

  const toPercent = (sum: number, max: number) =>
    max > 0 ? Math.round((sum / max) * 100) : 0;

  return {
    attachment: Math.min(100, toPercent(sums.attachment, maxSums.attachment)),
    loveLanguage: Math.min(100, toPercent(sums.loveLanguage, maxSums.loveLanguage)),
    communication: Math.min(100, toPercent(sums.communication, maxSums.communication)),
    values: Math.min(100, toPercent(sums.values, maxSums.values)),
    lifestyle: Math.min(100, toPercent(sums.lifestyle, maxSums.lifestyle)),
    conflict: Math.min(100, toPercent(sums.conflict, maxSums.conflict)),
  };
}

/**
 * 六个维度加权平均：attachment 25%、loveLanguage 25%、communication 20%、values 15%、lifestyle 10%、conflict 5%
 * 返回 0-100 的整数
 */
export function calculateOverallScore(dimensions: Dimensions): number {
  const { attachment, loveLanguage, communication, values, lifestyle, conflict } = dimensions;
  const score =
    attachment * 0.25 +
    loveLanguage * 0.25 +
    communication * 0.2 +
    values * 0.15 +
    lifestyle * 0.1 +
    conflict * 0.05;
  return Math.round(Math.max(0, Math.min(100, score)));
}

/**
 * 根据总分返回契合度等级
 */
export function getCompatibilityLevel(score: number): string {
  if (score >= 90) return "天作之合";
  if (score >= 80) return "心有灵犀";
  if (score >= 70) return "相互吸引";
  if (score >= 60) return "有待磨合";
  return "需要努力";
}
