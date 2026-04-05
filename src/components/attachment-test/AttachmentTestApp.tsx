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

type Step = "welcome" | "profile" | "question" | "submitting";

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
  const [contact, setContact] = useState("");
  const [contactError, setContactError] = useState("");
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
          contact: contact.trim(),
          openid: getWxOpenIdFromCookie() ?? "",
          answers: buildAnswersRecord(answers),
        };
      } catch {
        if (id !== submitGen.current) return;
        setSubmitError("答题数据不完整，请返回检查。");
        setStep("question");
        return;
      }

      try {
        console.log("即将提交", SUBMIT_PATH);
        const res = await fetch(SUBMIT_PATH, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        console.log("提交结果", { ok: res.ok, status: res.status });
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
        console.log("提交结果", { error: e instanceof Error ? e.message : String(e) });
        if (id !== submitGen.current) return;
        setSubmitError("网络异常，请检查网络后重试。");
        setStep("question");
      }
    }

    void submit();
  }, [step, nickname, contact, answers, router]);

  const currentQuestion = ATTACHMENT_QUESTIONS[qIndex];
  const progressDone = qIndex + 1;
  const progressPct = (progressDone / ATTACHMENT_QUESTIONS.length) * 100;

  const onSelectLikert = useCallback((v: number) => {
    const key = ATTACHMENT_QUESTIONS[qIndex].key;
    setSubmitError("");
    setAnswers((prev) => ({ ...prev, [key]: v }));
    if (qIndex < ATTACHMENT_QUESTIONS.length - 1) {
      setQIndex((i) => i + 1);
    } else {
      setStep("submitting");
    }
  }, [qIndex]);

  const goProfile = () => {
    setStep("profile");
  };

  const startQuestions = () => {
    setContactError("");
    if (!contact.trim()) {
      setContactError("请填写邮箱或微信号，用于备份接收报告。");
      return;
    }
    setQIndex(0);
    setAnswers({});
    setStep("question");
  };

  const goPrevQuestion = () => {
    setSubmitError("");
    if (qIndex <= 0) {
      setStep("profile");
      return;
    }
    setQIndex((i) => i - 1);
  };

  if (!oauthGateDone) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-5 text-center text-sm text-[var(--at-ink-secondary)]">
        <p>正在连接微信…</p>
      </div>
    );
  }

  if (step === "welcome") {
    return (
      <div className="flex flex-col items-center pt-4 pb-10">
        <p className="mb-8 text-center text-sm font-medium tracking-[0.2em] text-[var(--at-ink-secondary)]">
          知我实验室
        </p>
        <h1 className="at-font-serif mb-3 text-center text-[1.875rem] font-semibold leading-tight text-[var(--at-ink)]">
          了解你的依恋类型
        </h1>
        <p className="mb-2 text-center text-base leading-relaxed text-[var(--at-ink-secondary)]">
          12道题 · 5分钟 · 专属深度报告
        </p>
        <p className="mb-10 max-w-[22rem] text-center text-sm leading-relaxed text-[var(--at-ink-tertiary)]">
          完成后报告将发送到此服务号，请保持关注
        </p>
        <button
          type="button"
          className="at-btn-primary w-full max-w-[22rem]"
          onClick={goProfile}
        >
          开始测试
        </button>
      </div>
    );
  }

  if (step === "profile") {
    return (
      <div className="flex flex-col pt-2 pb-10">
        <div className="at-card mb-8">
          <label className="mb-1 block text-sm text-[var(--at-ink-secondary)]">
            称呼（选填）
          </label>
          <input
            className="at-input mb-6 w-full"
            placeholder='给报告起个称呼，比如"小月"'
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            autoComplete="nickname"
          />
          <label className="mb-1 block text-sm text-[var(--at-ink-secondary)]">
            联系方式（必填）
          </label>
          <input
            className="at-input mb-2 w-full"
            placeholder="邮箱或微信号，用于备份接收"
            value={contact}
            onChange={(e) => {
              setContact(e.target.value);
              setContactError("");
            }}
            autoComplete="email"
          />
          {contactError ? (
            <p className="mb-4 text-sm text-[var(--at-error)]">{contactError}</p>
          ) : null}
          <p className="text-sm leading-relaxed text-[var(--at-ink-tertiary)]">
            报告将优先通过服务号发送
          </p>
        </div>
        <button type="button" className="at-btn-primary w-full" onClick={startQuestions}>
          开始答题
        </button>
      </div>
    );
  }

  if (step === "submitting") {
    return (
      <div className="flex min-h-[55vh] flex-col items-center justify-center px-2 text-center">
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
    <div className="flex flex-col pb-8">
      {submitError ? (
        <p className="mb-4 rounded-xl border border-[var(--at-border)] bg-[var(--at-surface-raised)] px-4 py-3 text-sm text-[var(--at-error)]">
          {submitError}
        </p>
      ) : null}
      <div className="mb-6">
        <div className="mb-2 flex justify-end text-sm text-[var(--at-ink-tertiary)]">
          第 {qIndex + 1} 题 / 共 {ATTACHMENT_QUESTIONS.length} 题
        </div>
        <div className="h-[4px] w-full overflow-hidden rounded-[2px] bg-[var(--at-border)]">
          <div
            className="h-full rounded-[2px] bg-[var(--at-primary)] transition-[width] duration-300 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <h2
        id={`q-label-${currentQuestion.key}`}
        className="at-font-serif mb-10 text-center text-xl font-medium leading-tight text-[var(--at-ink)]"
      >
        {currentQuestion.text}
      </h2>

      <LikertScale7
        questionKey={currentQuestion.key}
        value={answers[currentQuestion.key]}
        onSelect={onSelectLikert}
      />

      <div className="mt-12 flex justify-center">
        <button
          type="button"
          className="text-sm text-[var(--at-ink-tertiary)] underline-offset-4 hover:underline"
          onClick={goPrevQuestion}
        >
          上一题
        </button>
      </div>
    </div>
  );
}
