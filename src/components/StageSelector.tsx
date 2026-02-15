"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const STAGES = [
  {
    key: "UNIVERSAL",
    label: "通用版",
    icon: "🎯",
    desc: "不确定阶段？全面测评",
    questions: 38,
    time: "约8分钟",
    color: "#8B5CF6",
    popular: false,
  },
  {
    key: "AMBIGUOUS",
    label: "暧昧期",
    icon: "💗",
    desc: "还在互相了解",
    questions: 25,
    time: "约5分钟",
    color: "#EC4899",
    popular: false,
  },
  {
    key: "ROMANCE",
    label: "热恋期",
    icon: "💕",
    desc: "确定关系中",
    questions: 32,
    time: "约7分钟",
    color: "#F43F5E",
    popular: true,
  },
  {
    key: "STABLE",
    label: "稳定期",
    icon: "💑",
    desc: "1年+/同居/已婚",
    questions: 40,
    time: "约10分钟",
    color: "#10B981",
    popular: false,
  },
] as const;

export interface StageSelectorProps {
  code: string;
  usedStages: string[];
  onSelect: (stage: string) => void;
  onBack: () => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export function StageSelector({
  code,
  usedStages,
  onSelect,
  onBack,
}: StageSelectorProps) {
  const allUsed = usedStages.length >= 4;

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-pink-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-violet-100/40 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center px-4 sm:px-6 py-6 pb-24 max-w-[480px] mx-auto w-full">
        {/* 顶部：兑换码 + 进度 */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full text-center mb-6"
        >
          <p className="text-xs text-[#6B7280] mb-1">当前兑换码</p>
          <p className="font-mono text-sm font-semibold text-[#1F2937] tracking-wider mb-2">
            {code}
          </p>
          <p className="text-xs text-[#6B7280]">
            已完成 {usedStages.length}/4 个阶段
          </p>
        </motion.div>

        {/* 阶段卡片列表 */}
        <motion.div
          className="w-full space-y-3 flex-1"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {allUsed ? (
            <motion.div
              variants={item}
              className="rounded-xl bg-white p-6 text-center shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-gray-100"
            >
              <p className="text-lg font-medium text-[#1F2937] mb-1">
                该兑换码已完成全部测评
              </p>
              <p className="text-2xl" aria-hidden>🎉</p>
            </motion.div>
          ) : (
            STAGES.map((stage) => {
              const used = usedStages.includes(stage.key);
              return (
                <motion.button
                  key={stage.key}
                  type="button"
                  variants={item}
                  disabled={used}
                  onClick={() => !used && onSelect(stage.key)}
                  className={`relative w-full text-left rounded-xl p-4 transition-all duration-200 ${
                    used
                      ? "bg-gray-50 opacity-60 cursor-not-allowed"
                      : "bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 border border-gray-100"
                  }`}
                  whileHover={used ? undefined : { y: -2 }}
                  whileTap={used ? undefined : { scale: 0.99 }}
                >
                  {/* 左侧彩色竖条（仅可用时） */}
                  {!used && (
                    <span
                      className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                      style={{ backgroundColor: stage.color }}
                    />
                  )}

                  {/* 已完成标签 */}
                  {used && (
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                      <Check className="w-3 h-3" />
                      已完成
                    </span>
                  )}

                  {/* 最多人选 */}
                  {stage.popular && !used && (
                    <span className="absolute top-3 right-3 text-xs font-medium text-[#EC4899] bg-pink-50 px-2 py-1 rounded-md">
                      最多人选
                    </span>
                  )}

                  <div className={used ? "" : "pl-3"}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-2xl flex-shrink-0" aria-hidden>
                          {stage.icon}
                        </span>
                        <div className="min-w-0">
                          <p
                            className={`font-semibold ${
                              used ? "text-gray-500" : "text-[#1F2937]"
                            }`}
                          >
                            {stage.label}
                          </p>
                          <p className="text-sm text-[#6B7280] mt-0.5">
                            {stage.desc}
                          </p>
                        </div>
                      </div>
                      {!used && (
                        <div className="flex-shrink-0 text-right text-xs text-[#6B7280]">
                          <p>{stage.questions} 题</p>
                          <p>{stage.time}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })
          )}
        </motion.div>

        {/* 底部返回 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full pt-6"
        >
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="w-full rounded-xl text-[#6B7280] hover:text-[#1F2937] hover:bg-white/80"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            上一步
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
