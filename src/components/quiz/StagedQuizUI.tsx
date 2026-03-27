"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/Logo";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuizTestTitleChip } from "@/components/quiz/QuizTestTitleChip";
import { getQuizTestChipMeta } from "@/lib/quiz-test-chip";
import type { Question, Stage } from "@/lib/questions";
import { useQuiz } from "@/hooks/useQuiz";
import { getDeviceId } from "@/lib/device";

interface StagedQuizUIProps {
  sessionId: string;
  stageKey: Stage;
}

export function StagedQuizUI({ sessionId, stageKey }: StagedQuizUIProps) {
  const lastAnswersRef = useRef<{ questionId: number; answer: string }[] | null>(null);
  const isSubmitting = useRef(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hintOpen, setHintOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchQuestions = async () => {
      setLoadingQuestions(true);
      setLoadError(null);
      try {
        const res = await fetch(
          `/api/v1/quiz/staged-questions?stage=${encodeURIComponent(stageKey)}`,
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.message ?? "获取题目失败");
        }
        if (!cancelled) {
          const list: any[] = Array.isArray(data.questions) ? data.questions : [];
          setQuestions(list as Question[]);
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(
            e instanceof Error ? e.message : "获取题目失败，请稍后重试",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingQuestions(false);
        }
      }
    };

    fetchQuestions();

    return () => {
      cancelled = true;
    };
  }, [stageKey]);

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
    transitioning,
  } = useQuiz({
    questions,
    sessionId,
    onComplete: (ans) => {
      if (isSubmitting.current) return;
      isSubmitting.current = true;
      lastAnswersRef.current = ans;
      setSubmitError(null);
      submitAnswers(ans)
        .then((data) => {
          if (typeof window !== "undefined") {
            sessionStorage.removeItem(`quiz_${sessionId}`);
            const ready = data?.bothCompleted ? "?ready=1" : "";
            const targetPath = `/result/${sessionId}${ready}`;
            window.location.assign(`${window.location.origin}${targetPath}`);
          }
        })
        .catch((err) => {
          setSubmitError(err instanceof Error ? err.message : "提交失败，请重试");
          isSubmitting.current = false;
        });
    },
  });

  useEffect(() => {
    setHintOpen(false);
  }, [currentQuestion?.id]);

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
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setSubmitError(null);
    submitAnswers(ans)
      .then((data) => {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem(`quiz_${sessionId}`);
          const ready = data?.bothCompleted ? "?ready=1" : "";
          window.location.assign(`${window.location.origin}/result/${sessionId}${ready}`);
        }
      })
      .catch((err) => {
        setSubmitError(err instanceof Error ? err.message : "提交失败，请重试");
        isSubmitting.current = false;
      });
  };

  const handlePrev = () => {
    setDirection(-1);
    goBack();
  };

  const stagedChip = getQuizTestChipMeta({ mode: "STAGED", stage: stageKey });

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
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-50 to-violet-50 shadow-lg shadow-pink-100/50 mb-5"
                animate={{ scale: [1, 1.02, 1], boxShadow: ["0 10px 40px -10px rgba(236,72,153,0.2)", "0 14px 50px -10px rgba(236,72,153,0.3)", "0 10px 40px -10px rgba(236,72,153,0.2)"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
              </motion.div>
              <p className="text-lg font-medium text-gray-800 mb-1">
                正在提交...
              </p>
              <p className="text-sm text-gray-500 mb-5">提交成功后即将跳转</p>
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
          onClick={() => {
            if (typeof window !== "undefined") {
              window.location.reload();
            }
          }}
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo size="md" />
          </Link>
          <QuizTestTitleChip
            label={stagedChip.label}
            icon={stagedChip.Icon}
            className="min-w-0 shrink"
          />
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
          <p className="text-xs text-gray-400 tabular-nums">
            {progressPercent}%
          </p>
        </div>
        {(stageKey === "AMBIGUOUS" ||
          stageKey === "ROMANCE" ||
          stageKey === "STABLE") && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-2.5 flex flex-col items-center gap-1.5">
            <button
              type="button"
              id="quiz-hint-trigger"
              onClick={() => setHintOpen((v) => !v)}
              aria-expanded={hintOpen}
              aria-controls="quiz-answer-hint"
              className="text-[11px] sm:text-xs text-gray-400 hover:text-gray-600 text-center"
            >
              没有想选的选项？
            </button>
            <AnimatePresence initial={false}>
              {hintOpen && (
                <motion.p
                  id="quiz-answer-hint"
                  role="region"
                  aria-labelledby="quiz-hint-trigger"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="text-[11px] sm:text-xs text-gray-400 text-center leading-snug"
                >
                  请选<strong className="text-gray-500 font-medium">最接近你们日常</strong>
                  的一项；四选一无法涵盖所有情况时，按
                  <strong className="text-gray-500 font-medium">最常发生</strong>
                  的一种来选即可。
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        )}
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
              <div
                className={`flex flex-col gap-3 ${transitioning ? "pointer-events-none" : ""}`}
              >
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
