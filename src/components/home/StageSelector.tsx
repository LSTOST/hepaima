"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bandage,
  ChevronRight,
  Clock,
  Flame,
  Heart,
  HeartHandshake,
  House,
  MessageSquare,
  ShieldCheck,
  Sprout,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STAGE_SUBTITLES, STAGE_LABELS } from "@/lib/stage-copy";
import { STAGE_CARD_ENTRIES } from "@/lib/home-quiz-entries";
import { listScenarioSummariesForHome } from "@/lib/scenario-quizzes";

const SCENARIO_ENTRIES = listScenarioSummariesForHome();

/** 首页专题卡片图标：与 slug 一一对应，避免千篇一律 */
const SCENARIO_ICON_BY_SLUG: Record<string, LucideIcon> = {
  daily_communication: MessageSquare,
  conflict_repair: Bandage,
  trust_boundaries: ShieldCheck,
  intimacy_rhythm: HeartHandshake,
  money_values: Wallet,
  chores_division: House,
};

const STAGE_ICON: Record<
  (typeof STAGE_CARD_ENTRIES)[number]["stageKey"],
  LucideIcon
> = {
  AMBIGUOUS: Sprout,
  ROMANCE: Flame,
  STABLE: House,
};

/** 淡粉紫虚线（两侧引导线，粉与紫混合感） */
const RULE_LINE_CLASS =
  "flex-1 min-w-2 sm:min-w-4 h-0 border-t border-dashed border-[#E5B2D4]/75";

function SectionHeadingWithRules({
  title,
  subtitle,
  delay = 0,
}: {
  title: string;
  subtitle?: string;
  delay?: number;
}) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [showSideRules, setShowSideRules] = useState(true);

  useLayoutEffect(() => {
    const el = titleRef.current;
    if (!el) return;

    const measure = () => {
      const style = getComputedStyle(el);
      const lh = parseFloat(style.lineHeight);
      if (!Number.isFinite(lh) || lh <= 0) {
        setShowSideRules(true);
        return;
      }
      const lineCount = el.scrollHeight / lh;
      setShowSideRules(lineCount <= 1.08);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [title]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay }}
      className="mb-10 sm:mb-12"
    >
      <div
        className={
          showSideRules
            ? "flex w-full items-center gap-3 sm:gap-5"
            : "flex w-full justify-center"
        }
      >
        {showSideRules ? (
          <div className={RULE_LINE_CLASS} aria-hidden />
        ) : null}
        <h2
          ref={titleRef}
          className={
            showSideRules
              ? "shrink-0 px-2 text-center text-2xl font-bold text-[#1F2937] sm:text-3xl"
              : "w-full text-center text-2xl font-bold text-[#1F2937] sm:text-3xl"
          }
        >
          {title}
        </h2>
        {showSideRules ? (
          <div className={RULE_LINE_CLASS} aria-hidden />
        ) : null}
      </div>
      {subtitle ? (
        <p className="mx-auto mt-2 max-w-lg text-center text-sm text-[#6B7280] sm:text-base">
          {subtitle}
        </p>
      ) : null}
    </motion.div>
  );
}

export function StageSelector() {
  return (
    <section id="stage-selection" className="py-16 sm:py-20 px-4 sm:px-6">
      <div className="max-w-[1000px] mx-auto">
        <SectionHeadingWithRules
          title="按关系阶段选择"
          subtitle="每段关系都有独特的旅程"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {STAGE_CARD_ENTRIES.map((entry, index) => (
            <StageCard key={entry.stageKey} entry={entry} index={index} />
          ))}
        </div>

        <p className="text-center text-sm text-[#9CA3AF] mb-14">
          还不确定所处阶段？{" "}
          <Link
            href="/quiz?mode=UNIVERSAL"
            className="text-pink-600 hover:text-pink-700 font-medium underline underline-offset-2"
          >
            试试通用版测评
          </Link>
          <span className="text-[#9CA3AF]">（30 题 · 约 6 分钟）</span>
        </p>

        <SectionHeadingWithRules
          title="按现实场景选择"
          subtitle="从最常卡住的那类小事开始"
          delay={0.05}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SCENARIO_ENTRIES.map((s, index) => {
            const ScenarioIcon =
              SCENARIO_ICON_BY_SLUG[s.slug] ?? MessageSquare;
            return (
            <motion.div
              key={s.slug}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.04 }}
            >
              <Link
                href={s.href}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-pink-200 hover:bg-[#FDF2F8]/40 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-[#8B5CF6]">
                  <ScenarioIcon className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1 text-left">
                  <p className="font-semibold text-[#1F2937] text-sm sm:text-base leading-snug">
                    {s.title}
                  </p>
                  <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5 line-clamp-2">
                    {s.subtitle}
                  </p>
                  <p className="text-[11px] text-[#9CA3AF] mt-1.5">{s.meta}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-[#9CA3AF] shrink-0" aria-hidden />
              </Link>
            </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const STAGE_COLOR_STYLES = {
  pink: {
    wrapper: "bg-pink-50 border-pink-200/60 shadow-pink-200/40",
    hoverShadow: "hover:shadow-pink-300/50",
    iconBg: "bg-pink-100",
    iconColor: "text-pink-500",
    button: "bg-pink-500 hover:bg-pink-600 text-white",
  },
  violet: {
    wrapper:
      "bg-gradient-to-br from-pink-50 via-white to-violet-50 border-pink-200/60 shadow-violet-200/40",
    hoverShadow: "hover:shadow-violet-300/50",
    iconBg: "bg-gradient-to-br from-pink-100 to-violet-100",
    iconColor: "text-violet-500",
    button:
      "bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white",
  },
  purple: {
    wrapper: "bg-violet-50 border-violet-200/60 shadow-violet-200/40",
    hoverShadow: "hover:shadow-violet-300/50",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-500",
    button: "bg-violet-500 hover:bg-violet-600 text-white",
  },
} as const;

const STAGE_COLOR_KEY: Record<
  (typeof STAGE_CARD_ENTRIES)[number]["stageKey"],
  keyof typeof STAGE_COLOR_STYLES
> = {
  AMBIGUOUS: "pink",
  ROMANCE: "violet",
  STABLE: "purple",
};

function StageCard({
  entry,
  index,
}: {
  entry: (typeof STAGE_CARD_ENTRIES)[number];
  index: number;
}) {
  const { stageKey, badge, isPopular } = entry;
  const title = STAGE_LABELS[stageKey];
  const subtitle = STAGE_SUBTITLES[stageKey];
  const StageIcon = STAGE_ICON[stageKey] ?? Heart;
  const colorKey = STAGE_COLOR_KEY[stageKey];
  const styles = STAGE_COLOR_STYLES[colorKey];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ y: -6, transition: { duration: 0.25, ease: "easeOut" } }}
    >
      <div
        className={`relative flex h-full flex-col rounded-3xl p-6 sm:p-8 border shadow-xl overflow-hidden transition-shadow duration-300 ${styles.wrapper} ${styles.hoverShadow} ${
          isPopular
            ? "ring-[3px] ring-pink-400 ring-offset-4 ring-offset-[#FAFAFA]"
            : ""
        }`}
      >
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/40 rounded-full blur-2xl pointer-events-none" />

        {isPopular && (
          <span className="absolute top-4 right-4 sm:top-5 sm:right-5 z-10 inline-flex items-center gap-1 bg-pink-500/10 text-pink-600 text-xs font-semibold px-2.5 py-1 rounded-lg border border-pink-200">
            <Heart className="w-3 h-3 fill-pink-500 text-pink-500" aria-hidden />
            最多人选
          </span>
        )}

        <div className="relative">
          <div
            className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${styles.iconBg}`}
          >
            <StageIcon className={`h-7 w-7 ${styles.iconColor}`} aria-hidden />
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 pr-14 sm:pr-16">
            {title}
          </h3>
          <p className="text-gray-500 mb-4 text-sm leading-relaxed flex-1">
            {subtitle}
          </p>

          <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Clock className="w-4 h-4 shrink-0" />
            <span>{badge}</span>
          </div>

          <div className="flex justify-end">
            <Link href={`/quiz?mode=STAGED&stage=${stageKey}`}>
              <Button
                type="button"
                className={`rounded-full px-5 shadow-md ${styles.button}`}
              >
                开始测试
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
