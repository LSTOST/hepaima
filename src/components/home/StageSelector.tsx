"use client";

import React from "react";
import { motion } from "framer-motion";
import { Heart, Target, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function StageSelector() {
  return (
    <section id="stage-selection" className="py-16 sm:py-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-14"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
            选择测试方式
          </h2>
          <p className="text-gray-500">每段关系都有独特的旅程</p>
        </motion.div>

        {/* 通用版大卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          whileHover={{ y: -6, transition: { duration: 0.25, ease: "easeOut" } }}
          className="relative rounded-3xl p-6 sm:p-8 border-2 border-dashed border-gray-300 bg-white cursor-pointer overflow-hidden transition-all duration-300 hover:border-pink-400 hover:shadow-xl hover:shadow-pink-200/30 mb-10"
        >
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-pink-100/30 rounded-full blur-2xl pointer-events-none" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-6 h-6 text-pink-500 flex-shrink-0" />
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                通用版
              </h3>
              <span className="text-sm text-pink-500 font-medium">
                （推荐新用户）
              </span>
            </div>

            <p className="text-gray-800 mb-1 leading-relaxed">
              不确定关系阶段? 没关系!
            </p>
            <p className="text-gray-800 mb-6 leading-relaxed">
              38题全面测试，适合任何阶段的情侣
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-6 text-sm text-gray-800">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>约8分钟</span>
              </div>
              <span
                className="inline-block px-2.5 py-0.5 rounded text-[13px] font-medium"
                style={{ background: "#D1FAE5", color: "#059669" }}
              >
                🎁 限时免费体验
              </span>
            </div>

            <div className="flex justify-end">
              <Link href="/quiz?mode=UNIVERSAL">
                <Button className="rounded-full px-6 shadow-md bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white">
                  开始测试
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* 分隔线 */}
        <div className="flex items-center gap-4 mb-10">
          <div className="flex-1 border-t border-dashed border-gray-300" />
          <span className="text-sm text-gray-400 shrink-0">或按阶段选择</span>
          <div className="flex-1 border-t border-dashed border-gray-300" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StageCard
            title="暧昧期"
            subtitle="还在互相了解"
            badge="28题 · 约5分钟"
            color="pink"
            stageKey="AMBIGUOUS"
            delay={0}
          />
          <StageCard
            title="热恋期"
            subtitle="确定关系中"
            badge="36题 · 约8分钟"
            color="violet"
            stageKey="ROMANCE"
            isPopular
            delay={0.1}
          />
          <StageCard
            title="稳定期"
            subtitle="1年+/同居/已婚"
            badge="40题 · 约10分钟"
            color="purple"
            stageKey="STABLE"
            delay={0.2}
          />
        </div>
      </div>
    </section>
  );
}

function StageCard({
  title,
  subtitle,
  badge,
  color,
  stageKey,
  isPopular,
  delay,
}: {
  title: string;
  subtitle: string;
  badge: string;
  color: "pink" | "violet" | "purple";
  stageKey: string;
  isPopular?: boolean;
  delay: number;
}) {
  const colorStyles = {
    pink: {
      wrapper: "bg-pink-50 border-pink-200/60 shadow-pink-200/40",
      hoverShadow: "hover:shadow-pink-300/50",
      iconBg: "bg-pink-100",
      iconColor: "text-pink-500",
      button: "bg-pink-500 hover:bg-pink-600 text-white",
    },
    violet: {
      wrapper: "bg-gradient-to-br from-pink-50 via-white to-violet-50 border-pink-200/60 shadow-violet-200/40",
      hoverShadow: "hover:shadow-violet-300/50",
      iconBg: "bg-gradient-to-br from-pink-100 to-violet-100",
      iconColor: "text-violet-500",
      button: "bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white",
    },
    purple: {
      wrapper: "bg-violet-50 border-violet-200/60 shadow-violet-200/40",
      hoverShadow: "hover:shadow-violet-300/50",
      iconBg: "bg-violet-100",
      iconColor: "text-violet-500",
      button: "bg-violet-500 hover:bg-violet-600 text-white",
    },
  };

  const styles = colorStyles[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -10, scale: 1.02, transition: { duration: 0.25, ease: "easeOut" } }}
      className={`relative ${styles.wrapper} ${styles.hoverShadow} rounded-3xl p-6 sm:p-8 border shadow-xl cursor-pointer overflow-hidden transition-shadow duration-300 ${
        isPopular ? "ring-[3px] ring-pink-400 ring-offset-4 ring-offset-[#FAFAFA]" : ""
      }`}
    >
      {/* Inner glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/40 rounded-full blur-2xl pointer-events-none" />

      {isPopular && (
        <span className="absolute top-4 right-4 sm:top-5 sm:right-5 z-10 inline-flex items-center gap-1 bg-pink-500/10 text-pink-600 text-xs font-semibold px-2.5 py-1 rounded-lg border border-pink-200">
          <Heart className="w-3 h-3 fill-pink-500 text-pink-500" />
          最多人选
        </span>
      )}

      <div
        className={`w-14 h-14 ${styles.iconBg} rounded-2xl flex items-center justify-center mb-5`}
      >
        <Heart className={`w-7 h-7 ${styles.iconColor}`} />
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
        {title}
      </h3>
      <p className="text-gray-500 mb-4">{subtitle}</p>

      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Clock className="w-4 h-4" />
        <span>{badge}</span>
      </div>

      <div className="flex items-center justify-between">
        <span
          className="inline-block px-2.5 py-0.5 rounded text-[13px] font-medium"
          style={{ background: "#D1FAE5", color: "#059669" }}
        >
          🎁 免费体验
        </span>
        <Link href={`/quiz?mode=STAGED&stage=${stageKey}`}>
          <Button className={`rounded-full px-5 shadow-md ${styles.button}`}>
            开始测试
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
