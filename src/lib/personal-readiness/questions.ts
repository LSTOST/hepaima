/**
 * 第一幕 · 进入关系前个人自测（单人，统一 1–5 分）
 * 题干面向「亲密/认真关系中的自我模式」，避免「现任伴侣」式表述，照顾单身/暧昧用户。
 */

export type PersonalReadinessDimension =
  | "attachmentReadiness"
  | "communicationOpenness"
  | "conflictSkills"
  | "boundariesAutonomy"
  | "commitmentReadiness";

export interface PersonalReadinessQuestion {
  id: number;
  text: string;
  dimension: PersonalReadinessDimension;
}

/** 1=完全不符合 … 5=完全符合（越同意越利于自我觉察与关系准备） */
export const PERSONAL_SCALE_LABELS: readonly string[] = [
  "完全不符合",
  "不太符合",
  "说不清",
  "比较符合",
  "完全符合",
];

/** 无 personalSlug 的旧会话：仅统计这 15 题（与历史数据兼容） */
export const PERSONAL_LEGACY_QUESTION_IDS: readonly number[] = [
  810001, 810002, 810003, 810004, 810005, 810006, 810007, 810008, 810009, 810010,
  810011, 810012, 810013, 810014, 810015,
];

export const PERSONAL_QUIZ_TITLE_LEGACY = "进入关系前 · 先了解自己";
export const PERSONAL_QUIZ_SUBTITLE_LEGACY =
  "共 15 题，约 4～6 分钟。答案没有对错，请按真实感受选择。";

export const PERSONAL_SECTION_TITLE = "先了解自己";

const Q = (
  id: number,
  text: string,
  dimension: PersonalReadinessDimension,
): PersonalReadinessQuestion => ({ id, text, dimension });

/** 基础 15 题（legacy 与新版子测评共用其中部分 ID） */
const PERSONAL_QUESTIONS_BASE: readonly PersonalReadinessQuestion[] = [
  Q(
    810001,
    "在亲密或认真的关系中，我通常愿意让对方看到比较真实的我，而不是一直维持「完美人设」。",
    "attachmentReadiness",
  ),
  Q(
    810002,
    "在亲密或认真的关系中，我心里不安时，通常会用语言表达需求，而不是长时间冷战或单方面猜对方想法。",
    "attachmentReadiness",
  ),
  Q(
    810003,
    "在亲密或认真的关系中，我通常相信可以通过沟通逐步建立信任，而不是一开始就要求对方证明一切。",
    "attachmentReadiness",
  ),
  Q(
    810004,
    "在亲密或认真的关系中，我通常愿意倾听对方的感受，即使有时和我想的不一样。",
    "communicationOpenness",
  ),
  Q(
    810005,
    "在亲密或认真的关系中，遇到分歧时，我通常会就事论事，而不是人身攻击或翻旧账。",
    "communicationOpenness",
  ),
  Q(
    810006,
    "在亲密或认真的关系中，我通常能接受「把话说开」带来的短暂不舒服，而不是一味回避敏感话题。",
    "communicationOpenness",
  ),
  Q(
    810007,
    "在亲密或认真的关系中，吵架或情绪激动后，我通常愿意在冷静后主动修复关系，而不是无限期僵持。",
    "conflictSkills",
  ),
  Q(
    810008,
    "在亲密或认真的关系中，我通常能区分「对方让我不开心」和「对方整个人不行」这两种说法。",
    "conflictSkills",
  ),
  Q(
    810009,
    "在亲密或认真的关系中，我通常愿意为自己的情绪反应承担一部分责任，而不是全部推给对方。",
    "conflictSkills",
  ),
  Q(
    810010,
    "在亲密或认真的关系中，我需要独处或空间时，通常能比较清楚地说出来，而不是用生闷气让对方猜。",
    "boundariesAutonomy",
  ),
  Q(
    810011,
    "在亲密或认真的关系中，我通常尊重对方有自己的朋友、爱好与空间，不会把这等同于「不够爱」。",
    "boundariesAutonomy",
  ),
  Q(
    810012,
    "在亲密或认真的关系中，我通常不会用内疚感、威胁或删好友等方式逼对方就范。",
    "boundariesAutonomy",
  ),
  Q(
    810013,
    "在亲密或认真的关系中，我对进入一段认真关系通常有大致心理准备，而不是完全拒绝任何承诺话题。",
    "commitmentReadiness",
  ),
  Q(
    810014,
    "在亲密或认真的关系中，我通常能接受关系里需要磨合与调整，而不是期待一开始就完全合拍。",
    "commitmentReadiness",
  ),
  Q(
    810015,
    "若上一段关系已结束，在亲密或认真的关系中重新开始时，我通常已大致处理过情绪包袱，而不是带着强烈怨恨或报复心。",
    "commitmentReadiness",
  ),
];

/** 扩展题（每条子测评再各抽 8 题，共 24 题） */
const PERSONAL_QUESTIONS_EXTENDED: readonly PersonalReadinessQuestion[] = [
  Q(
    811001,
    "在亲密或认真的关系中，我通常能承认自己的脆弱面，而不必时刻显得「很强」。",
    "attachmentReadiness",
  ),
  Q(
    811002,
    "在亲密或认真的关系中，对方暂时回复慢或忙时，我通常能先稳住自己，而不是立刻想到「被抛弃」。",
    "attachmentReadiness",
  ),
  Q(
    811003,
    "在亲密或认真的关系中，我通常会用「我感受到…」这样的方式开口，而不是一上来就指责对方。",
    "communicationOpenness",
  ),
  Q(
    811004,
    "在亲密或认真的关系中，我通常愿意询问对方的想法，而不是预设「你肯定懂我」。",
    "communicationOpenness",
  ),
  Q(
    811005,
    "在亲密或认真的关系中，我通常能区分「需要陪伴」和「需要控制对方的行程」。",
    "attachmentReadiness",
  ),
  Q(
    811006,
    "在亲密或认真的关系中，我通常会在合适时机表达欣赏与感谢，而不是觉得「不用说」。",
    "communicationOpenness",
  ),
  Q(
    811007,
    "在亲密或认真的关系中，我通常能觉察到自己是否在「试探」对方，而不是装作若无其事。",
    "communicationOpenness",
  ),
  Q(
    811008,
    "在亲密或认真的关系中，我通常愿意为了理解对方而多问一句，而不是急于下结论。",
    "attachmentReadiness",
  ),

  Q(
    811009,
    "在亲密或认真的关系中，争执升级前，我通常能喊停或约定稍后再谈，而不是追着吵到筋疲力竭。",
    "conflictSkills",
  ),
  Q(
    811010,
    "在亲密或认真的关系中，我通常能道歉或承认自己的不当之处，而不是永远等对方先低头。",
    "conflictSkills",
  ),
  Q(
    811011,
    "在亲密或认真的关系中，我通常不会用拉黑、消失几天等方式惩罚对方。",
    "conflictSkills",
  ),
  Q(
    811012,
    "在亲密或认真的关系中，我通常能讨论「我们以后怎么避免类似冲突」，而不只是争输赢。",
    "conflictSkills",
  ),
  Q(
    811013,
    "在亲密或认真的关系中，我通常能守住自己的底线，而不是为了留住关系一味退让。",
    "boundariesAutonomy",
  ),
  Q(
    811014,
    "在亲密或认真的关系中，我通常能尊重对方说「不」，而不是反复施压直到对方妥协。",
    "boundariesAutonomy",
  ),
  Q(
    811015,
    "在亲密或认真的关系中，我通常能照顾自己的休息与社交需求，而不是完全以关系为中心耗尽自己。",
    "boundariesAutonomy",
  ),
  Q(
    811016,
    "在亲密或认真的关系中，我通常能区分「关心」和「监控」，不过度追问细节来证明安心。",
    "boundariesAutonomy",
  ),

  Q(
    811017,
    "在亲密或认真的关系中，我通常能想象与某人长期相处，而不是一想到未来就只想逃避。",
    "commitmentReadiness",
  ),
  Q(
    811018,
    "在亲密或认真的关系中，我通常愿意为关系投入时间与心力，而不是长期处于「随时可撤」的状态。",
    "commitmentReadiness",
  ),
  Q(
    811019,
    "在亲密或认真的关系中，我通常能讨论彼此对忠诚与边界的期待，而不是假装这些不存在。",
    "commitmentReadiness",
  ),
  Q(
    811020,
    "在亲密或认真的关系中，我通常能觉察自己是否把上一段的恐惧带到了新的互动里。",
    "commitmentReadiness",
  ),
  Q(
    811021,
    "在亲密或认真的关系中，我通常能向信任的人倾诉或寻求支持，而不是把所有压力都闷在心里。",
    "communicationOpenness",
  ),
  Q(
    811022,
    "在亲密或认真的关系中，我通常能觉察自己的「应该思维」（对方应该怎样），并稍微松一松。",
    "conflictSkills",
  ),
  Q(
    811023,
    "在亲密或认真的关系中，我通常能为自己保留一点个人目标或成长空间，而不是完全放弃自我。",
    "boundariesAutonomy",
  ),
  Q(
    811024,
    "在亲密或认真的关系中，我通常愿意慢慢建立信任，而不是要求对方立刻满足我全部安全感需求。",
    "attachmentReadiness",
  ),
];

/** 全量题库（15 基础 + 24 扩展 = 39 题） */
export const PERSONAL_READINESS_QUESTIONS: readonly PersonalReadinessQuestion[] =
  [...PERSONAL_QUESTIONS_BASE, ...PERSONAL_QUESTIONS_EXTENDED];

export const PERSONAL_DIMENSION_LABELS: Record<
  PersonalReadinessDimension,
  string
> = {
  attachmentReadiness: "亲密与信任倾向",
  communicationOpenness: "沟通与表达",
  conflictSkills: "冲突与修复",
  boundariesAutonomy: "边界与自主",
  commitmentReadiness: "进入关系的准备度",
};
