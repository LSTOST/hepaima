import type { LucideIcon } from "lucide-react";
import { Bandage, HeartHandshake, Sparkles } from "lucide-react";
import type { PersonalTrackSlug } from "./tracks";

/** 与首页「先了解自己」三张卡片一致 */
export const PERSONAL_TRACK_ICONS: Record<PersonalTrackSlug, LucideIcon> = {
  trust_connect: HeartHandshake,
  conflict_boundary: Bandage,
  commit_readiness: Sparkles,
};
