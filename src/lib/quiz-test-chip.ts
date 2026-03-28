import type { LucideIcon } from "lucide-react";
import {
  Bandage,
  ClipboardList,
  HeartHandshake,
  House,
  Link2,
  MessageSquare,
  Layers,
  ShieldCheck,
  Sprout,
  Flame,
  Wallet,
  UserRound,
} from "lucide-react";
import { STAGE_LABELS } from "@/lib/stage-copy";
import { getScenarioBySlug, isValidScenarioSlug } from "@/lib/scenario-quizzes";
import { PERSONAL_TRACK_ICONS } from "@/lib/personal-readiness/personal-track-icons";
import {
  PERSONAL_TRACK_CARD_COPY,
  isValidPersonalSlug,
} from "@/lib/personal-readiness/tracks";

/** 专题测评 slug → 图标（与首页专题卡片一致） */
export const SCENARIO_QUIZ_ICONS: Record<string, LucideIcon> = {
  daily_communication: MessageSquare,
  conflict_repair: Bandage,
  trust_boundaries: ShieldCheck,
  intimacy_rhythm: HeartHandshake,
  money_values: Wallet,
  chores_division: House,
};

const STAGED_STAGE_ICONS: Record<string, LucideIcon> = {
  AMBIGUOUS: Sprout,
  ROMANCE: Flame,
  STABLE: House,
};

export type QuizTestChipInput = {
  mode?: string | null;
  stage?: string | null;
  scenarioSlug?: string | null;
  /** 第一幕子测评 slug */
  personalSlug?: string | null;
  /** 未识别具体测评时（如邀请码未输全） */
  fallbackLabel?: string | null;
};

/**
 * 昵称页 / 答题顶栏：解析测试名称与对应图标。
 */
export function getQuizTestChipMeta(input: QuizTestChipInput): {
  label: string;
  Icon: LucideIcon;
} {
  const mode = (input.mode ?? "").toUpperCase();
  const stage = (input.stage ?? "").toUpperCase();
  const slug =
    typeof input.scenarioSlug === "string" ? input.scenarioSlug.trim() : "";

  if (mode === "UNIVERSAL" || stage === "UNIVERSAL") {
    return { label: STAGE_LABELS.UNIVERSAL, Icon: Layers };
  }

  if (mode === "PERSONAL") {
    const ps =
      typeof input.personalSlug === "string"
        ? input.personalSlug.trim()
        : "";
    if (ps && isValidPersonalSlug(ps)) {
      return {
        label: PERSONAL_TRACK_CARD_COPY[ps].title,
        Icon: PERSONAL_TRACK_ICONS[ps],
      };
    }
    return { label: "先了解自己", Icon: UserRound };
  }

  if (mode === "SCENARIO") {
    if (slug && isValidScenarioSlug(slug)) {
      const def = getScenarioBySlug(slug);
      const Icon = SCENARIO_QUIZ_ICONS[slug] ?? ClipboardList;
      return { label: def?.title ?? "专题测评", Icon };
    }
    return { label: "专题测评", Icon: ClipboardList };
  }

  if (
    mode === "STAGED" &&
    stage &&
    STAGED_STAGE_ICONS[stage] &&
    STAGE_LABELS[stage]
  ) {
    return {
      label: STAGE_LABELS[stage],
      Icon: STAGED_STAGE_ICONS[stage],
    };
  }

  if (!mode && stage && STAGE_LABELS[stage] && STAGED_STAGE_ICONS[stage]) {
    return {
      label: STAGE_LABELS[stage],
      Icon: STAGED_STAGE_ICONS[stage],
    };
  }

  const fb = input.fallbackLabel?.trim();
  if (fb) {
    return { label: fb, Icon: Link2 };
  }

  return { label: "测评", Icon: ClipboardList };
}
