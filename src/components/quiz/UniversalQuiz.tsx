"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { universalQuestions } from "@/lib/questions-universal";

export type UniversalAnswerItem = { questionId: number; value: number };

const AUTO_NEXT_DELAY_MS = 500;
const UNIVERSAL_STORAGE_KEY = (sessionId: string) => `quiz_universal_${sessionId}`;

interface UniversalQuizProps {
  sessionId: string;
  onComplete: (answers: UniversalAnswerItem[]) => void;
  isSubmitting: boolean;
  submitError: string | null;
  onRetry: () => void;
}

export function UniversalQuiz({
  sessionId,
  onComplete,
  isSubmitting,
  submitError,
  onRetry,
}: UniversalQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<UniversalAnswerItem[]>([]);
  const [direction, setDirection] = useState(1);
  const hasSubmittedRef = useRef(false);
  const hasRestoredRef = useRef(false);

  const questions = universalQuestions;
  const total = questions.length;
  const currentQuestion = total > 0 ? questions[currentIndex] : null;
  const progress = total > 0 ? ((currentIndex + 1) / total) * 100 : 0;
  const progressPercent = Math.round(progress);
  const isLastQuestion = currentIndex === total - 1;
  const currentAnswer = currentQuestion
    ? answers.find((a) => a.questionId === currentQuestion.id)?.value
    : undefined;

  // 页面加载时从 sessionStorage 恢复进度
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem(UNIVERSAL_STORAGE_KEY(sessionId));
      if (!raw) return;
      const { answers: savedAnswers, currentIndex: savedIndex } = JSON.parse(raw);
      if (Array.isArray(savedAnswers) && typeof savedIndex === "number" && savedIndex >= 0 && savedIndex < total) {
        setAnswers(savedAnswers);
        setCurrentIndex(savedIndex);
      }
    } catch {
      /* ignore */
    } finally {
      hasRestoredRef.current = true;
    }
  }, [sessionId, total]);

  // 每次答题后保存进度
  useEffect(() => {
    if (typeof window === "undefined" || !hasRestoredRef.current) return;
    if (answers.length === 0 && currentIndex === 0) return;
    try {
      sessionStorage.setItem(
        UNIVERSAL_STORAGE_KEY(sessionId),
        JSON.stringify({ answers, currentIndex })
      );
    } catch {
      /* ignore */
    }
  }, [sessionId, answers, currentIndex]);

  const selectValue = useCallback(
    (questionId: number, value: number) => {
      if (!currentQuestion || currentQuestion.id !== questionId) return;
      if (hasSubmittedRef.current) return;

      const existingIdx = answers.findIndex((a) => a.questionId === questionId);
      const newAnswers =
        existingIdx >= 0
          ? answers.map((a, i) => (i === existingIdx ? { questionId, value } : a))
          : [...answers, { questionId, value }];
      setAnswers(newAnswers);

      if (isLastQuestion) {
        hasSubmittedRef.current = true;
        onComplete(newAnswers);
      } else {
        setDirection(1);
        setTimeout(() => setCurrentIndex((i) => i + 1), AUTO_NEXT_DELAY_MS);
      }
    },
    [currentQuestion, isLastQuestion, answers, onComplete]
  );

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (isLastQuestion && currentAnswer !== undefined) {
      if (hasSubmittedRef.current) return;
      hasSubmittedRef.current = true;
      const finalAnswers = answers.find((a) => a.questionId === currentQuestion?.id)
        ? answers
        : [...answers, { questionId: currentQuestion!.id, value: currentAnswer }];
      onComplete(finalAnswers);
    } else if (!isLastQuestion) {
      setDirection(1);
      setCurrentIndex((i) => i + 1);
    }
  }, [isLastQuestion, currentAnswer, currentQuestion, answers, onComplete]);

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
  };

  if (isSubmitting) {
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
                onClick={onRetry}
                className="rounded-full bg-gradient-to-r from-pink-500 to-violet-500 text-white"
              >
                重试
              </Button>
            </>
          ) : (
            <>
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-50 to-violet-50 shadow-lg shadow-pink-100/50 mb-5"
                animate={{ scale: [1, 1.02, 1], boxShadow: ["0 10px 40px -10px rgba(236,72,153,0.2)", "0 14px 50px -10px rgba(236,72,153,0.3)", "0 10px 40px -10px rgba(236,72,153,0.2)"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
              </motion.div>
              <p className="text-lg font-medium text-gray-800 mb-1">
                正在生成你们的专属报告...
              </p>
              <p className="text-sm text-gray-500 mb-5">答案已提交，马上就好</p>
              <motion.div className="flex justify-center gap-1.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-2 h-2 rounded-full bg-pink-300"
                    animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.1, 0.9] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </motion.div>
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
            <span className="font-[family-name:var(--font-brand)] text-[9px] text-gray-400 tracking-widest">
              hepaima.com
            </span>
          </div>
          <Badge className="bg-gradient-to-r from-pink-50 to-violet-50 text-pink-600 border-pink-200 hover:bg-pink-50 px-3 py-1 text-sm font-medium rounded-full gap-1.5">
            <Heart className="w-3.5 h-3.5 fill-pink-400 text-pink-400" />
            通用版
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

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-10 sm:py-16">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentQuestion.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex flex-col items-center"
            >
              <div className="text-center mb-10 sm:mb-12">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-pink-50 to-violet-50 text-sm font-bold text-[#EC4899] mb-4">
                  {currentIndex + 1}
                </span>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 leading-relaxed text-balance">
                  {currentQuestion.text}
                </h2>
              </div>

              <div className="w-full">
                <div className="flex items-center justify-between gap-2 sm:gap-3 mb-3">
                  {[1, 2, 3, 4, 5, 6, 7].map((value) => {
                    const isSelected = currentAnswer === value;
                    return (
                      <motion.button
                        key={value}
                        type="button"
                        onClick={() => selectValue(currentQuestion.id, value)}
                        whileTap={{ scale: 0.9 }}
                        animate={isSelected ? { scale: 1.15 } : { scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 15,
                        }}
                        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors duration-200 cursor-pointer select-none ${
                          isSelected
                            ? "bg-gradient-to-br from-[#EC4899] to-[#8B5CF6] text-white border-transparent shadow-lg shadow-pink-300/30"
                            : "bg-white text-gray-500 border-gray-200 hover:border-[#EC4899] hover:text-[#EC4899]"
                        }`}
                      >
                        {value}
                      </motion.button>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs text-gray-400">完全不符合</span>
                  <span className="text-xs text-gray-400">完全符合</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <div className="relative z-10 pb-8 px-4 sm:px-6">
        <div className="max-w-lg mx-auto flex items-center justify-center gap-4">
          {currentIndex > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Button
                variant="ghost"
                onClick={handlePrev}
                className="text-gray-400 hover:text-gray-600 hover:bg-white/60 rounded-xl cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                上一题
              </Button>
            </motion.div>
          )}
          {isLastQuestion && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Button
                onClick={handleNext}
                disabled={currentAnswer === undefined}
                className="bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] hover:from-pink-600 hover:to-violet-600 disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 text-white rounded-xl px-6 shadow-md cursor-pointer"
              >
                提交
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
