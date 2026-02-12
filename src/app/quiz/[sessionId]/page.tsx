"use client";

import React, { Suspense, useCallback, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { getDeviceId } from "@/lib/device";
import type { Stage } from "@/lib/questions";
import { UniversalQuiz } from "@/components/quiz/UniversalQuiz";
import type { UniversalAnswerItem } from "@/components/quiz/UniversalQuiz";
import { StagedQuizUI } from "@/components/quiz/StagedQuizUI";

const VALID_STAGES: Stage[] = ["AMBIGUOUS", "ROMANCE", "STABLE"];

function QuizContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const sessionId = params.sessionId as string;
  const mode = (searchParams.get("mode") ?? "STAGED") as string;
  const stageFromUrl = searchParams.get("stage") ?? "ROMANCE";
  const stageKey = VALID_STAGES.includes(stageFromUrl as Stage)
    ? (stageFromUrl as Stage)
    : "ROMANCE";

  const isUniversal = mode === "UNIVERSAL";

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const lastUniversalAnswersRef = useRef<UniversalAnswerItem[] | null>(null);

  const submitUniversalAnswers = useCallback(
    async (answers: UniversalAnswerItem[]) => {
      const deviceId = getDeviceId();
      const res = await fetch("/api/v1/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, deviceId, answers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "提交失败");
      return data;
    },
    [sessionId]
  );

  const handleUniversalComplete = useCallback(
    (answers: UniversalAnswerItem[]) => {
      lastUniversalAnswersRef.current = answers;
      setSubmitError(null);
      setSubmitting(true);
      submitUniversalAnswers(answers)
        .then(() => {
          if (typeof window !== "undefined") {
            sessionStorage.removeItem(`quiz_universal_${sessionId}`);
            window.location.assign(`${window.location.origin}/result/${sessionId}`);
          }
        })
        .catch((err) => {
          setSubmitError(err instanceof Error ? err.message : "提交失败，请重试");
          setSubmitting(false);
        });
    },
    [sessionId, submitUniversalAnswers]
  );

  const handleUniversalRetry = useCallback(() => {
    const ans = lastUniversalAnswersRef.current;
    if (!ans) return;
    setSubmitError(null);
    setSubmitting(true);
      submitUniversalAnswers(ans)
        .then(() => {
          if (typeof window !== "undefined") {
            sessionStorage.removeItem(`quiz_universal_${sessionId}`);
            window.location.assign(`${window.location.origin}/result/${sessionId}`);
          }
        })
      .catch((err) => {
        setSubmitError(err instanceof Error ? err.message : "提交失败，请重试");
        setSubmitting(false);
      });
  }, [sessionId, submitUniversalAnswers]);

  if (isUniversal) {
    return (
      <UniversalQuiz
        sessionId={sessionId}
        onComplete={handleUniversalComplete}
        isSubmitting={submitting}
        submitError={submitError}
        onRetry={handleUniversalRetry}
      />
    );
  }

  return <StagedQuizUI sessionId={sessionId} stageKey={stageKey} />;
}

export default function QuizSessionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-pink-300 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <QuizContent />
    </Suspense>
  );
}
