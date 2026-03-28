"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/Logo";
import { ChevronLeft, ChevronRight, Loader2, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PERSONAL_TRACK_ICONS } from "@/lib/personal-readiness/personal-track-icons";
import { isValidPersonalSlug } from "@/lib/personal-readiness/tracks";
import { Button } from "@/components/ui/button";
import { QuizTestTitleChip } from "@/components/quiz/QuizTestTitleChip";
import { getDeviceId } from "@/lib/device";

export type PersonalAnswerItem = { questionId: number; value: number };

type PersonalQuestion = { id: number; text: string; dimension?: string };

const AUTO_NEXT_DELAY_MS = 450;
const STORAGE_KEY = (sessionId: string) => `quiz_personal_${sessionId}`;

interface PersonalReadinessQuizProps {
  sessionId: string;
  onComplete: (answers: PersonalAnswerItem[]) => void;
  isSubmitting: boolean;
  submitError: string | null;
  onRetry: () => void;
}

export function PersonalReadinessQuiz({
  sessionId,
  onComplete,
  isSubmitting,
  submitError,
  onRetry,
}: PersonalReadinessQuizProps) {
  const [chipLabel, setChipLabel] = useState("个人自测");
  const [chipIcon, setChipIcon] = useState<LucideIcon>(UserRound);
  const [scaleLabels, setScaleLabels] = useState<string[]>([
    "完全不符合",
    "不太符合",
    "说不清",
    "比较符合",
    "完全符合",
  ]);
  const [questions, setQuestions] = useState<PersonalQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<PersonalAnswerItem[]>([]);
  const [direction, setDirection] = useState(1);
  const [transitioning, setTransitioning] = useState(false);
  const hasSubmittedRef = useRef(false);
  const hasRestoredRef = useRef(false);
  const isTransitioning = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoadingQuestions(true);
      setLoadError(null);
      const deviceId = getDeviceId();
      try {
        const res = await fetch(
          `/api/v1/quiz/personal-questions?sessionId=${encodeURIComponent(sessionId)}&deviceId=${encodeURIComponent(deviceId)}`,
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.message ?? "获取题目失败");
        }
        if (!cancelled) {
          const slug =
            typeof data.personalSlug === "string" ? data.personalSlug.trim() : "";
          if (slug && isValidPersonalSlug(slug)) {
            setChipIcon(PERSONAL_TRACK_ICONS[slug]);
          } else {
            setChipIcon(UserRound);
          }
          if (typeof data.trackTitle === "string" && data.trackTitle.trim()) {
            setChipLabel(data.trackTitle.trim());
          } else {
            setChipLabel("个人自测");
          }
          if (Array.isArray(data.scaleLabels) && data.scaleLabels.length >= 5) {
            setScaleLabels(data.scaleLabels.map(String));
          }
          setQuestions(Array.isArray(data.questions) ? data.questions : []);
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(
            e instanceof Error ? e.message : "获取题目失败，请稍后重试",
          );
        }
      } finally {
        if (!cancelled) setLoadingQuestions(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const total = questions.length;
  const currentQuestion = total > 0 ? questions[currentIndex] : null;
  const progress = total > 0 ? ((currentIndex + 1) / total) * 100 : 0;
  const progressPercent = Math.round(progress);
  const isLastQuestion = currentIndex === total - 1;
  const currentAnswer = currentQuestion
    ? answers.find((a) => a.questionId === currentQuestion.id)?.value
    : undefined;

  useEffect(() => {
    if (typeof window === "undefined" || total === 0) return;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY(sessionId));
      if (!raw) return;
      const { answers: savedAnswers, currentIndex: savedIndex } =
        JSON.parse(raw);
      if (
        Array.isArray(savedAnswers) &&
        typeof savedIndex === "number" &&
        savedIndex >= 0 &&
        savedIndex < total
      ) {
        setAnswers(savedAnswers);
        setCurrentIndex(savedIndex);
      }
    } catch {
      /* ignore */
    } finally {
      hasRestoredRef.current = true;
    }
  }, [sessionId, total]);

  useEffect(() => {
    if (typeof window === "undefined" || !hasRestoredRef.current) return;
    if (answers.length === 0 && currentIndex === 0) return;
    try {
      sessionStorage.setItem(
        STORAGE_KEY(sessionId),
        JSON.stringify({ answers, currentIndex }),
      );
    } catch {
      /* ignore */
    }
  }, [sessionId, answers, currentIndex]);

  const selectValue = useCallback(
    (questionId: number, value: number) => {
      if (!currentQuestion || currentQuestion.id !== questionId) return;
      if (isTransitioning.current) return;
      if (hasSubmittedRef.current) return;

      isTransitioning.current = true;

      const existingIdx = answers.findIndex((a) => a.questionId === questionId);
      const newAnswers =
        existingIdx >= 0
          ? answers.map((a, i) =>
              i === existingIdx ? { questionId, value } : a,
            )
          : [...answers, { questionId, value }];
      setAnswers(newAnswers);

      if (isLastQuestion) {
        hasSubmittedRef.current = true;
        onComplete(newAnswers);
        return;
      }

      setDirection(1);
      setTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((i) => i + 1);
        setTransitioning(false);
        isTransitioning.current = false;
      }, AUTO_NEXT_DELAY_MS);
    },
    [currentQuestion, isLastQuestion, answers, onComplete],
  );

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (isLastQuestion && currentAnswer !== undefined) {
      if (isTransitioning.current || hasSubmittedRef.current) return;
      isTransitioning.current = true;
      hasSubmittedRef.current = true;
      const finalAnswers = answers.find(
        (a) => a.questionId === currentQuestion?.id,
      )
        ? answers
        : [
            ...answers,
            { questionId: currentQuestion!.id, value: currentAnswer },
          ];
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

  const labelLow = scaleLabels[0] ?? "完全不符合";
  const labelHigh = scaleLabels[4] ?? "完全符合";

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
              <p className="text-lg font-medium text-red-600 mb-4">
                {submitError}
              </p>
              <Button
                onClick={onRetry}
                className="rounded-full bg-gradient-to-r from-pink-500 to-violet-500 text-white"
              >
                重试
              </Button>
            </>
          ) : (
            <>
              <Loader2 className="w-10 h-10 text-pink-500 animate-spin mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-800">正在提交...</p>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  if (loadingQuestions) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-pink-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (loadError || !currentQuestion) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-4">
        <p className="text-sm text-red-500 mb-4">
          {loadError ?? "题目加载失败，请稍后重试"}
        </p>
        <Button
          onClick={() => window.location.reload()}
          className="rounded-full bg-gradient-to-r from-pink-500 to-violet-500 text-white"
        >
          重新加载
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[420px] h-[420px] bg-pink-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-[360px] h-[360px] bg-violet-100/30 rounded-full blur-3xl" />
      </div>

      <header className="relative z-10 bg-white/70 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center shrink-0">
            <Logo size="md" />
          </Link>
          <QuizTestTitleChip
            label={chipLabel}
            icon={chipIcon}
            className="max-w-[min(240px,48vw)] shrink"
          />
          <span className="text-sm font-semibold text-gray-500 tabular-nums shrink-0 min-w-[3rem] text-right">
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
            transition={{ duration: 0.45, ease: "easeOut" }}
          />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-1.5 flex items-center justify-between">
          <Link href="/">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-gray-600 hover:text-gray-800 transition-colors -ml-1.5 text-sm font-medium"
            >
              <span aria-hidden>←</span>
              首页
            </button>
          </Link>
          <p className="text-xs text-gray-400 tabular-nums">{progressPercent}%</p>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-lg mx-auto flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentQuestion.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: "easeInOut" }}
              className="flex flex-col"
            >
              <div className="text-center mb-8 sm:mb-10">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-pink-50 to-violet-50 text-sm font-bold text-[#EC4899] mb-4">
                  {currentIndex + 1}
                </span>
                <h2 className="text-lg sm:text-xl font-semibold text-[#1F2937] leading-relaxed text-balance">
                  {currentQuestion.text}
                </h2>
              </div>

              <div
                className={`space-y-4 ${transitioning ? "pointer-events-none opacity-70" : ""}`}
              >
                <div className="grid grid-cols-5 gap-2 sm:gap-3">
                  {[1, 2, 3, 4, 5].map((value) => {
                    const isSelected = currentAnswer === value;
                    return (
                      <motion.button
                        key={value}
                        type="button"
                        aria-label={`${value} 分`}
                        onClick={() => selectValue(currentQuestion.id, value)}
                        whileTap={{ scale: 0.96 }}
                        className={`flex items-center justify-center rounded-2xl border-2 py-4 sm:py-5 transition-colors duration-200 cursor-pointer ${
                          isSelected
                            ? "border-pink-400 bg-pink-50 shadow-sm"
                            : "border-gray-100 bg-white hover:border-pink-200"
                        }`}
                      >
                        <span
                          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-base sm:text-lg font-bold ${
                            isSelected
                              ? "bg-gradient-to-br from-[#EC4899] to-[#8B5CF6] text-white"
                              : "bg-gray-50 text-gray-500"
                          }`}
                        >
                          {value}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between gap-2 px-0.5 text-xs sm:text-sm text-[#6B7280]">
                  <span className="text-left leading-snug max-w-[42%]">
                    {labelLow}
                  </span>
                  <span className="text-right leading-snug max-w-[42%]">
                    {labelHigh}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <div className="relative z-10 pb-8 px-4 sm:px-6">
        <div className="max-w-lg mx-auto flex items-center justify-center gap-4">
          {currentIndex > 0 && (
            <Button
              variant="ghost"
              onClick={handlePrev}
              className="text-gray-400 hover:text-gray-600 hover:bg-white/60 rounded-xl"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              上一题
            </Button>
          )}
          {isLastQuestion && (
            <Button
              onClick={handleNext}
              disabled={currentAnswer === undefined}
              className="bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] hover:from-pink-600 hover:to-violet-600 disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 text-white rounded-xl px-6 shadow-md"
            >
              提交
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
