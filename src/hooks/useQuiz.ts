"use client";

import { useState, useCallback } from "react";
import type { Question } from "@/lib/questions";

export type AnswerItem = { questionId: number; answer: string };

interface UseQuizOptions {
  questions: Question[];
  onComplete?: (answers: AnswerItem[]) => void;
}

const AUTO_NEXT_DELAY_MS = 300;

export function useQuiz({ questions, onComplete }: UseQuizOptions) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = questions.length;
  const currentQuestion = total > 0 ? questions[currentIndex] : null;
  // 与题号显示一致：当前第几题 / 总题数（如 24/38 ≈ 63%）
  const progress = total > 0 ? ((currentIndex + 1) / total) * 100 : 0;
  const isComplete = isSubmitting;

  const getAnswerFor = useCallback(
    (questionId: number): string | undefined =>
      answers.find((a) => a.questionId === questionId)?.answer,
    [answers]
  );

  const selectAnswer = useCallback(
    (questionId: number, answer: string) => {
      if (!currentQuestion || currentQuestion.id !== questionId) return;

      const existingIdx = answers.findIndex((a) => a.questionId === questionId);
      const newAnswers =
        existingIdx >= 0
          ? answers.map((a, i) =>
              i === existingIdx ? { questionId, answer } : a
            )
          : [...answers, { questionId, answer }];
      setAnswers(newAnswers);

      const isLastQuestion = currentIndex >= total - 1;

      if (isLastQuestion) {
        setIsSubmitting(true);
        onComplete?.(newAnswers);
      } else {
        setTimeout(() => {
          setCurrentIndex((i) => i + 1);
        }, AUTO_NEXT_DELAY_MS);
      }
    },
    [currentQuestion, currentIndex, total, answers, onComplete]
  );

  const goBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  return {
    currentIndex,
    answers,
    getAnswerFor,
    selectAnswer,
    goBack,
    progress,
    isComplete,
    currentQuestion,
    total,
  };
}
