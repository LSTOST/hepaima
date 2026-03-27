import type { Dimensions } from "./scoring";

export type ScenarioDimension = keyof Dimensions;

export interface ScenarioQuestion {
  id: number;
  text: string;
  dimension: ScenarioDimension;
}

export interface ScenarioDefinition {
  slug: string;
  title: string;
  subtitle: string;
  minutes: number;
  questions: ScenarioQuestion[];
}

function Q(
  baseId: number,
  rows: readonly (readonly [string, ScenarioDimension])[],
): ScenarioQuestion[] {
  return rows.map(([text, dimension], i) => ({
    id: baseId + i,
    text,
    dimension,
  }));
}

/**
 * 6 套专题量表：1–5 分，对应「完全不符合 → 完全符合」。
 * 计分与六维结构见 `scoring-scenario.ts`，报告沿用简版 AI + 付费深度版。
 */
export const SCENARIO_DEFINITIONS: ScenarioDefinition[] = [
  {
    slug: "daily_communication",
    title: "日常沟通与倾听",
    subtitle: "线上回复、打断与情绪是否被接住",
    minutes: 5,
    questions: Q(921000, [
      ["再忙也会交代一声「晚点回你」，而不是突然消失。", "communication"],
      ["对方说话时，我很少打断或刷手机应付。", "communication"],
      ["难过或压力大时，愿意跟对方说，且不太怕被否定。", "attachment"],
      ["能听出对方的「潜台词」（比如累了、委屈了），而不只接字面。", "communication"],
      ["会用对方需要的方式安慰，而不总是讲道理或给方案。", "loveLanguage"],
      ["对重要决定会同步想法，而不是事后才通知。", "values"],
      ["出现误会时，愿意先澄清而不是冷战到底。", "conflict"],
      ["吵架时尽量避免人身攻击和翻旧账。", "conflict"],
      ["每周至少有一次「好好聊天」的时间，而不只是事务性对话。", "lifestyle"],
      ["觉得在这段关系里「被听见」比「被忽视」更多。", "attachment"],
    ]),
  },
  {
    slug: "conflict_repair",
    title: "争吵与修复",
    subtitle: "冷战、道歉与和好方式",
    minutes: 5,
    questions: Q(922000, [
      ["吵完架后，通常能在合理时间内主动缓和关系。", "conflict"],
      ["至少一方愿意先低头或示好，而不是长期僵持。", "conflict"],
      ["道歉是承认对方感受，而不只是「行行行都是我的错」。", "communication"],
      ["不会用拉黑、删好友、分房睡来惩罚对方。", "conflict"],
      ["能区分「对事」和「对人」，就事论事不贴标签。", "communication"],
      ["和好后会简单复盘：下次可以怎么避免同样爆发。", "communication"],
      ["情绪激动时能暂停一下，而不是越说越伤人。", "conflict"],
      ["相信冲突可以增进理解，而不是「吵架=不爱了」。", "attachment"],
      ["亲友面前会给对方面子，不当众拆台。", "values"],
      ["修复后不会反复拿这次矛盾当武器。", "conflict"],
    ]),
  },
  {
    slug: "trust_boundaries",
    title: "信任与个人边界",
    subtitle: "社交、隐私与报备的舒适度",
    minutes: 5,
    questions: Q(923000, [
      ["对异性同事/朋友的交往边界，双方有共识且不双标。", "values"],
      ["在手机与隐私上，彼此感到被尊重（无论是否互看）。", "attachment"],
      ["出差、聚会等会主动说一声，让对方心里有底。", "communication"],
      ["对方与前任/旧识的联系方式，我们都能接受。", "values"],
      ["不会因为一条消息未回就脑补最坏剧情并指责。", "attachment"],
      ["可以坦然说「我需要一点自己空间」而不被对方用内疚感绑架。", "communication"],
      ["财务与社交上的「小事」也愿意透明，减少猜疑。", "values"],
      ["对方的朋友圈里，我们的关系状态与事实一致。", "attachment"],
      ["遇到暧昧误会时，愿意一起面对而不是躲闪。", "conflict"],
      ["彼此相信对方不会故意隐瞒伤害关系的事。", "attachment"],
    ]),
  },
  {
    slug: "intimacy_rhythm",
    title: "亲密与身体节奏",
    subtitle: "频率期待、拒绝与相互尊重",
    minutes: 5,
    questions: Q(924000, [
      ["对亲密频率的期待能坦诚沟通，而不是全靠猜。", "communication"],
      ["一方没心情时，另一方能接受而不施压或冷暴力。", "loveLanguage"],
      ["亲密前后有情感连接，而不只是「完成任务」。", "loveLanguage"],
      ["身体边界（什么可以、什么暂缓）双方清楚且遵守。", "values"],
      ["不会因为拒绝一次就记仇或贬低对方。", "conflict"],
      ["会通过非性接触表达爱意（拥抱、牵手等），彼此受用。", "loveLanguage"],
      ["压力、疲惫对亲密的影响能一起调整，而不是互相埋怨。", "lifestyle"],
      ["对避孕与健康议题能认真讨论并共同负责。", "values"],
      ["不因比较（影视、他人）而让对方感到被评判。", "attachment"],
      ["整体上，亲密体验让我们更亲近而不是更有压力。", "attachment"],
    ]),
  },
  {
    slug: "money_values",
    title: "金钱观与消费",
    subtitle: "日常分摊、大额支出与储蓄观",
    minutes: 5,
    questions: Q(925000, [
      ["日常开销怎么分摊，我们有清晰且不委屈一方的做法。", "values"],
      ["大额支出（旅行、电子、礼物）会提前商量。", "communication"],
      ["不会因为花钱习惯不同就贬低对方「抠」或「败家」。", "conflict"],
      ["对储蓄与应急金的目标大致一致或愿意磨合。", "values"],
      ["借钱给亲友、投资等会影响双方的事会一起决定。", "values"],
      ["送礼物的预算与心意能互相体谅。", "loveLanguage"],
      ["经济紧张时能一起想办法，而不是互相指责。", "communication"],
      ["消费观差异不会成为「谁赚得多谁说了算」的唯一标准。", "values"],
      ["对未来买房、育儿等钱的问题有初步共识或愿意谈。", "lifestyle"],
      ["钱的事上感到被尊重、被当合伙人而不是对手。", "attachment"],
    ]),
  },
  {
    slug: "chores_division",
    title: "家务与分工",
    subtitle: "谁做多少、隐形劳动与公平感",
    minutes: 5,
    questions: Q(926000, [
      ["家务分工大致清楚，而不是总落在同一个人身上。", "lifestyle"],
      ["「看不见的活」（备品、预约、记日子）有被看见和分担。", "communication"],
      ["一方多忙时，另一方会主动多扛一点。", "loveLanguage"],
      ["不会因为家务吵架就否定整段感情，但能持续改进。", "conflict"],
      ["对干净、收纳的标准可以协商，而不是单方面强求。", "values"],
      ["父母/同住者的介入不会让我们单方面扛所有协调压力。", "communication"],
      ["周末与节假日的劳动与休息有商量。", "lifestyle"],
      ["家务做得好会得到感谢，而不被视为理所当然。", "loveLanguage"],
      ["长期同居或婚后仍愿意复盘分工是否公平。", "values"],
      ["整体上，在家务上感到「是一队的」而不是「各算各的」。", "attachment"],
    ]),
  },
];

const BY_SLUG = new Map(
  SCENARIO_DEFINITIONS.map((d) => [d.slug, d] as const),
);

export function getScenarioBySlug(
  slug: string | null | undefined,
): ScenarioDefinition | null {
  if (!slug) return null;
  return BY_SLUG.get(slug) ?? null;
}

/** 各维度在本专题中的题目数量（0 表示该维未出题，报告里应对应「本题未测」） */
export function getScenarioDimensionQuestionCounts(
  slug: string | null | undefined,
): Record<ScenarioDimension, number> | null {
  const def = getScenarioBySlug(slug);
  if (!def) return null;
  const counts: Record<ScenarioDimension, number> = {
    attachment: 0,
    loveLanguage: 0,
    communication: 0,
    values: 0,
    lifestyle: 0,
    conflict: 0,
  };
  for (const q of def.questions) {
    counts[q.dimension] += 1;
  }
  return counts;
}

export function isValidScenarioSlug(slug: string): boolean {
  return BY_SLUG.has(slug);
}

export function listScenarioSummariesForHome() {
  return SCENARIO_DEFINITIONS.map((d) => ({
    slug: d.slug,
    title: d.title,
    subtitle: d.subtitle,
    meta: `${d.questions.length}题 · 约${d.minutes}分钟`,
    href: `/quiz?mode=SCENARIO&scenario=${encodeURIComponent(d.slug)}`,
  }));
}
