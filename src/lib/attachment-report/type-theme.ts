/** 与 DESIGN.md 四种依恋类型色一致（H5 / PDF 共用） */
const TYPE_ACCENTS: Record<string, string> = {
  SECURE: "#4CAF87",
  ANXIOUS: "#E8A838",
  AVOIDANT: "#5B8FC9",
  FEARFUL: "#9B6B9E",
};

const DEFAULT_ACCENT = "#7C5CBF";

/** 注入根节点，便于使用 var(--color-type-*) */
export const ATTACHMENT_TYPE_CSS_VARS: Record<string, string> = {
  "--color-type-secure": TYPE_ACCENTS.SECURE,
  "--color-type-anxious": TYPE_ACCENTS.ANXIOUS,
  "--color-type-avoidant": TYPE_ACCENTS.AVOIDANT,
  "--color-type-fearful": TYPE_ACCENTS.FEARFUL,
};

export function attachmentTypeAccentColor(typeCode: string): string {
  const key = typeCode.trim().toUpperCase();
  return TYPE_ACCENTS[key] ?? DEFAULT_ACCENT;
}

/** CSS var() for 四类型图例等 */
export function attachmentTypeColorVar(typeCode: string): string {
  const key = typeCode.trim().toUpperCase();
  const map: Record<string, string> = {
    SECURE: "var(--color-type-secure)",
    ANXIOUS: "var(--color-type-anxious)",
    AVOIDANT: "var(--color-type-avoidant)",
    FEARFUL: "var(--color-type-fearful)",
  };
  return map[key] ?? "var(--at-primary)";
}
