import {
  PERSONAL_DIMENSION_LABELS,
  PERSONAL_LEGACY_QUESTION_IDS,
  PERSONAL_READINESS_QUESTIONS,
  type PersonalReadinessDimension,
} from "./questions";
import { getPersonalTrackQuestionIds } from "./tracks";

export type PersonalAnswerItem = { questionId: number; value: number };

export type PersonalDimensionsRecord = Partial<
  Record<PersonalReadinessDimension, number>
> & Record<string, number>;

/** 子维度：0–100 + 1–5 量表均值（由百分制反推，便于对照题干） */
export interface PersonalDimensionBreakdownItem {
  key: PersonalReadinessDimension;
  label: string;
  score0to100: number;
  mean1to5: number;
}

export interface PersonalReadinessReportBasic {
  type: "personal_readiness";
  /** 规则模板：综合说明（非评判） */
  summary: string;
  /** 相对突出的资源（1～2 条，简短） */
  highlights: string[];
  /** 你可能想多留意的点（2～4 条，描述性、非评判）；兼容旧字段名 cautions */
  cautions: string[];
  /** 温和下一步：引导第二幕 / 第三幕 */
  nextStep: string;
  dimensionBreakdown: PersonalDimensionBreakdownItem[];
  /** 配置 OpenRouter 时由 DeepSeek 等生成的补充段落（仅维度分与元数据，无双人信息） */
  aiSynthesis?: string;
  /** 配置 OpenRouter 时的短建议一句 */
  aiAdvice?: string;
}

const DIM_ORDER: PersonalReadinessDimension[] = [
  "attachmentReadiness",
  "communicationOpenness",
  "conflictSkills",
  "boundariesAutonomy",
  "commitmentReadiness",
];

function valueToPercent(value: number): number {
  const v = Math.min(5, Math.max(1, value));
  return Math.round(((v - 1) / 4) * 100);
}

/** 将维度 0–100 转为与 1–5 量表对应的均值展示 */
export function score0to100ToMean1to5(score0to100: number): number {
  const s = Math.min(100, Math.max(0, score0to100));
  const mean = 1 + (s / 100) * 4;
  return Math.round(mean * 10) / 10;
}

function buildDimensionBreakdown(
  dimensions: PersonalDimensionsRecord,
  activeDimensions: PersonalReadinessDimension[],
): PersonalDimensionBreakdownItem[] {
  return activeDimensions
    .map((key) => {
      const score0to100 = dimensions[key] ?? 0;
      return {
        key,
        label: PERSONAL_DIMENSION_LABELS[key],
        score0to100,
        mean1to5: score0to100ToMean1to5(score0to100),
      };
    })
    .sort((a, b) => b.score0to100 - a.score0to100);
}

/**
 * 根据作答计算各维 0–100（仅包含有题目的维度）与总分（有分维度的平均）
 * @param questionIdFilter null 时不应再出现；调用方应传入 legacy 或子测评题集
 */
export function scorePersonalReadiness(
  answers: PersonalAnswerItem[],
  questionIdFilter: ReadonlySet<number>,
): {
  overallScore: number;
  dimensions: PersonalDimensionsRecord;
  activeDimensions: PersonalReadinessDimension[];
} {
  const byDim: Record<PersonalReadinessDimension, number[]> = {
    attachmentReadiness: [],
    communicationOpenness: [],
    conflictSkills: [],
    boundariesAutonomy: [],
    commitmentReadiness: [],
  };

  for (const a of answers) {
    if (!questionIdFilter.has(a.questionId)) continue;
    const q = PERSONAL_READINESS_QUESTIONS.find((x) => x.id === a.questionId);
    if (!q || a.value < 1 || a.value > 5) continue;
    byDim[q.dimension].push(valueToPercent(a.value));
  }

  const dimensions = {} as PersonalDimensionsRecord;
  const activeDimensions: PersonalReadinessDimension[] = [];

  for (const d of DIM_ORDER) {
    const arr = byDim[d];
    if (arr.length === 0) continue;
    const score = Math.round(arr.reduce((s, x) => s + x, 0) / arr.length);
    dimensions[d] = score;
    activeDimensions.push(d);
  }

  const overallScore =
    activeDimensions.length === 0
      ? 0
      : Math.round(
          activeDimensions.reduce((s, d) => s + (dimensions[d] ?? 0), 0) /
            activeDimensions.length,
        );

  return { overallScore, dimensions, activeDimensions };
}

function sortedDimsFromPartial(
  dimensions: PersonalDimensionsRecord,
  activeDimensions: PersonalReadinessDimension[],
): { key: PersonalReadinessDimension; score: number }[] {
  return activeDimensions
    .map((key) => ({ key, score: dimensions[key] ?? 0 }))
    .sort((a, b) => b.score - a.score);
}

/** 规则化报告（不调用 AI）；AI 补充在 submit 中合并 */
export function buildPersonalReadinessReport(
  dimensions: PersonalDimensionsRecord,
  overallScore: number,
  activeDimensions: PersonalReadinessDimension[],
): PersonalReadinessReportBasic {
  const sorted = sortedDimsFromPartial(dimensions, activeDimensions);
  const top = sorted.slice(0, Math.min(2, sorted.length));
  const bottom = [...sorted].reverse();

  let summary: string;
  if (overallScore >= 78) {
    summary =
      "在本套题目涉及的维度上，你的自我觉察基础较好。得分只是参考，用来看见自己的模式与节奏，没有「合格线」。";
  } else if (overallScore >= 55) {
    summary =
      "你的作答呈现出「有觉察、也在磨合中」的状态：有些方面已经比较稳定，另一些还有练习空间。这很常见，不代表你不适合亲密或认真关系。";
  } else {
    summary =
      "从本套自测看，部分相关题目上得分偏低。这更像在标出「值得慢慢留意的区域」，而不是对你个人的评判。若曾经历创伤性关系，建议同时寻求专业心理咨询支持。";
  }

  const highlights: string[] = top.map(
    ({ key, score }) =>
      `「${PERSONAL_DIMENSION_LABELS[key]}」相对从容（约 ${score}/100，量表均值约 ${score0to100ToMean1to5(score)}）：可视为你进入亲密或认真关系时的一份内在资源。`,
  );

  const attentionPool: string[] = [];
  for (const { key, score } of bottom) {
    if (score >= 58) continue;
    attentionPool.push(
      `关于「${PERSONAL_DIMENSION_LABELS[key]}」：当前画像偏保守一些（约 ${score}/100）。这不说明对错，只表示你可能在这里多花一点自我观察——例如用日记或信任的人聊一聊，慢慢试一小步。`,
    );
  }
  if (attentionPool.length === 0) {
    attentionPool.push(
      "各维度相对均衡时，仍值得观察：在压力大或疲惫时，你更容易在「表达、退让、靠近、独处」里偏向哪一端——这往往比平均分更能说明当下的你。",
    );
    attentionPool.push(
      "若你目前单身或关系尚未确定，这些模式同样适用：它们描述的是你在亲密/认真关系里常见的反应习惯，而非针对某位具体对象。",
    );
  }

  let cautions: string[];
  if (attentionPool.length === 1) {
    cautions = [
      attentionPool[0],
      "阅读和对比各维度时，不必追求每一项都「高」：有时偏低只是在提醒你当下更耗能的区域，而不是缺陷。",
    ];
  } else {
    const n = Math.min(4, Math.max(2, attentionPool.length));
    cautions = attentionPool.slice(0, n);
  }

  const nextStep =
    "若你愿意继续探索：可在首页「按关系阶段选择」里和（未来的）TA 一起做双人测评，更看「组合起来怎样相处」；也可以先到「按现实场景选择」里，从最常卡住的一类小事专项练起。";

  return {
    type: "personal_readiness",
    summary,
    highlights,
    cautions,
    nextStep,
    dimensionBreakdown: buildDimensionBreakdown(dimensions, activeDimensions),
  };
}

export function scorePersonalReadinessFull(
  answers: PersonalAnswerItem[],
  personalSlug: string | null | undefined,
) {
  const ids = getPersonalTrackQuestionIds(personalSlug ?? null);
  const filter = new Set<number>(
    ids == null
      ? [...PERSONAL_LEGACY_QUESTION_IDS]
      : [...ids],
  );

  const { overallScore, dimensions, activeDimensions } =
    scorePersonalReadiness(answers, filter);
  const reportBasic = buildPersonalReadinessReport(
    dimensions,
    overallScore,
    activeDimensions,
  );
  return { overallScore, dimensions, reportBasic };
}
