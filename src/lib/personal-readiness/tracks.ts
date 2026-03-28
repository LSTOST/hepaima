/**
 * 第一幕：三条独立个人自测（共用 1–5 分题库；每条 13 题，约 12～15 题量级）
 * 第一幕报告与答题均免费，不涉及付费解锁。
 */

export const PERSONAL_TRACK_SLUGS = [
  "trust_connect",
  "conflict_boundary",
  "commit_readiness",
] as const;

export type PersonalTrackSlug = (typeof PERSONAL_TRACK_SLUGS)[number];

export function isValidPersonalSlug(s: string): s is PersonalTrackSlug {
  return (PERSONAL_TRACK_SLUGS as readonly string[]).includes(s);
}

/** 各子测评题组（题目 ID 见 questions.ts） */
export const PERSONAL_TRACK_QUESTION_IDS: Record<
  PersonalTrackSlug,
  readonly number[]
> = {
  /** 亲密与信任 + 沟通表达 */
  trust_connect: [
    810001, 810002, 810003, 810004, 810005, 811001, 811002, 811003, 811004,
    811005, 811006, 811007, 811008,
  ],
  /** 冲突修复 + 边界与自主 */
  conflict_boundary: [
    810007, 810008, 810009, 810010, 810011, 811009, 811010, 811011, 811012,
    811013, 811014, 811015, 811016,
  ],
  /** 承诺与心理准备 + 相关沟通/边界 */
  commit_readiness: [
    810006, 810012, 810013, 810014, 810015, 811017, 811018, 811019, 811020,
    811021, 811022, 811023, 811024,
  ],
};

/** 首页卡片与顶栏展示 */
export const PERSONAL_TRACK_CARD_COPY: Record<
  PersonalTrackSlug,
  { title: string; subtitle: string; badge: string }
> = {
  trust_connect: {
    title: "亲密与连接",
    subtitle: "信任、坦诚与日常沟通里，你更习惯怎样靠近与被靠近。",
    badge: "13 题 · 约 5～7 分钟",
  },
  conflict_boundary: {
    title: "冲突与边界",
    subtitle: "争吵后能否修复、能否守住尊重与自己的空间。",
    badge: "13 题 · 约 5～7 分钟",
  },
  commit_readiness: {
    title: "承诺与心理准备",
    subtitle: "对认真关系的期待、磨合观与是否还带着未消化的情绪包袱。",
    badge: "13 题 · 约 5～7 分钟",
  },
};

export function getPersonalTrackQuestionIds(
  slug: string | null | undefined,
): readonly number[] | null {
  if (slug == null || slug === "") return null;
  if (!isValidPersonalSlug(slug)) return null;
  return PERSONAL_TRACK_QUESTION_IDS[slug];
}

export function personalTrackShortLabel(
  slug: string | null | undefined,
): string {
  if (slug && isValidPersonalSlug(slug)) {
    return PERSONAL_TRACK_CARD_COPY[slug].title;
  }
  return "个人自测";
}
