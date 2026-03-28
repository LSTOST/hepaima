"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PERSONAL_TRACK_ICONS } from "@/lib/personal-readiness/personal-track-icons";
import {
  PERSONAL_TRACK_SLUGS,
  PERSONAL_TRACK_CARD_COPY,
  type PersonalTrackSlug,
} from "@/lib/personal-readiness/tracks";

/** 与 StageCard 一致的粉 / 粉紫 / 紫三色轮换 */
const CARD_STYLES = {
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

const COLOR_KEY: Record<PersonalTrackSlug, keyof typeof CARD_STYLES> = {
  trust_connect: "pink",
  conflict_boundary: "violet",
  commit_readiness: "purple",
};

function PersonalTrackCard({
  slug,
  index,
}: {
  slug: PersonalTrackSlug;
  index: number;
}) {
  const meta = PERSONAL_TRACK_CARD_COPY[slug];
  const Icon = PERSONAL_TRACK_ICONS[slug];
  const styles = CARD_STYLES[COLOR_KEY[slug]];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ y: -6, transition: { duration: 0.25, ease: "easeOut" } }}
      className="h-full"
    >
      <div
        className={`relative flex h-full flex-col rounded-3xl p-6 sm:p-8 border shadow-xl overflow-hidden transition-shadow duration-300 ${styles.wrapper} ${styles.hoverShadow}`}
      >
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/40 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex flex-col flex-1">
          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div
              className={`shrink-0 flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl ${styles.iconBg}`}
            >
              <Icon
                className={`h-5 w-5 sm:h-7 sm:w-7 ${styles.iconColor}`}
                aria-hidden
              />
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 leading-snug min-w-0 flex-1">
              {meta.title}
            </h3>
          </div>

          <p className="text-gray-500 mb-4 text-sm leading-relaxed flex-1">
            {meta.subtitle}
          </p>

          <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Clock className="w-4 h-4 shrink-0" />
            <span>{meta.badge}</span>
          </div>

          <div className="flex justify-end mt-auto">
            <Link
              href={`/quiz?mode=PERSONAL&personalSlug=${encodeURIComponent(slug)}`}
            >
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

export function PersonalFirstActCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16 sm:mb-24">
      {PERSONAL_TRACK_SLUGS.map((slug, index) => (
        <PersonalTrackCard key={slug} slug={slug} index={index} />
      ))}
    </div>
  );
}
