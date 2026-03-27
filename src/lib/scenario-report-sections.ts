import { getScenarioBySlug, type ScenarioDimension } from "@/lib/scenario-quizzes";

/** 本专题在该维度下的题干（用于报告「题脉」展示） */
export function getScenarioDimensionStems(
  slug: string | null | undefined,
  dimension: ScenarioDimension,
): readonly string[] {
  const def = getScenarioBySlug(slug);
  if (!def) return [];
  return def.questions.filter((q) => q.dimension === dimension).map((q) => q.text);
}
