/**
 * 首页「按关系阶段」卡片配置（与分阶段问卷一致）。
 */

export type StagedStageKey = "AMBIGUOUS" | "ROMANCE" | "STABLE";

export interface StageCardEntry {
  stageKey: StagedStageKey;
  badge: string;
  isPopular?: boolean;
}

export const STAGE_CARD_ENTRIES: StageCardEntry[] = [
  { stageKey: "AMBIGUOUS", badge: "28题 · 约5分钟" },
  { stageKey: "ROMANCE", badge: "35题 · 约8分钟", isPopular: true },
  { stageKey: "STABLE", badge: "40题 · 约10分钟" },
];
