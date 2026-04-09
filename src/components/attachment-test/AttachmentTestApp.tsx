"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ATTACHMENT_QUESTIONS,
  type AttachmentAnswerKey,
} from "@/lib/attachment-test/questions";
import {
  getWxOpenIdFromCookie,
  isWeChatBrowser,
} from "@/lib/attachment-test/wechat";
import { LikertScale7 } from "./LikertScale7";

type Step = "welcome" | "question" | "submitting";

const OAUTH_PATH = "/api/v1/wechat/oauth";
const SUBMIT_PATH = "/api/v1/attachment-test/submit";

const LIKERT_ADVANCE_MS = 300;

function buildAnswersRecord(
  map: Partial<Record<AttachmentAnswerKey, number>>
): Record<AttachmentAnswerKey, number> {
  const out = {} as Record<AttachmentAnswerKey, number>;
  for (const q of ATTACHMENT_QUESTIONS) {
    const v = map[q.key];
    if (typeof v !== "number" || v < 1 || v > 7) {
      throw new Error(`missing or invalid answer: ${q.key}`);
    }
    out[q.key] = v;
  }
  return out;
}

export function AttachmentTestApp() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [oauthGateDone, setOauthGateDone] = useState(false);
  const [nickname, setNickname] = useState("");
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<Record<AttachmentAnswerKey, number>>>(
    {}
  );
  const [submitError, setSubmitError] = useState("");
  const [likertLocked, setLikertLocked] = useState(false);
  const submitGen = useRef(0);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const likertBusyRef = useRef(false);

  useEffect(() => {
    if (!isWeChatBrowser()) {
      setOauthGateDone(true);
      return;
    }
    const openid = getWxOpenIdFromCookie();
    if (openid) {
      setOauthGateDone(true);
      return;
    }
    window.location.href = `${OAUTH_PATH}?redirect=${encodeURIComponent("/attachment-test")}`;
  }, []);

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, []);

  useEffect(() => {
    likertBusyRef.current = false;
    setLikertLocked(false);
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  }, [qIndex]);

  useEffect(() => {
    if (step !== "submitting") return;
    const id = ++submitGen.current;

    async function submit() {
      setSubmitError("");
      let body: {
        nickname: string;
        contact: string;
        openid: string;
        answers: Record<AttachmentAnswerKey, number>;
      };
      try {
        body = {
          nickname: nickname.trim(),
          contact: "wechat_user",
          openid: getWxOpenIdFromCookie() ?? "",
          answers: buildAnswersRecord(answers),
        };
      } catch (e) {
        console.error("[attachment-test] build body failed", e);
        if (id !== submitGen.current) return;
        setSubmitError("答题数据不完整，请返回检查。");
        setStep("question");
        return;
      }

      try {
        const submitUrl =
          typeof window !== "undefined"
            ? new URL(SUBMIT_PATH, window.location.origin).href
            : SUBMIT_PATH;
        console.log("[attachment-test] 即将提交", { path: SUBMIT_PATH, url: submitUrl });
        const res = await fetch(SUBMIT_PATH, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        console.log("[attachment-test] 提交 HTTP 响应", { ok: res.ok, status: res.status });
        const data = (await res.json().catch(() => ({}))) as {
          status?: string;
          error?: string;
          message?: string;
          responseId?: string;
          response_id?: string;
        };
        if (id !== submitGen.current) return;
        if (!res.ok) {
          const msg =
            typeof data.error === "string"
              ? data.error
              : typeof data.message === "string"
                ? data.message
                : `提交失败（${res.status}）`;
          setSubmitError(msg);
          setStep("question");
          return;
        }
        const responseIdRaw =
          typeof data.responseId === "string"
            ? data.responseId
            : typeof data.response_id === "string"
              ? data.response_id
              : "";
        const responseId = responseIdRaw.trim();
        if (!responseId) {
          setSubmitError("提交成功但未返回报告编号，请稍后再试。");
          setStep("question");
          return;
        }
        router.push(`/report/${encodeURIComponent(responseId)}`);
      } catch (e) {
        console.error("[attachment-test] fetch 失败", e);
        if (id !== submitGen.current) return;
        setSubmitError("网络异常，请检查网络后重试。");
        setStep("question");
      }
    }

    void submit();
  }, [step, nickname, answers, router]);

  const currentQuestion = ATTACHMENT_QUESTIONS[qIndex];
  const progressDone = qIndex + 1;
  const progressPct = (progressDone / ATTACHMENT_QUESTIONS.length) * 100;

  const onSelectLikert = useCallback((v: number) => {
    if (likertBusyRef.current) return;
    likertBusyRef.current = true;
    setLikertLocked(true);
    const idx = qIndex;
    const key = ATTACHMENT_QUESTIONS[idx].key;
    setSubmitError("");
    setAnswers((prev) => ({ ...prev, [key]: v }));

    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = setTimeout(() => {
      advanceTimerRef.current = null;
      likertBusyRef.current = false;
      setLikertLocked(false);
      if (idx < ATTACHMENT_QUESTIONS.length - 1) {
        setQIndex(idx + 1);
      } else {
        setStep("submitting");
      }
    }, LIKERT_ADVANCE_MS);
  }, [qIndex]);

  const startQuestions = () => {
    setQIndex(0);
    setAnswers({});
    setStep("question");
  };

  const goPrevQuestion = () => {
    setSubmitError("");
    if (qIndex <= 0) {
      setStep("welcome");
      return;
    }
    setQIndex((i) => i - 1);
  };

  if (!oauthGateDone) {
    return (
      <div className="attachment-zhiwo flex min-h-[50vh] flex-col items-center justify-center px-5 pt-8 text-center text-sm text-[var(--at-ink-secondary)]">
        <p>正在连接微信…</p>
      </div>
    );
  }

  if (step === "welcome") {
    return (
      <div className="attachment-zhiwo flex min-h-screen flex-col">
        <header className="shrink-0 pt-10 text-center">
          <p className="text-sm text-[var(--at-ink-tertiary)]">知我实验室</p>
        </header>

        <div className="flex flex-1 flex-col justify-center px-6 text-center">
          <h1 className="at-font-serif text-[1.875rem] font-semibold leading-[1.4] text-[var(--at-ink)]">
            了解你的依恋类型
          </h1>
          <p className="mt-3 text-base leading-[1.7] text-[var(--at-ink-secondary)]">
            12道题，5分钟，看见你在感情里的真实模式
          </p>
          <p className="mt-6 text-sm leading-[1.7] text-[var(--at-ink-tertiary)]">
            本测试仅供自我觉察参考，不构成心理诊断或治疗建议。
          </p>
        </div>

        <footer className="shrink-0 px-6 pb-10">
          <input
            className="mb-3 w-full rounded-[12px] border border-[var(--at-border)] bg-[var(--at-surface-raised)] px-4 py-3 text-base text-[var(--at-ink)] outline-none placeholder:text-[var(--at-ink-tertiary)] focus:border-[var(--at-primary-light)] focus:ring-[3px] focus:ring-[rgba(124,92,191,0.08)]"
            placeholder="输入昵称"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            autoComplete="nickname"
          />
          <button
            type="button"
            className="h-[52px] w-full rounded-[12px] bg-[var(--at-primary)] font-semibold text-white transition-transform active:scale-[0.98] active:bg-[var(--at-primary-dark)]"
            onClick={startQuestions}
          >
            开始测试
          </button>
        </footer>
      </div>
    );
  }

  if (step === "submitting") {
    return (
      <div className="attachment-zhiwo flex min-h-[55vh] flex-col items-center justify-center px-2 pt-8 text-center">
        <p className="mb-6 max-w-[22rem] text-base leading-[1.7] text-[var(--at-ink)]">
          正在生成你的依恋报告，通常需要30秒左右。
        </p>
        <p className="max-w-[20rem] text-sm leading-[1.7] text-[var(--at-ink-tertiary)]">
          了解自己，是一切关系的起点
        </p>
        {submitError ? (
          <p className="mt-8 text-sm text-[var(--at-error)]">{submitError}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="attachment-zhiwo min-h-screen min-h-[100dvh]">
      <div
        className="pointer-events-none fixed top-0 right-0 left-0 z-50 h-[3px]"
        role="progressbar"
        aria-valuenow={progressDone}
        aria-valuemin={1}
        aria-valuemax={ATTACHMENT_QUESTIONS.length}
        aria-label={`进度 ${progressDone} / ${ATTACHMENT_QUESTIONS.length}`}
      >
        <div
          className="h-full bg-[var(--at-primary)] transition-[width] duration-500 ease-in-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div
        className="flex min-h-screen min-h-[100dvh] flex-col px-6"
        style={{
          paddingTop:
            "calc(3px + max(12px, env(safe-area-inset-top, 0px)))",
        }}
      >
        {submitError ? (
          <p className="mb-2 rounded-xl border border-[var(--at-border)] bg-[var(--at-surface-raised)] px-4 py-3 text-sm text-[var(--at-error)]">
            {submitError}
          </p>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={qIndex}
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{
                  x: -40,
                  opacity: 0,
                  transition: { duration: 0.2, ease: "easeIn" },
                }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="-mt-[10vh] max-w-full"
              >
                <h2
                  id={`q-label-${currentQuestion.key}`}
                  className="text-center text-xl font-medium leading-relaxed text-[var(--at-ink)]"
                >
                  {currentQuestion.text}
                </h2>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="shrink-0 pb-24">
            <LikertScale7
              questionKey={currentQuestion.key}
              value={answers[currentQuestion.key]}
              onSelect={onSelectLikert}
              disabled={likertLocked}
            />
          </div>
        </div>
      </div>

      {qIndex > 0 ? (
        <button
          type="button"
          className="fixed bottom-0 left-1/2 z-40 -translate-x-1/2 border-0 bg-transparent px-4 py-4 text-sm text-[var(--at-ink-tertiary)]"
          style={{
            paddingBottom: "max(16px, env(safe-area-inset-bottom, 0px))",
          }}
          onClick={goPrevQuestion}
        >
          上一题
        </button>
      ) : null}
    </div>
  );
}
