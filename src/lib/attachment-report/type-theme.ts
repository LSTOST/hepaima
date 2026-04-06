/** 与 docs/ui_design_spec.md 四种依恋类型色一致 */
const TYPE_ACCENTS: Record<string, string> = {
  SECURE: "#4CAF87",
  ANXIOUS: "#E8A838",
  AVOIDANT: "#5B8FC9",
  FEARFUL: "#9B6B9E",
};

const DEFAULT_ACCENT = "#7C5CBF";

export function attachmentTypeAccentColor(typeCode: string): string {
  const key = typeCode.trim().toUpperCase();
  return TYPE_ACCENTS[key] ?? DEFAULT_ACCENT;
}
