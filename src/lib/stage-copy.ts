/**
 * 关系阶段在用户界面与报告中的中文文案（枚举值仍为 AMBIGUOUS / ROMANCE / STABLE / UNIVERSAL）
 */

export const STAGE_LABELS: Record<string, string> = {
  UNIVERSAL: "通用版",
  AMBIGUOUS: "了解期",
  ROMANCE: "热恋期",
  STABLE: "稳定期",
};

/**
 * 阶段副文案：仅用于首页 `components/home/StageSelector`（通用版说明 + 三阶段卡片），
 * 其它流程（答题入口、加入页、兑换码选阶段等）勿引用，以免重复冗长。
 */
export const STAGE_SUBTITLES: Record<string, string> = {
  UNIVERSAL: "面向情侣关系，尚未选定了解期、热恋期或稳定期时，建议先测本版",
  AMBIGUOUS: "双方仍在加深了解，关系尚未正式确立",
  ROMANCE: "已确立恋爱关系，情感与互动更为热烈",
  STABLE: "交往时间较长，或已进入同居、婚姻阶段",
};

export function getStageLabel(stage: string | null | undefined): string {
  if (stage == null || stage === "") return "测评";
  return STAGE_LABELS[stage] ?? stage;
}
