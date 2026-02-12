"use client";

import React, { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ChevronLeft, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getQuestionsByStage } from "@/lib/questions";
import type { Stage } from "@/lib/questions";
import { useQuiz } from "@/hooks/useQuiz";
import { getDeviceId } from "@/lib/device";

const STAGE_CONFIG: Record<string, { label: string; totalQuestions: number }> = {
  AMBIGUOUS: { label: "暧昧期", totalQuestions: 28 },
  ROMANCE: { label: "热恋期", totalQuestions: 36 },
  STABLE: { label: "稳定期", totalQuestions: 40 },
};

interface StagedQuizUIProps {
  sessionId: string;
  stageKey: Stage;
}

export function StagedQuizUI({ sessionId, stageKey }: StagedQuizUIProps) {
  const lastAnswersRef = useRef<{ questionId: number; answer: string }[] | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const questions = React.useMemo(() => getQuestionsByStage(stageKey), [stageKey]);

  const submitAnswers = useCallback(
    async (ans: { questionId: number; answer: string }[]) => {
      const deviceId = getDeviceId();
      const res = await fetch("/api/v1/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, deviceId, answers: ans }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "提交失败");
      return data;
    },
    [sessionId]
  );

  const {
    currentIndex,
    getAnswerFor,
    selectAnswer,
    goBack,
    progress,
    isComplete,
    currentQuestion,
    total,
  } = useQuiz({
    questions,
    sessionId,
    onComplete: (ans) => {
      lastAnswersRef.current = ans;
      setSubmitError(null);
      submitAnswers(ans)
        .then(() => {
          if (typeof window !== "undefined") {
            sessionStorage.removeItem(`quiz_${sessionId}`);
            window.location.assign(`${window.location.origin}/result/${sessionId}`);
          }
        })
        .catch((err) =>
          setSubmitError(err instanceof Error ? err.message : "提交失败，请重试")
        );
    },
  });

  const stage = STAGE_CONFIG[stageKey] ?? STAGE_CONFIG.ROMANCE;
  const [direction, setDirection] = useState(1);
  const progressPercent = Math.round(progress);

  const handleSelect = (key: string) => {
    if (!currentQuestion) return;
    if (currentIndex < total - 1) setDirection(1);
    selectAnswer(currentQuestion.id, key);
  };

  const handleRetry = () => {
    const ans = lastAnswersRef.current;
    if (!ans) return;
    setSubmitError(null);
    submitAnswers(ans)
      .then(() => {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem(`quiz_${sessionId}`);
          window.location.assign(`${window.location.origin}/result/${sessionId}`);
        }
      })
      .catch((err) =>
        setSubmitError(err instanceof Error ? err.message : "提交失败，请重试")
      );
  };

  const handlePrev = () => {
    setDirection(-1);
    goBack();
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 260 : -260, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -260 : 260, opacity: 0 }),
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-4">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-[420px] h-[420px] bg-pink-100/30 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-[360px] h-[360px] bg-violet-100/30 rounded-full blur-3xl" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center"
        >
          {submitError ? (
            <>
              <p className="text-lg font-medium text-red-600 mb-4">{submitError}</p>
              <Button
                onClick={handleRetry}
                className="rounded-full bg-gradient-to-r from-pink-500 to-violet-500 text-white"
              >
                重试
              </Button>
            </>
          ) : (
            <>
              <Loader2 className="w-12 h-12 text-pink-500 animate-spin mx-auto mb-6" />
              <p className="text-lg font-medium text-gray-800">
                正在生成你们的专属报告...
              </p>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[420px] h-[420px] bg-pink-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-[360px] h-[360px] bg-violet-100/30 rounded-full blur-3xl" />
      </div>

      <header className="relative z-10 bg-white/70 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex flex-col items-start">
            <span className="font-[family-name:var(--font-brand)] text-lg font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent leading-tight tracking-widest">
              合拍吗
            </span>
            <span className="font-[family-name:var(--font-brand)] text-[9px] text-gray-400 tracking-widest w-full text-center">
              hepaima.com
            </span>
          </div>
          <Badge className="bg-pink-50 text-pink-600 border-pink-200 hover:bg-pink-50 px-3 py-1 text-sm font-medium rounded-full gap-1.5">
            <Heart className="w-3.5 h-3.5 fill-pink-400 text-pink-400" />
            {stage.label}
          </Badge>
          <span className="text-sm font-semibold text-gray-500 tabular-nums min-w-[3rem] text-right">
            <span className="text-gray-800">{currentIndex + 1}</span>
            <span className="text-gray-300 mx-0.5">/</span>
            {total}
          </span>
        </div>
        <div className="h-1 bg-gray-100 relative">
          <motion.div
            className="h-full bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] rounded-r-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-1.5 flex items-center justify-between">
          <Link href="/">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-[#888888] hover:text-gray-600 transition-colors -ml-1.5 text-sm font-normal"
            >
              <span aria-hidden>←</span>
              首页
            </button>
          </Link>
          <p className="text-xs text-gray-400 tabular-nums">
            {progressPercent}%
          </p>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentQuestion.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              <div className="mb-8">
                <span className="inline-block text-sm font-semibold text-pink-500 mb-2">
                  Q{currentIndex + 1}
                </span>
                <h2 className="text-lg font-medium text-gray-800 leading-relaxed">
                  {currentQuestion.text}
                </h2>
              </div>
              <div className="flex flex-col gap-3">
                {currentQuestion.options.map((option) => {
                  const isSelected = getAnswerFor(currentQuestion.id) === option.key;
                  return (
                    <motion.button
                      key={option.key}
                      type="button"
                      onClick={() => handleSelect(option.key)}
                      whileTap={{ scale: 0.97 }}
                      className={`flex items-center gap-3.5 w-full text-left px-4 py-3.5 rounded-2xl border-2 transition-colors duration-200 cursor-pointer ${
                        isSelected
                          ? "border-pink-400 bg-pink-50"
                          : "border-gray-100 bg-white hover:border-gray-200"
                      }`}
                    >
                      <span
                        className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors duration-200 ${
                          isSelected
                            ? "bg-gradient-to-br from-pink-500 to-violet-500 text-white"
                            : "bg-pink-50 text-pink-400"
                        }`}
                      >
                        {option.key}
                      </span>
                      <span
                        className={`text-[15px] leading-snug transition-colors duration-200 ${
                          isSelected ? "text-gray-800 font-medium" : "text-gray-600"
                        }`}
                      >
                        {option.text}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <div className="relative z-10 pb-8 px-4 sm:px-6">
        <div className="max-w-lg mx-auto flex justify-center">
          {currentIndex > 0 && (
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handlePrev}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors py-2 px-3 rounded-xl hover:bg-white/60 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              上一题
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
