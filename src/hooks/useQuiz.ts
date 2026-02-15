"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { Question } from "@/lib/questions";

export type AnswerItem = { questionId: number; answer: string };

const QUIZ_STORAGE_KEY = (sessionId: string) => `quiz_${sessionId}`;

interface UseQuizOptions {
  questions: Question[];
  onComplete?: (answers: AnswerItem[]) => void;
  sessionId?: string;
}

const AUTO_NEXT_DELAY_MS = 300;

export function useQuiz({ questions, onComplete, sessionId }: UseQuizOptions) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const hasRestoredRef = useRef(false);
  const isTransitioning = useRef(false);

  const total = questions.length;
  const currentQuestion = total > 0 ? questions[currentIndex] : null;
  const progress = total > 0 ? ((currentIndex + 1) / total) * 100 : 0;
  const isComplete = isSubmitting;

  // 页面加载时从 sessionStorage 恢复进度
  useEffect(() => {
    if (!sessionId || typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem(QUIZ_STORAGE_KEY(sessionId));
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

  // 每次答题后保存进度到 sessionStorage
  useEffect(() => {
    if (!sessionId || typeof window === "undefined" || !hasRestoredRef.current) return;
    if (answers.length === 0 && currentIndex === 0) return;
    try {
      sessionStorage.setItem(
        QUIZ_STORAGE_KEY(sessionId),
        JSON.stringify({ answers, currentIndex })
      );
    } catch {
      /* ignore */
    }
  }, [sessionId, answers, currentIndex]);

  const getAnswerFor = useCallback(
    (questionId: number): string | undefined =>
      answers.find((a) => a.questionId === questionId)?.answer,
    [answers]
  );

  const selectAnswer = useCallback(
    (questionId: number, answer: string) => {
      if (!currentQuestion || currentQuestion.id !== questionId) return;
      if (isTransitioning.current) return;
      if (isSubmitting) return;

      isTransitioning.current = true;

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
        return;
      }

      setTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((i) => i + 1);
        setTransitioning(false);
        isTransitioning.current = false;
      }, AUTO_NEXT_DELAY_MS);
    },
    [currentQuestion, currentIndex, total, answers, onComplete, isSubmitting]
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
    transitioning,
  };
}
