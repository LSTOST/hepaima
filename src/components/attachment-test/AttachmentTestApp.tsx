"use client";

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
  const submitGen = useRef(0);

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
          contact: "",
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
        router.push("/attachment-test/result");
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

  const onSelectLikert = useCallback(
    (v: number) => {
      const key = ATTACHMENT_QUESTIONS[qIndex].key;
      setSubmitError("");
      setAnswers((prev) => ({ ...prev, [key]: v }));
      if (qIndex < ATTACHMENT_QUESTIONS.length - 1) {
        setQIndex((i) => i + 1);
      } else {
        setStep("submitting");
      }
    },
    [qIndex]
  );

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
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-5 pt-8 text-center text-sm text-[var(--at-ink-secondary)]">
        <p>正在连接微信…</p>
      </div>
    );
  }

  if (step === "welcome") {
    return (
      <div className="flex min-h-[100dvh] flex-col pt-6">
        <p className="mb-6 text-center text-xs font-medium tracking-[0.2em] text-[var(--at-ink-tertiary)]">
          知我实验室
        </p>
        <h1 className="at-font-serif mb-3 px-1 text-center text-[1.875rem] font-semibold leading-tight text-[#7C5CBF]">
          了解你的依恋类型
        </h1>
        <p className="text-center text-sm text-[var(--at-ink-tertiary)]">
          12道题 · 5分钟 · 专属深度报告
        </p>
        <div className="min-h-0 flex-1" aria-hidden />
        <div className="flex flex-col gap-3">
          <input
            className="at-input w-full"
            placeholder="输入昵称"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            autoComplete="nickname"
          />
          <button type="button" className="at-btn-primary w-full" onClick={startQuestions}>
            开始测试
          </button>
        </div>
        <div
          className="min-h-[35dvh] shrink-0 pb-[env(safe-area-inset-bottom,0px)]"
          aria-hidden
        />
      </div>
    );
  }

  if (step === "submitting") {
    return (
      <div className="flex min-h-[55vh] flex-col items-center justify-center px-2 pt-8 text-center">
        <p className="mb-3 text-lg font-medium text-[var(--at-ink)]">
          正在生成你的依恋报告…
        </p>
        <p className="mb-8 text-sm leading-relaxed text-[var(--at-ink-secondary)]">
          通常需要30秒左右，请稍候
        </p>
        <p className="max-w-[20rem] text-sm leading-loose text-[var(--at-ink-tertiary)]">
          了解自己，是一切关系的起点
        </p>
        {submitError ? (
          <p className="mt-8 text-sm text-[var(--at-error)]">{submitError}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <div className="mx-[-20px] h-1 w-[calc(100%+40px)] max-w-none shrink-0 overflow-hidden rounded-[2px] bg-[var(--at-border)]">
        <div
          className="h-full rounded-[2px] bg-[var(--at-primary)] transition-[width] duration-300 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="flex shrink-0 justify-end px-5 pt-2 text-sm text-[var(--at-ink-tertiary)]">
        {qIndex + 1} / {ATTACHMENT_QUESTIONS.length}
      </div>

      {submitError ? (
        <p className="mx-5 mb-2 rounded-xl border border-[var(--at-border)] bg-[var(--at-surface-raised)] px-4 py-3 text-sm text-[var(--at-error)]">
          {submitError}
        </p>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col px-5">
        <div className="flex min-h-0 flex-1 flex-col justify-center pt-4">
          <h2
            id={`q-label-${currentQuestion.key}`}
            className="at-font-serif -mt-[8vh] px-6 text-center text-[20px] font-medium leading-[1.6] text-[var(--at-ink)]"
          >
            {currentQuestion.text}
          </h2>
        </div>

        <div
          className="shrink-0 space-y-5"
          style={{
            paddingBottom: "calc(64px + env(safe-area-inset-bottom, 0px))",
          }}
        >
          <div className="flex justify-center">
            <button
              type="button"
              className="text-sm text-[var(--at-ink-tertiary)] underline-offset-4 hover:underline"
              onClick={goPrevQuestion}
            >
              上一题
            </button>
          </div>
          <LikertScale7
            questionKey={currentQuestion.key}
            value={answers[currentQuestion.key]}
            onSelect={onSelectLikert}
          />
        </div>
      </div>
    </div>
  );
}
