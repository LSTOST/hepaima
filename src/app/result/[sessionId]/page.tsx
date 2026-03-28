"use client";

import React, { useEffect, useState, Suspense, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Heart,
  MessageCircle,
  BarChart3,
  Lock,
  Share2,
  RotateCcw,
  ArrowRight,
  Copy,
  Check,
  Link2,
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  Lightbulb,
  ThumbsUp,
  Target,
  Brain,
  MessageCircleHeart,
  TrendingUp,
  Calendar,
  MessagesSquare,
  User,
  Users,
  Sprout,
  Zap,
  ShieldAlert,
  Shield,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { getCompatibilityLevel } from "@/lib/scoring";
import {
  getScenarioBySlug,
  getScenarioDimensionQuestionCounts,
  type ScenarioDimension,
} from "@/lib/scenario-quizzes";
import { getScenarioDimensionStems } from "@/lib/scenario-report-sections";
import { getDeviceId } from "@/lib/device";
import { STAGE_LABELS } from "@/lib/stage-copy";

/** 双人海报导出：与 html2canvas / html-to-image 对齐的中文字体栈 */
const COUPLE_POSTER_FONT =
  '"PingFang SC","Hiragino Sans GB","Noto Sans SC","Source Han Sans SC","Microsoft YaHei","Microsoft JhengHei",sans-serif';

type PageState = "loading" | "waiting" | "generating" | "ready" | "error";

interface SessionStatus {
  status: string;
  mode?: string;
  stage: string;
  scenarioSlug?: string | null;
  scenarioTitle?: string | null;
  scenarioSubtitle?: string | null;
  inviteCode?: string;
  initiatorName?: string;
  partnerName?: string;
  initiatorCompleted?: boolean;
  partnerCompleted?: boolean;
}

interface OverallAnalysisHighlight {
  emoji: string;
  title: string;
  detail: string;
}

interface OverallAnalysisObject {
  summary: string;
  highlights: OverallAnalysisHighlight[];
  advice: string;
}

interface ReportData {
  summary?: string;
  overallAnalysis?: string | OverallAnalysisObject;
  overallAnalysisPoints?: string[];
  attachmentAnalysis?: {
    title?: string;
    description?: string;
    tips?: string[];
  };
  loveLanguageAnalysis?: {
    title?: string;
    description?: string;
    tips?: string[];
  };
  strengths?: string[];
  challenges?: string[];
  actionItems?: Array<{ title?: string; description?: string }>;
}

interface PremiumDailyScenario {
  scenario: string;
  misunderstanding: string;
  betterWay: string;
}

interface PremiumCouplesTask {
  week: string;
  title: string;
  description: string;
  goal: string;
}

interface DeepAnalysisHighlight {
  title: string;
  detail: string;
}

interface PremiumReportData {
  deepAnalysis?: string | { summary: string; highlights: DeepAnalysisHighlight[] };
  attachmentDeep?: {
    title?: string;
    initiatorAnalysis?: string;
    partnerAnalysis?: string;
    interactionPattern?: string;
    growthPath?: string;
  };
  loveLanguageDeep?: {
    title?: string;
    mismatchAnalysis?: string;
    dailyScenarios?: PremiumDailyScenario[];
  };
  relationshipForecast?: {
    title?: string;
    shortTerm?: string;
    longTerm?: string;
    turningPoints?: string[];
  };
  couplesTasks?: PremiumCouplesTask[];
  communicationGuide?: {
    title?: string;
    forInitiator?: string;
    forPartner?: string;
    conflictResolution?: string;
    conflictResolutionSteps?: string[];
  };
}

interface ResultData {
  id?: string;
  scenarioSlug?: string | null;
  scenarioTitle?: string | null;
  scenarioSubtitle?: string | null;
  overallScore: number;
  initiatorAttachment: string;
  partnerAttachment: string;
  initiatorAttachmentType?: string;
  partnerAttachmentType?: string;
  initiatorLoveLanguage: string;
  partnerLoveLanguage: string;
  initiatorLoveLanguageType?: string;
  partnerLoveLanguageType?: string;
  dimensions: Record<string, number>;
  report?: ReportData | null;
  premiumReport?: PremiumReportData | null;
  purchasedTier?: string;
  reportStatus?: { basic: "ready" | "generating"; premium: "ready" | "generating" };
}

/** 注入支付宝表单并自动提交跳转 */
function AlipayFormInjector({ html }: { html: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const submitted = React.useRef(false);
  React.useEffect(() => {
    if (!ref.current || submitted.current) return;
    ref.current.innerHTML = html;
    const form = ref.current.querySelector("form");
    if (form) {
      submitted.current = true;
      (form as HTMLFormElement).submit();
    }
  }, [html]);
  return (
    <div className="text-center py-2">
      <p className="text-sm text-gray-700 mb-2">正在跳转支付宝...</p>
      <div ref={ref} className="hidden" aria-hidden />
    </div>
  );
}

/** 报告正文渲染：**文字** 转为加粗；'文字' 与 "文字" 去掉引号并加粗，不显示引号 */
function ReportText({ text }: { text: string }) {
  const re = /(\*\*[^*]+\*\*|'[^']*'|"[^"]*"|[\u201C][^\u201D]*[\u201D])/g;
  const parts = text.split(re);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**"))
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        if (part.startsWith("'") && part.endsWith("'"))
          return <strong key={i}>{part.slice(1, -1)}</strong>;
        if ((part.startsWith('"') && part.endsWith('"')) || (part.startsWith("\u201C") && part.endsWith("\u201D")))
          return <strong key={i}>{part.slice(1, -1)}</strong>;
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </>
  );
}

/** 专属沟通指南：按「冲突处理锦囊」的风格拆行
 * - 若文本里有 1. 2. 3. 这类有序号结构，按步骤逐条列一行；首句若是引导语（如「XX可以练习:」）则单独一行不参与编号
 * - 否则按句号等拆成多行要点，左侧竖线增强可读性
 */
function CommunicationAdvice({ text }: { text: string }) {
  const trimmed = text.trim();

  // 1）优先判断是否存在「1. / 2. / 3.」这种有序号结构
  const byNumber = trimmed
    .split(/\s*\d+[.)]、?\s*/u)
    .map((s) => s.trim())
    .filter(Boolean);

  // 至少拆出 2 条，才认为是「有序号」的分步建议
  if (byNumber.length > 1) {
    const first = byNumber[0];
    const isIntro =
      first.length <= 25 &&
      (/[:：]$/u.test(first) || /可以(练习)?[:：]?$/u.test(first) || /^[^，。]+[:：]$/u.test(first));
    const steps = isIntro ? byNumber.slice(1) : byNumber;

    return (
      <div className="space-y-2 text-sm text-gray-600 pl-4 border-l-2 border-violet-300">
        {isIntro && (
          <p className="leading-relaxed -ml-4 pl-4">
            <ReportText text={first} />
          </p>
        )}
        <ol className="space-y-2 list-decimal list-inside">
          {steps.map((s, i) => (
            <li key={i} className="leading-relaxed">
              <ReportText text={s} />
            </li>
          ))}
        </ol>
      </div>
    );
  }

  // 2）否则按句号/问号/感叹号拆成多行要点
  const sentences = trimmed
    .split(/[。！？?!]+/u)
    .map((s) => s.trim())
    .filter(Boolean);

  if (sentences.length <= 1) {
    return (
      <p className="text-sm text-gray-600 leading-relaxed">
        <ReportText text={trimmed} />
      </p>
    );
  }

  return (
    <ul className="space-y-2 text-sm text-gray-600 pl-4 border-l-2 border-violet-300">
      {sentences.map((s, i) => (
        <li key={i} className="leading-relaxed">
          <ReportText text={s} />
        </li>
      ))}
    </ul>
  );
}

const GENERATING_TIPS = [
  "正在分析你们的依恋类型…",
  "正在解读爱的语言匹配…",
  "正在撰写关系建议…",
  "正在整理行动清单…",
  "即将完成，再等一下下…",
];

const SCENARIO_GENERATING_TIPS = [
  "正在汇总你们在现实场景中的打分…",
  "正在对照沟通、价值观与冲突处理等维度…",
  "正在撰写贴合该场景的建议…",
  "正在生成场景化行动清单…",
  "即将完成，再等一下下…",
];

const DIMENSION_NAMES: Record<string, string> = {
  attachment: "依恋匹配",
  loveLanguage: "爱的语言",
  communication: "沟通方式",
  values: "价值观",
  lifestyle: "生活习惯",
  conflict: "冲突处理",
};

const ATTACHMENT_STYLES: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  SECURE: { label: "安全型", bg: "#D1FAE5", text: "#059669" },
  ANXIOUS: { label: "焦虑型", bg: "#FEF3C7", text: "#D97706" },
  AVOIDANT: { label: "回避型", bg: "#DBEAFE", text: "#2563EB" },
  FEARFUL: { label: "混乱型", bg: "#F3E8FF", text: "#7C3AED" },
};

function getAttachmentPairKey(a: string, b: string): string {
  return [a, b].sort().join("+");
}

const ATTACHMENT_PAIR_INFO: Record<
  string,
  { name: string; analysis: string }
> = {
  "ANXIOUS+SECURE": {
    name: "温暖港湾",
    analysis:
      "安全型与焦虑型的组合并不少见。安全型伴侣的稳定和可靠，能够为焦虑型伴侣提供安全感。关键在于双方的沟通质量和对彼此需求的理解。",
  },
  "AVOIDANT+SECURE": {
    name: "耐心守候",
    analysis:
      "安全型与回避型的配对需要更多耐心。安全型一方可以给予空间，同时用稳定的爱意慢慢融化回避型的心墙。理解和尊重边界是关键。",
  },
  "FEARFUL+SECURE": {
    name: "稳定之锚",
    analysis:
      "安全型伴侣能够成为混乱型伴侣在关系中的稳定锚点。安全型提供的可靠感可以帮助对方逐渐建立信任，减少对亲密关系的恐惧。",
  },
  "ANXIOUS+ANXIOUS": {
    name: "热烈共鸣",
    analysis:
      "双方都渴望亲密与确认，容易产生强烈的情感共鸣。需要注意的是，过度的黏腻可能带来压力，学会适度独立对关系更有益。",
  },
  "ANXIOUS+AVOIDANT": {
    name: "推拉之间",
    analysis:
      "焦虑型渴望亲密，回避型需要空间，这是经典的推拉组合。需要双方坦诚沟通各自需求，找到舒适的平衡点。",
  },
  "ANXIOUS+FEARFUL": {
    name: "渴望理解",
    analysis:
      "双方都渴望被理解与接纳，却又可能对亲密感到不安。建立安全感和循序渐进地加深信任，是这段关系的成长方向。",
  },
  "AVOIDANT+AVOIDANT": {
    name: "独立同行",
    analysis:
      "双方都重视独立和空间，相处时可能较为疏离。若能在保持边界的同时，主动表达关心，关系可以更加稳固。",
  },
  "AVOIDANT+FEARFUL": {
    name: "缓慢靠近",
    analysis:
      "双方都对亲密有保留，关系发展可能较慢。给予彼此足够的时间和空间，同时小步尝试靠近，有助于建立信任。",
  },
  "FEARFUL+FEARFUL": {
    name: "共同成长",
    analysis:
      "双方都可能在亲密关系中感到矛盾，但正因为理解彼此的不安，可以互相扶持、共同成长，逐步建立更安全的关系模式。",
  },
  "SECURE+SECURE": {
    name: "双重安全堡垒",
    analysis:
      "两位安全型伴侣能够建立稳定、温暖的关系。彼此信任、善于沟通，是理想的配对组合，关系往往持久而和谐。",
  },
};

const LOVE_LANGUAGE_ANALYSIS: Record<string, string> = {
  MATCH: "你们表达爱的方式非常契合，能够很好地理解并满足彼此的情感需求。继续保持这种默契，关系会越来越亲密。",
  COMPLEMENT:
    "你们表达爱的方式有所不同，但这并不意味着不合适。学会用对方的语言去爱，是关系成长的重要一步。尝试多给予 TA 想要的那种爱的表达吧。",
};

function useCounter(target: number, duration = 1500) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    let startTime: number | null = null;
    let frameId: number;

    function animate(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    }

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [started, target, duration]);

  return { count, start: () => setStarted(true) };
}

function AnimatedBar({ score, delay = 0 }: { score: number; delay?: number }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const safeScore = Math.min(100, Math.max(0, score));

  return (
    <div
      ref={ref}
      className="h-2 w-full rounded-full overflow-hidden bg-gray-100"
      style={{ minHeight: 8 }}
    >
      <motion.div
        initial={{ width: "0%" }}
        animate={{ width: isInView ? `${safeScore}%` : "0%" }}
        transition={{ duration: 1, delay, ease: "easeOut" }}
        className="block h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
      />
    </div>
  );
}

function ScrollCard({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ReportCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6 animate-pulse">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gray-100" />
        <div className="h-5 w-24 rounded bg-gray-100" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-gray-100" />
        <div className="h-3 w-4/5 rounded bg-gray-100" />
        <div className="h-3 w-3/4 rounded bg-gray-100" />
      </div>
    </div>
  );
}

function ResultPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const sessionId = params.sessionId as string;
  const hintReady = searchParams.get("ready") === "1";

  const [pageState, setPageState] = useState<PageState>(hintReady ? "generating" : "loading");
  const [sessionData, setSessionData] = useState<SessionStatus | null>(null);
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [reportPollTimeout, setReportPollTimeout] = useState(false);
  const [generatingTipIndex, setGeneratingTipIndex] = useState(0);
  const [generatingProgress, setGeneratingProgress] = useState(0);
  const reportPollCountRef = React.useRef(0);
  const streamFetchStartedRef = React.useRef(false);
  const REPORT_POLL_MAX = 12;
  const REPORT_POLL_INTERVAL_MS = 2000;

  const inviteCode = sessionData?.inviteCode ?? "";
  const inviteLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/quiz/join?code=${inviteCode}`
      : "";

  const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      /* fallback */
    }
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.top = "0";
      textarea.style.left = "0";
      textarea.style.width = "2em";
      textarea.style.height = "2em";
      textarea.style.padding = "0";
      textarea.style.border = "none";
      textarea.style.outline = "none";
      textarea.style.boxShadow = "none";
      textarea.style.background = "transparent";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, text.length);
      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      return ok;
    } catch {
      return false;
    }
  }, []);

  const handleCopyCode = useCallback(async () => {
    if (!inviteCode) return;
    const ok = await copyToClipboard(inviteCode);
    if (ok) {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  }, [inviteCode, copyToClipboard]);

  const handleCopyLink = useCallback(async () => {
    if (!inviteLink) return;
    const ok = await copyToClipboard(inviteLink);
    if (ok) {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  }, [inviteLink, copyToClipboard]);

  const fetchResultWithRetry = useCallback(
    async (retries = 3): Promise<{ status: string; result?: unknown } | null> => {
      for (let i = 0; i < retries; i++) {
        const res = await fetch(`/api/v1/result/${sessionId}`, { cache: "no-store" });
        const data = await res.json();
        if (res.ok) return data;
        if (res.status === 500 && i < retries - 1) {
          await new Promise((r) => setTimeout(r, 2000));
          continue;
        }
        return null;
      }
      return null;
    },
    [sessionId]
  );

  const refetchResultCb = useCallback(async () => {
    const json = await fetchResultWithRetry();
    if (json?.status === "ready" && json.result) setResultData(json.result as ResultData);
  }, [fetchResultWithRetry]);

  // Initial fetch and polling logic
  useEffect(() => {
    if (!sessionId) return;

    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/v1/quiz/status/${sessionId}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.message ?? "获取失败");
          setPageState("error");
          return;
        }
        setSessionData(data);

        const bothCompleted = data.initiatorCompleted && data.partnerCompleted;

        if (data.status === "COMPLETED") {
          const resultJson = await fetchResultWithRetry();
          if (!resultJson) {
            setError("获取结果失败，请稍后再试");
            setPageState("error");
            return;
          }
          if (resultJson.status === "ready" && resultJson.result) {
            setResultData(resultJson.result as ResultData);
            setPageState("ready");
          } else if (resultJson.status === "generating") {
            setPageState("generating");
          } else {
            setPageState("waiting");
          }
        } else if (bothCompleted || hintReady) {
          setPageState("generating");
        } else {
          setPageState("waiting");
        }
      } catch {
        setError("网络错误，请稍后重试");
        setPageState("error");
      }
    };

    fetchStatus();
  }, [sessionId, fetchResultWithRetry]);

  // Poll status when waiting（立即查一次 + 每 3s 轮询，减少双方完成后的卡顿感）
  useEffect(() => {
    if (pageState !== "waiting" || !sessionId) return;

    const poll = async () => {
      try {
        const res = await fetch(`/api/v1/quiz/status/${sessionId}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) return;
        setSessionData(data);
        const bothCompleted = data.initiatorCompleted && data.partnerCompleted;
        if (data.status === "COMPLETED") {
          const resultJson = await fetchResultWithRetry();
          if (resultJson) {
            if (resultJson.status === "ready" && resultJson.result) {
              setResultData(resultJson.result as ResultData);
              setPageState("ready");
            } else if (resultJson.status === "generating") {
              setPageState("generating");
            }
          }
        } else if (bothCompleted) {
          setPageState("generating");
        }
      } catch {
        /* ignore */
      }
    };

    poll();
    const timer = setInterval(poll, 1500);
    return () => clearInterval(timer);
  }, [pageState, sessionId, fetchResultWithRetry]);

  useEffect(() => {
    if (pageState !== "generating" || !sessionId) return;

    const poll = async () => {
      try {
        const resultJson = await fetchResultWithRetry();
        if (resultJson?.status === "ready" && resultJson.result) {
          setResultData(resultJson.result as ResultData);
          setPageState("ready");
        }
      } catch {
        /* ignore */
      }
    };

    poll();
    const timer = setInterval(poll, 1500);
    return () => clearInterval(timer);
  }, [pageState, sessionId, fetchResultWithRetry]);

  // 基础报告：优先流式拉取，同时轮询作为回退（如另一端已写入）
  useEffect(() => {
    if (pageState !== "ready" || !sessionId || !resultData) return;
    const needBasic = resultData.reportStatus?.basic === "generating" && !resultData.report;
    if (!needBasic || reportPollTimeout) return;

    const poll = async () => {
      if (reportPollCountRef.current >= REPORT_POLL_MAX) {
        setReportPollTimeout(true);
        return;
      }
      reportPollCountRef.current += 1;
      try {
        const resultJson = await fetchResultWithRetry();
        if (resultJson?.status === "ready" && resultJson.result) {
          const next = resultJson.result as ResultData;
          setResultData(next);
          if (next.report) setReportPollTimeout(false);
        }
      } catch {
        /* ignore */
      }
    };
    poll();
    const timer = setInterval(poll, REPORT_POLL_INTERVAL_MS);

    if (!streamFetchStartedRef.current) {
      streamFetchStartedRef.current = true;
      let cancelled = false;
      let partialShown = false;
      const tryParsePartial = (raw: string): ReportData | null => {
        const cleaned = raw.trim().replace(/^json\s+/i, "");
        const noMarkdown = cleaned.replace(/```(?:json)?\s*([\s\S]*?)```/, "$1").trim();
        for (const s of [noMarkdown, cleaned]) {
          for (let n = 0; n <= 10; n++) {
            const tryRaw = s + "}".repeat(n);
            try {
              const o = JSON.parse(tryRaw) as Record<string, unknown>;
              if (o && (typeof o.summary === "string" || (o.overallAnalysis && typeof o.overallAnalysis === "object"))) {
                return o as ReportData;
              }
            } catch {
              /* continue */
            }
          }
        }
        return null;
      };
      (async () => {
        try {
          const res = await fetch(`/api/v1/result/${sessionId}/report/stream`);
          if (cancelled) return;
          if (res.status === 400) {
            const resultJson = await fetchResultWithRetry();
            if (resultJson?.status === "ready" && resultJson.result) {
              setResultData(resultJson.result as ResultData);
            }
            return;
          }
          if (!res.ok) return;
          const reader = res.body?.getReader();
          if (!reader) return;
          const decoder = new TextDecoder();
          let buffer = "";
          for (;;) {
            const { done, value } = await reader.read();
            if (cancelled) return;
            if (value) {
              buffer += decoder.decode(value, { stream: true });
              if (!partialShown && buffer.length > 400) {
                const partial = tryParsePartial(buffer);
                if (partial) {
                  partialShown = true;
                  setResultData((prev) =>
                    prev
                      ? {
                          ...prev,
                          report: partial,
                          reportBasic: partial,
                          reportStatus: {
                            ...prev.reportStatus,
                            basic: "ready",
                          } as { basic: "ready" | "generating"; premium: "ready" | "generating" },
                        }
                      : prev
                  );
                }
              }
            }
            if (done) break;
          }
          let parsed: ReportData;
          try {
            parsed = JSON.parse(buffer) as ReportData;
          } catch {
            const jsonMatch = buffer.match(/\{[\s\S]*\}/);
            parsed = jsonMatch ? (JSON.parse(jsonMatch[0]) as ReportData) : ({} as ReportData);
          }
          setResultData((prev) =>
            prev
              ? {
                  ...prev,
                  report: parsed,
                  reportBasic: parsed,
                  reportStatus: {
                    ...prev.reportStatus,
                    basic: "ready",
                  } as { basic: "ready" | "generating"; premium: "ready" | "generating" },
                }
              : prev
          );
        } catch {
          if (!cancelled) streamFetchStartedRef.current = false;
        }
      })();

      return () => {
        cancelled = true;
        clearInterval(timer);
      };
    }

    return () => clearInterval(timer);
  }, [pageState, sessionId, resultData?.reportStatus?.basic, resultData?.report, reportPollTimeout, fetchResultWithRetry]);

  // 深度报告生成中时轮询，拿到 premiumReport 后更新 resultData
  useEffect(() => {
    if (pageState !== "ready" || !sessionId || !resultData) return;
    const needPremium = resultData.reportStatus?.premium === "generating" && !resultData.premiumReport;
    if (!needPremium) return;

    const pollPremium = async () => {
      try {
        const resultJson = await fetchResultWithRetry();
        if (resultJson?.status === "ready" && resultJson.result) {
          const next = resultJson.result as ResultData;
          setResultData(next);
        }
      } catch {
        /* ignore */
      }
    };

    pollPremium();
    const timer = setInterval(pollPremium, REPORT_POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [pageState, sessionId, resultData?.reportStatus?.premium, resultData?.premiumReport, fetchResultWithRetry]);

  // 生成报告中轮播提示文案 + 进度条
  useEffect(() => {
    if (pageState !== "generating") return;
    const tips =
      sessionData?.mode === "SCENARIO" || sessionData?.scenarioSlug
        ? SCENARIO_GENERATING_TIPS
        : GENERATING_TIPS;
    const tipTimer = setInterval(() => {
      setGeneratingTipIndex((i) => (i + 1) % tips.length);
    }, 2500);
    setGeneratingProgress(0);
    const start = Date.now();
    const progressTimer = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      let p: number;
      if (elapsed < 2) p = (elapsed / 2) * 30;
      else if (elapsed < 6) p = 30 + ((elapsed - 2) / 4) * 30;
      else if (elapsed < 12) p = 60 + ((elapsed - 6) / 6) * 20;
      else p = 80 + Math.min((elapsed - 12) / 20, 1) * 15;
      setGeneratingProgress(Math.min(Math.round(p), 95));
    }, 250);
    return () => { clearInterval(tipTimer); clearInterval(progressTimer); };
  }, [pageState, sessionData?.mode, sessionData?.scenarioSlug]);

  if (pageState === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50/60 via-[#FAFAFA] to-violet-50/60 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-[320px] h-[320px] bg-pink-100/30 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-[280px] h-[280px] bg-violet-100/30 rounded-full blur-3xl" />
        </div>
        <motion.div
          className="relative z-10 text-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/90 shadow-lg shadow-pink-100/40 mb-4"
            animate={{ boxShadow: ["0 8px 32px -8px rgba(236,72,153,0.2)", "0 12px 40px -8px rgba(236,72,153,0.3)", "0 8px 32px -8px rgba(236,72,153,0.2)"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Loader2 className="w-7 h-7 text-pink-500 animate-spin" />
          </motion.div>
          <p className="text-gray-800 font-medium mb-1">加载中...</p>
          <p className="text-sm text-gray-500">正在准备你的报告</p>
        </motion.div>
      </div>
    );
  }

  if (pageState === "error" || error) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/">
            <Button className="rounded-full bg-gradient-to-r from-pink-500 to-violet-500 text-white">
              返回首页
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (pageState === "generating") {
    const generatingTipsList =
      sessionData?.mode === "SCENARIO" || sessionData?.scenarioSlug
        ? SCENARIO_GENERATING_TIPS
        : GENERATING_TIPS;
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50/80 via-[#FAFAFA] to-violet-50/80 flex items-center justify-center px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 w-[320px] h-[320px] bg-pink-200/30 rounded-full blur-3xl"
            animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-[280px] h-[280px] bg-violet-200/30 rounded-full blur-3xl"
            animate={{ opacity: [0.5, 0.8, 0.5], scale: [1.1, 1, 1.1] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <motion.div
          className="relative z-10 text-center max-w-sm"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/90 shadow-lg shadow-pink-100/50 mb-6"
            animate={{ boxShadow: ["0 10px 40px -10px rgba(236,72,153,0.25)", "0 10px 50px -5px rgba(236,72,153,0.35)", "0 10px 40px -10px rgba(236,72,153,0.25)"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
          </motion.div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">正在生成你们的专属报告</h1>
          <p className="text-gray-500 text-sm mb-4">
            {sessionData?.mode === "SCENARIO" || sessionData?.scenarioSlug
              ? "AI 正在结合所选现实场景撰写报告，完成后会自动跳转"
              : "AI 正在为你们分析契合度，会自动跳转"}
          </p>
          <div className="w-full max-w-[260px] mx-auto mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-400">生成进度</span>
              <span className="text-xs font-medium tabular-nums" style={{ color: "#EC4899" }}>
                {generatingProgress}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/60 overflow-hidden shadow-inner">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #EC4899, #8B5CF6)" }}
                initial={{ width: "0%" }}
                animate={{ width: `${generatingProgress}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>
          <div className="min-h-[28px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={generatingTipIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="text-gray-500 text-sm"
              >
                {generatingTipsList[generatingTipIndex % generatingTipsList.length]}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    );
  }

  if (pageState === "waiting") {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-pink-100/40 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-violet-100/40 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12">
          <div className="w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center mb-6"
            >
              <motion.div
                className="w-20 h-20 rounded-full bg-pink-50 flex items-center justify-center shadow-lg shadow-pink-100/40"
                animate={{ scale: [1, 1.03, 1], boxShadow: ["0 10px 40px -10px rgba(236,72,153,0.15)", "0 14px 48px -10px rgba(236,72,153,0.25)", "0 10px 40px -10px rgba(236,72,153,0.15)"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Heart className="w-10 h-10 text-pink-500 fill-pink-500" />
              </motion.div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl font-bold text-gray-800 text-center mb-2"
            >
              答题完成！
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-center text-gray-500 mb-2"
            >
              对方完成后自动生成配对报告
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-center text-gray-400 text-sm mb-10"
            >
              把邀请码或链接发给 TA，一起解锁专属报告吧
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="rounded-2xl bg-gradient-to-br from-pink-500 to-violet-500 p-6 sm:p-8 shadow-xl shadow-pink-500/15 mb-6"
            >
              <p className="text-center text-white/70 text-sm mb-3">你的邀请码</p>
              <p className="text-center text-white text-[32px] font-bold tracking-[0.3em] leading-none mb-6 font-mono">
                {inviteCode || "—"}
              </p>
              <Button
                type="button"
                onClick={handleCopyCode}
                disabled={!inviteCode}
                className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/20 rounded-xl py-5"
              >
                {codeCopied ? (
                  <>
                    <Check className="w-4.5 h-4.5 mr-2" />
                    已复制 ✓
                  </>
                ) : (
                  <>
                    <Copy className="w-4.5 h-4.5 mr-2" />
                    复制邀请码
                  </>
                )}
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <Link2 className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">邀请链接</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3 overflow-hidden">
                  <p className="text-sm text-gray-500 truncate">{inviteLink || "—"}</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopyLink}
                  disabled={!inviteLink}
                  className="flex-shrink-0 rounded-xl"
                >
                  {linkCopied ? (
                    <>
                      <Check className="w-4 h-4 mr-1.5" />
                      已复制 ✓
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1.5" />
                      复制链接
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="text-center"
            >
              <Link href="/">
                <Button
                  variant="ghost"
                  className="text-gray-400 hover:text-gray-600 rounded-full"
                >
                  返回首页
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Ready state: full report (score/dimensions/attachment/loveLanguage 立即展示，AI 报告渐进加载)
  if (pageState === "ready" && resultData && sessionData) {
    return (
      <ReadyReport
        sessionId={sessionId}
        resultData={resultData}
        sessionData={sessionData}
        reportPollTimeout={reportPollTimeout}
        onRefetchResult={refetchResultCb}
      />
    );
  }

  // 避免白屏：ready 但数据未就绪、或未匹配到上述状态时显示加载
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-pink-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">加载中...</p>
      </div>
    </div>
  );
}

function ReadyReport({
  sessionId,
  resultData,
  sessionData,
  reportPollTimeout = false,
  onRefetchResult,
}: {
  sessionId: string;
  resultData: ResultData;
  sessionData: SessionStatus;
  reportPollTimeout?: boolean;
  onRefetchResult?: () => void | Promise<void>;
}) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [posterSaving, setPosterSaving] = useState(false);
  const [unlocked, setUnlocked] = useState(resultData.purchasedTier === "PREMIUM");

  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [payLoadingMethod, setPayLoadingMethod] = useState<"WECHAT" | "ALIPAY" | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"WECHAT" | "ALIPAY">("WECHAT");
  const [payResult, setPayResult] = useState<{
    type: string;
    orderId?: string;
    code_url?: string;
    h5_url?: string;
    form_html?: string;
    pay_url?: string;
    paymentMethod?: string;
  } | null>(null);
  const [payError, setPayError] = useState<string | null>(null);
  const [jsapiChecking, setJsapiChecking] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [wechatCopied, setWechatCopied] = useState(false);

  const [promoExpanded, setPromoExpanded] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promoVerifyLoading, setPromoVerifyLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoUnlockError, setPromoUnlockError] = useState<string | null>(null);
  const [promoUnlockStatusMessage, setPromoUnlockStatusMessage] = useState<string | null>(null);
  const [promoApplied, setPromoApplied] = useState<{
    code: string;
    finalAmountCents: number;
    message: string;
  } | null>(null);

  const isWechatBrowser = typeof navigator !== "undefined" && /MicroMessenger/i.test(navigator.userAgent);

  // 微信浏览器内：页面加载时静默 OAuth 获取 openid
  useEffect(() => {
    if (!isWechatBrowser) return;
    const cookies = document.cookie.split(";").map((c) => c.trim());
    const hasOpenid = cookies.some((c) => c.startsWith("wx_openid="));
    if (hasOpenid) return;
    const currentPath = window.location.pathname + window.location.search;
    window.location.href = `/api/v1/wechat/oauth?redirect=${encodeURIComponent(currentPath)}`;
  }, [isWechatBrowser]);

  useEffect(() => {
    if (resultData.purchasedTier === "PREMIUM") {
      setUnlocked(true);
      setPayDialogOpen(false);
      setPayResult(null);
    }
  }, [resultData.purchasedTier]);

  useEffect(() => {
    if (!payDialogOpen || !sessionId || paySuccess) return;
    const checkPaid = async () => {
      try {
        const oid = payResult?.orderId;
        if (oid) {
          const checkRes = await fetch(`/api/v1/orders/${oid}/check`, { method: "POST" });
          const checkData = await checkRes.json();
          if (checkData?.status === "PAID") {
            setPaySuccess(true);
            await onRefetchResult?.();
            return;
          }
        }
        const res = await fetch(`/api/v1/result/${sessionId}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok || data?.result?.purchasedTier !== "PREMIUM") return;
        setPaySuccess(true);
        await onRefetchResult?.();
      } catch {
        // ignore
      }
    };
    checkPaid();
    const t = setInterval(checkPaid, 3000);
    return () => clearInterval(t);
  }, [payDialogOpen, sessionId, onRefetchResult, payResult?.orderId, paySuccess]);

  // 支付成功后预加载深度报告，就绪后再显示按钮
  useEffect(() => {
    if (!paySuccess || !sessionId) return;
    let cancelled = false;
    setLoadingReport(true);

    const preload = async () => {
      for (let i = 0; i < 20; i++) {
        if (cancelled) return;
        try {
          const res = await fetch(`/api/v1/result/${sessionId}`, { cache: "no-store" });
          const json = await res.json();
          if (json?.status === "ready" && json.result) {
            const pr = (json.result as Record<string, unknown>).premiumReport;
            if (pr && typeof pr === "object" && "deepAnalysis" in (pr as Record<string, unknown>)) {
              await onRefetchResult?.();
              if (!cancelled) setLoadingReport(false);
              return;
            }
          }
        } catch { /* ignore */ }
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      // 超时兜底：即使报告未就绪也放行
      await onRefetchResult?.();
      if (!cancelled) setLoadingReport(false);
    };
    preload();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paySuccess, sessionId]);

  const [premiumTipIndex, setPremiumTipIndex] = useState(0);
  const [basicReportTipIndex, setBasicReportTipIndex] = useState(0);
  const [reportProgress, setReportProgress] = useState(0);
  const [premiumReportProgress, setPremiumReportProgress] = useState(0);

  const isScenarioReport =
    sessionData.mode === "SCENARIO" || Boolean(resultData.scenarioSlug);

  const premiumGeneratingTips = isScenarioReport
    ? [
        "正在结合所选现实场景做深度分析…",
        "正在撰写贴合该场景的互动演练…",
        "正在生成围绕本主题的四周练习…",
        "正在整理场景化的沟通话术…",
        "快好了，深度报告即将呈现…",
      ]
    : [
        "AI 正在分析你们的依恋模式...",
        "正在模拟你们的日常互动场景...",
        "正在生成 4 周成长计划...",
        "正在撰写专属沟通指南...",
        "快好了，深度报告即将呈现...",
      ];

  const basicReportAnalysisTips = isScenarioReport
    ? [
        "正在汇总你们在现实场景中的打分…",
        "正在对照沟通、价值观、冲突处理等维度…",
        "正在撰写贴合该场景的建议…",
        "正在整理可执行的小行动…",
        "即将完成…",
      ]
    : [
        "正在分析你们的依恋类型…",
        "正在解读爱的语言匹配…",
        "正在撰写关系建议…",
        "正在整理行动清单…",
        "即将完成…",
      ];

  const [shareLinkCopied, setShareLinkCopied] = useState(false);


  const getWxOpenid = (): string | undefined => {
    const match = document.cookie.match(/(?:^|;\s*)wx_openid=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : undefined;
  };

  const invokeJsapiPay = (params: {
    appId: string;
    timeStamp: string;
    nonceStr: string;
    package: string;
    signType: string;
    paySign: string;
  }): Promise<{ ok: boolean; errMsg?: string }> => {
    return new Promise((resolve) => {
      const invoke = () => {
        const bridge = (window as unknown as Record<string, unknown>).WeixinJSBridge as
          | { invoke: (api: string, params: Record<string, string>, cb: (res: { err_msg: string }) => void) => void }
          | undefined;
        if (!bridge) {
          resolve({ ok: false, errMsg: "WeixinJSBridge 不可用" });
          return;
        }
        try {
          bridge.invoke("getBrandWCPayRequest", {
            appId: params.appId,
            timeStamp: params.timeStamp,
            nonceStr: params.nonceStr,
            package: params.package,
            signType: params.signType,
            paySign: params.paySign,
          }, (res) => {
            if (res.err_msg === "get_brand_wcpay_request:ok") {
              resolve({ ok: true });
            } else {
              resolve({ ok: false, errMsg: res.err_msg });
            }
          });
        } catch (e) {
          resolve({ ok: false, errMsg: `调用异常: ${e instanceof Error ? e.message : String(e)}` });
        }
      };
      if ((window as unknown as Record<string, unknown>).WeixinJSBridge) {
        invoke();
      } else {
        document.addEventListener("WeixinJSBridgeReady", invoke, { once: true });
        setTimeout(() => resolve({ ok: false, errMsg: "WeixinJSBridge 加载超时" }), 8000);
      }
    });
  };

  const handleOpenPayDialog = () => {
    setPayError(null);
    setPaySuccess(false);
    setJsapiChecking(false);
    setPayDialogOpen(true);
    void handlePay("WECHAT");
  };

  const handlePromoVerify = async () => {
    const code = promoInput.trim();
    if (!code || !resultData.id) return;
    setPromoError(null);
    setPromoUnlockError(null);
    setPromoVerifyLoading(true);
    try {
      const res = await fetch("/api/v1/promo/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, resultId: resultData.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPromoError(data.message || "校验失败");
        setPromoApplied(null);
        return;
      }
      setPromoApplied({
        code,
        finalAmountCents: data.finalAmountCents ?? 990,
        message: data.message ?? "",
      });
    } catch {
      setPromoError("网络异常，请重试");
      setPromoApplied(null);
    } finally {
      setPromoVerifyLoading(false);
    }
  };

  const handleUnlockClick = async () => {
    if (promoApplied?.finalAmountCents === 0) {
      setPromoUnlockError(null);
      setPromoUnlockStatusMessage(null);
      setPayLoading(true);
      try {
        const res = await fetch("/api/v1/promo/unlock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: promoApplied.code, resultId: resultData.id }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) {
          setPromoUnlockStatusMessage("解锁成功，正在加载报告…");
          await onRefetchResult?.();
          return;
        }
        setPromoUnlockError(data.message || "解锁失败");
      } catch {
        setPromoUnlockError("解锁失败，请重试");
      } finally {
        setPayLoading(false);
      }
      return;
    }
    handleOpenPayDialog();
  };

  const handlePay = async (paymentMethod: "WECHAT" | "ALIPAY") => {
    const resultId = resultData.id;
    if (!resultId) {
      setPayError("无法获取结果信息，请刷新页面重试");
      return;
    }
    const deviceId = getDeviceId();
    if (!deviceId) {
      setPayError("无法识别设备，请刷新页面重试");
      return;
    }
    setPaymentMethod(paymentMethod);
    setPayError(null);
    setPayResult(null);
    setPayLoadingMethod(paymentMethod);
    setPayLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);
    try {
      const openid = isWechatBrowser ? getWxOpenid() : undefined;
      const res = await fetch("/api/v1/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resultId,
          sessionId,
          tier: "PREMIUM",
          paymentMethod,
          deviceId,
          ...(openid ? { openid } : {}),
          ...(promoApplied?.code && promoApplied.finalAmountCents > 0 ? { promoCode: promoApplied.code } : {}),
        }),
        signal: controller.signal,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.message === "该报告已解锁") {
          setPaySuccess(true);
          await onRefetchResult?.();
          return;
        }
        setPayError(data.message || "创建订单失败");
        return;
      }

      // JSAPI：微信内直接唤起支付
      if (data.type === "jsapi" && data.jsapiParams) {
        const oid = data.orderId as string;
        setPayResult({ type: "jsapi", orderId: oid, paymentMethod: "WECHAT" });
        const result = await invokeJsapiPay(data.jsapiParams);
        if (result.ok) {
          setJsapiChecking(true);
          // 支付成功，轮询查单直到确认 PAID
          for (let i = 0; i < 10; i++) {
            await new Promise((r) => setTimeout(r, 1500));
            try {
              const checkRes = await fetch(`/api/v1/orders/${oid}/check`, { method: "POST" });
              const checkData = await checkRes.json();
              if (checkData?.status === "PAID") {
                setJsapiChecking(false);
                setPaySuccess(true);
                await onRefetchResult?.();
                return;
              }
            } catch { /* continue polling */ }
          }
          // 10 次未确认，仍显示成功（回调可能延迟）
          setJsapiChecking(false);
          setPaySuccess(true);
          await onRefetchResult?.();
        } else {
          const msg = result.errMsg || "未知错误";
          if (msg.includes("cancel")) {
            setPayError("已取消支付");
          } else {
            setPayError(`微信支付未完成 (${msg})，如已支付请稍等片刻自动刷新`);
          }
        }
        return;
      }

      setPayResult({
        type: data.type,
        orderId: data.orderId,
        code_url: data.code_url,
        h5_url: data.h5_url,
        form_html: data.form_html,
        pay_url: data.pay_url,
        paymentMethod: data.paymentMethod,
      });
      if (!payDialogOpen) setPayDialogOpen(true);
      if (data.h5_url) {
        window.location.href = data.h5_url;
        return;
      }
      if (data.pay_url) {
        window.location.href = data.pay_url;
        return;
      }
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        setPayError("请求超时，请检查网络或稍后重试");
      } else {
        setPayError(e instanceof Error ? e.message : "网络错误，请重试");
      }
    } finally {
      clearTimeout(timeoutId);
      setPayLoading(false);
      setPayLoadingMethod(null);
    }
  };

  const premiumReport = resultData.premiumReport;
  const hasPremiumReport = premiumReport && premiumReport.deepAnalysis;

  const report = resultData.report;
  const hasReport =
    report && (report.overallAnalysis ?? report.attachmentAnalysis ?? report.loveLanguageAnalysis);

  useEffect(() => {
    if (!unlocked || hasPremiumReport) return;
    const t = setInterval(() => {
      setPremiumTipIndex((i) => (i + 1) % premiumGeneratingTips.length);
    }, 3000);
    return () => clearInterval(t);
  }, [unlocked, hasPremiumReport]);

  useEffect(() => {
    if (hasReport || reportPollTimeout) return;
    const t = setInterval(() => {
      setBasicReportTipIndex((i) => (i + 1) % basicReportAnalysisTips.length);
    }, 2500);
    return () => clearInterval(t);
  }, [hasReport, reportPollTimeout]);

  // 模拟进度条：指数衰减，越接近完成越慢，报告就绪后跳到 100%
  useEffect(() => {
    if (hasReport) {
      setReportProgress(100);
      return;
    }
    if (reportPollTimeout) return;
    setReportProgress(0);
    const start = Date.now();
    const t = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      // 0-3s: 快速到 40%；3-8s: 缓慢到 65%；8-15s: 爬到 82%；15s+: 最多 92%
      let p: number;
      if (elapsed < 3) {
        p = (elapsed / 3) * 40;
      } else if (elapsed < 8) {
        p = 40 + ((elapsed - 3) / 5) * 25;
      } else if (elapsed < 15) {
        p = 65 + ((elapsed - 8) / 7) * 17;
      } else {
        p = 82 + Math.min((elapsed - 15) / 30, 1) * 10;
      }
      setReportProgress(Math.min(Math.round(p), 92));
    }, 300);
    return () => clearInterval(t);
  }, [hasReport, reportPollTimeout]);

  // 深度报告生成中：模拟进度条（与基础报告节奏一致，就绪后随内容切换卸载）
  useEffect(() => {
    if (!unlocked) {
      setPremiumReportProgress(0);
      return;
    }
    if (hasPremiumReport) {
      setPremiumReportProgress(100);
      return;
    }
    setPremiumReportProgress(0);
    const start = Date.now();
    const t = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      let p: number;
      if (elapsed < 3) {
        p = (elapsed / 3) * 40;
      } else if (elapsed < 8) {
        p = 40 + ((elapsed - 3) / 5) * 25;
      } else if (elapsed < 15) {
        p = 65 + ((elapsed - 8) / 7) * 17;
      } else {
        p = 82 + Math.min((elapsed - 15) / 30, 1) * 10;
      }
      setPremiumReportProgress(Math.min(Math.round(p), 92));
    }, 300);
    return () => clearInterval(t);
  }, [unlocked, hasPremiumReport]);

  const handleOpenShareDialog = useCallback(() => {
    setShareDialogOpen(true);
    setShareLinkCopied(false);
  }, []);
  const stageLabel =
    sessionData.scenarioTitle != null && sessionData.scenarioTitle !== ""
      ? sessionData.scenarioTitle
      : STAGE_LABELS[sessionData.stage] ?? "热恋期";
  const scenarioSubtitleText =
    (resultData.scenarioSubtitle ?? sessionData.scenarioSubtitle ?? "").trim() || null;
  const scenarioReportTitle =
    (resultData.scenarioTitle ?? sessionData.scenarioTitle ?? stageLabel).trim();
  const nameA = sessionData.initiatorName ?? "TA";
  const nameB = sessionData.partnerName ?? "TA";

  const initiatorType = resultData.initiatorAttachmentType ?? "SECURE";
  const partnerType = resultData.partnerAttachmentType ?? "ANXIOUS";
  const styleA = ATTACHMENT_STYLES[initiatorType] ?? ATTACHMENT_STYLES.SECURE;
  const styleB = ATTACHMENT_STYLES[partnerType] ?? ATTACHMENT_STYLES.ANXIOUS;

  const pairKey = getAttachmentPairKey(initiatorType, partnerType);
  const fallbackPairInfo = ATTACHMENT_PAIR_INFO[pairKey] ?? {
    name: "独特配对",
    analysis: "你们有着独特的依恋组合，相互理解与沟通是关系成长的关键。",
  };
  const pairInfo = hasReport && report.attachmentAnalysis
    ? {
        name: report.attachmentAnalysis.title ?? fallbackPairInfo.name,
        analysis: report.attachmentAnalysis.description ?? fallbackPairInfo.analysis,
      }
    : fallbackPairInfo;

  const loveLangMatch =
    (resultData.initiatorLoveLanguageType ?? "") ===
    (resultData.partnerLoveLanguageType ?? "");
  const fallbackLoveLangAnalysis = loveLangMatch
    ? LOVE_LANGUAGE_ANALYSIS.MATCH
    : LOVE_LANGUAGE_ANALYSIS.COMPLEMENT;
  const loveLangAnalysis = hasReport && report.loveLanguageAnalysis?.description
    ? report.loveLanguageAnalysis.description
    : fallbackLoveLangAnalysis;

  const dimOrder = [
    "attachment",
    "loveLanguage",
    "communication",
    "values",
    "lifestyle",
    "conflict",
  ];
  const dims = resultData.dimensions as Record<string, number>;
  const dimensions = dimOrder.map((key) => ({
    key,
    name: DIMENSION_NAMES[key] ?? key,
    // 通用版返回 personality，分阶段返回 lifestyle，统一在「生活习惯」下展示
    score: dims[key] ?? (key === "lifestyle" ? dims["personality"] : undefined) ?? 0,
  }));

  const scenarioSlugResolved =
    resultData.scenarioSlug ?? sessionData.scenarioSlug ?? null;
  const scenarioDimCounts = getScenarioDimensionQuestionCounts(scenarioSlugResolved);
  const scenarioDef = getScenarioBySlug(scenarioSlugResolved);

  const scoreCounter = useCounter(resultData.overallScore, 1600);
  const ratingLabel = getCompatibilityLevel(resultData.overallScore);

  const saveCouplePoster = useCallback(async () => {
    const el = document.getElementById("couple-share-poster");
    if (!el) return;
    setPosterSaving(true);
    try {
      if (typeof document !== "undefined" && document.fonts?.ready) {
        await document.fonts.ready;
      }
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });

      const dpr =
        typeof window !== "undefined"
          ? Math.min(3, Math.max(2, window.devicePixelRatio || 2))
          : 2;
      const w = Math.round(el.offsetWidth);
      const h = Math.round(el.offsetHeight);

      const applyPosterFontTree = (root: HTMLElement) => {
        const walk = (node: HTMLElement) => {
          node.style.fontFamily = COUPLE_POSTER_FONT;
          node.style.fontVariantLigatures = "none";
          node.style.fontFeatureSettings = '"liga" 0';
          node.style.letterSpacing = "0px";
          for (let i = 0; i < node.children.length; i++) {
            const c = node.children[i];
            if (c instanceof HTMLElement) walk(c);
          }
        };
        walk(root);
      };

      let url: string;
      try {
        const { toPng } = await import("html-to-image");
        url = await toPng(el, {
          pixelRatio: dpr,
          cacheBust: true,
          width: w,
          height: h,
          backgroundColor: "transparent",
        });
      } catch (toPngErr) {
        console.warn(
          "couple poster: html-to-image failed, fallback html2canvas",
          toPngErr,
        );
        const { default: html2canvas } = await import("html2canvas-oklch");
        const canvas = await html2canvas(el, {
          scale: dpr,
          useCORS: true,
          logging: false,
          backgroundColor: null,
          foreignObjectRendering: false,
          scrollX: 0,
          scrollY: 0,
          width: w,
          height: h,
          onclone: (clonedDoc, clonedEl) => {
            const root =
              clonedEl instanceof HTMLElement
                ? clonedEl
                : clonedDoc.getElementById("couple-share-poster");
            if (!(root instanceof HTMLElement)) return;
            applyPosterFontTree(root);
          },
        });
        url = canvas.toDataURL("image/png");
      }

      const raw = isScenarioReport
        ? scenarioReportTitle || "场景测评"
        : stageLabel || "双人测评";
      const safe =
        raw.replace(/[/\\?%*:|"<>]/g, "_").trim().slice(0, 24) || "双人";
      const a = document.createElement("a");
      a.href = url;
      a.download = `合拍吗-${safe}-双人海报.png`;
      a.click();
    } catch (e) {
      console.error("couple poster export:", e);
    } finally {
      setPosterSaving(false);
    }
  }, [isScenarioReport, scenarioReportTitle, stageLabel]);

  useEffect(() => {
    const timer = setTimeout(() => scoreCounter.start(), 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="min-h-screen bg-[#FAFAFA]">
        <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 border-b border-white/20">
          <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Link href="/" className="flex flex-col items-start hover:opacity-90 transition-opacity shrink-0">
                <span className="font-[family-name:var(--font-brand)] text-xl font-bold bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] bg-clip-text text-transparent leading-tight tracking-widest">
                  合拍吗
                </span>
                <span className="font-[family-name:var(--font-brand)] text-[10px] text-gray-400 tracking-widest">
                  hepaima.com
                </span>
              </Link>
              {isScenarioReport ? (
                <span className="hidden sm:inline text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500/12 to-violet-500/12 text-pink-700 border border-pink-200/70 whitespace-nowrap">
                  现实场景测评
                </span>
              ) : null}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenShareDialog}
              className="shrink-0 gap-1.5 rounded-full border-pink-200 bg-white text-pink-700 hover:bg-pink-50 hover:text-pink-800"
            >
              <Share2 className="h-4 w-4 shrink-0" aria-hidden />
              <span className="text-sm font-medium">生成海报</span>
            </Button>
          </div>
        </nav>

        <main
          className={
            isScenarioReport
              ? "max-w-[1000px] mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-5"
              : "max-w-[1000px] mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-4"
          }
        >
          {isScenarioReport ? (
            <ScrollCard delay={0}>
              <div className="relative rounded-[28px] overflow-hidden shadow-2xl shadow-pink-500/20 bg-gradient-to-b from-[#5B4FD9] via-[#8B5CF6] to-[#EC4899] px-6 pt-8 pb-7 sm:px-10 sm:pt-10 sm:pb-9 text-center isolate">
                <div
                  className="pointer-events-none absolute inset-0 opacity-50"
                  style={{
                    background:
                      "radial-gradient(ellipse 80% 55% at 50% -10%, rgba(255,255,255,0.35), transparent), radial-gradient(circle at 100% 100%, rgba(255,255,255,0.12), transparent 50%)",
                  }}
                  aria-hidden
                />
                <div className="relative z-10 flex flex-col items-center max-w-md mx-auto">
                  <p className="font-[family-name:var(--font-brand)] text-[11px] text-white/50 mb-4">
                    合拍吗 · 现实场景
                  </p>
                  <h1 className="text-lg sm:text-xl font-bold text-white leading-tight tracking-tight px-1">
                    {scenarioReportTitle}
                  </h1>
                  {scenarioSubtitleText ? (
                    <p className="mt-2 text-xs sm:text-sm text-white/70 line-clamp-2 leading-snug px-2">
                      {scenarioSubtitleText}
                    </p>
                  ) : null}
                  <p className="mt-5 text-[15px] text-white/90 font-medium">
                    {nameA}
                    <Heart className="inline w-3.5 h-3.5 mx-1.5 fill-white/90 text-white/90 align-middle" />
                    {nameB}
                  </p>
                  <p
                    className="mt-6 text-[4.5rem] sm:text-[5.5rem] font-black text-white leading-none tabular-nums tracking-tight drop-shadow-sm"
                    style={{ textShadow: "0 4px 24px rgba(0,0,0,0.12)" }}
                  >
                    {scoreCounter.count}
                    <span className="text-[40%] font-bold align-super ml-0.5">%</span>
                  </p>
                  <p className="mt-3 text-lg sm:text-xl font-semibold text-white/95">{ratingLabel}</p>
                  <div className="mt-8 pt-5 w-full border-t border-white/20">
                    <p className="text-[10px] sm:text-[11px] text-white/45 tracking-widest">场景合拍指数 · hepaima.com</p>
                  </div>
                </div>
              </div>
            </ScrollCard>
          ) : (
            <ScrollCard delay={0}>
              <div className="relative rounded-2xl bg-gradient-to-br from-[#EC4899] to-[#8B5CF6] p-6 sm:p-8 text-center overflow-hidden shadow-xl shadow-pink-500/10">
                <div className="absolute -top-16 -left-16 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
                <div className="relative z-10">
                  <p className="text-white/80 text-lg mb-6">
                    {nameA} <Heart className="inline w-4 h-4 mx-1 fill-white/80" /> {nameB}
                  </p>
                  <p className="text-[56px] sm:text-[64px] font-bold text-white leading-none mb-2">
                    {scoreCounter.count}
                    <span className="text-3xl sm:text-4xl">%</span>
                  </p>
                  <p className="text-white/90 text-lg font-medium mb-5">{ratingLabel}</p>
                  <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 px-3 py-1 text-sm">
                    {stageLabel}
                  </Badge>
                </div>
              </div>
            </ScrollCard>
          )}

          {isScenarioReport && scenarioDef ? (
            <ScrollCard delay={0.04}>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-50 to-violet-50 flex items-center justify-center border border-pink-100/80 shrink-0">
                    <ClipboardList className="w-5 h-5 text-[#8B5CF6]" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-gray-800">本题场上焦点</h2>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      {scenarioDef.subtitle} · 共 {scenarioDef.questions.length}{" "}
                      道陈述，得分反映你们在这些具体情境上的合拍程度（非泛化性格标签）。
                    </p>
                  </div>
                </div>
                <p className="text-xs text-pink-700/90 font-medium mb-3">
                  下列文字即答题时见到的题干原文，便于你对照报告里的维度得分。
                </p>
                <ol className="space-y-2.5 text-sm text-gray-700 leading-relaxed list-decimal pl-4 marker:text-pink-500 marker:font-semibold">
                  {scenarioDef.questions.map((q) => (
                    <li key={q.id} className="pl-1">
                      {q.text}
                    </li>
                  ))}
                </ol>
              </div>
            </ScrollCard>
          ) : null}

          {isScenarioReport ? (
            <ScrollCard delay={0.06}>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center">
                    <BarChart3 className="w-4.5 h-4.5 text-[#EC4899]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">六维题脉</h2>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                      每条得分来自上表中标为该维度的题目；「本题未测」表示本专题未包含该维陈述，条上为占位勿解读。
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-5 mt-5">
                  {dimOrder.map((dimKey, i) => {
                    const dimName = DIMENSION_NAMES[dimKey] ?? dimKey;
                    const score =
                      dims[dimKey] ??
                      (dimKey === "lifestyle" ? dims["personality"] : undefined) ??
                      0;
                    const nInScenario =
                      scenarioDimCounts?.[dimKey as keyof NonNullable<typeof scenarioDimCounts>] ?? 0;
                    const measured = nInScenario > 0;
                    const stems = getScenarioDimensionStems(scenarioSlugResolved, dimKey as ScenarioDimension);
                    const stemsShow = stems.slice(0, 2);
                    const stemsMore = stems.length - stemsShow.length;
                    return (
                      <div
                        key={dimKey}
                        className={measured ? "" : "opacity-75"}
                      >
                        <div className="flex items-center justify-between mb-1.5 gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`text-sm truncate ${measured ? "text-gray-700 font-medium" : "text-gray-400"}`}
                            >
                              {dimName}
                            </span>
                            {!measured ? (
                              <Badge
                                variant="secondary"
                                className="shrink-0 text-[10px] font-normal px-1.5 py-0 h-5 bg-gray-100 text-gray-500 border-gray-200"
                              >
                                本题未测
                              </Badge>
                            ) : null}
                          </div>
                          {measured ? (
                            <span className="text-sm font-semibold text-gray-800 tabular-nums shrink-0">
                              {score}%
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400 shrink-0 tabular-nums">—</span>
                          )}
                        </div>
                        {measured ? (
                          <AnimatedBar score={score} delay={i * 0.08} />
                        ) : (
                          <div
                            className="h-2 w-full rounded-full bg-gray-100 border border-dashed border-gray-200"
                            aria-hidden
                          />
                        )}
                        {measured && stemsShow.length > 0 ? (
                          <ul className="mt-2.5 space-y-1.5 pl-0">
                            {stemsShow.map((s) => (
                              <li
                                key={s}
                                className="text-[11px] sm:text-xs text-gray-500 leading-relaxed flex gap-2"
                              >
                                <span className="text-pink-400 shrink-0 font-bold" aria-hidden>
                                  ·
                                </span>
                                <span>{s}</span>
                              </li>
                            ))}
                            {stemsMore > 0 ? (
                              <li className="text-[11px] text-violet-600/90 pl-4">
                                另有 {stemsMore} 题同属该维，略
                              </li>
                            ) : null}
                          </ul>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </ScrollCard>
          ) : null}

          {!isScenarioReport ? (
          <>
          <ScrollCard delay={0.05}>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center">
                  <Heart className="w-4.5 h-4.5 text-[#EC4899]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">依恋类型配对</h2>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-2">{nameA}</p>
                  <span
                    className="inline-block px-3 py-1.5 rounded-lg text-sm font-semibold"
                    style={{ backgroundColor: styleA.bg, color: styleA.text }}
                  >
                    {resultData.initiatorAttachment}
                  </span>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-2">{nameB}</p>
                  <span
                    className="inline-block px-3 py-1.5 rounded-lg text-sm font-semibold"
                    style={{ backgroundColor: styleB.bg, color: styleB.text }}
                  >
                    {resultData.partnerAttachment}
                  </span>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  配对类型：{pairInfo.name}
                </p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {pairInfo.analysis}
                </p>
                {report?.attachmentAnalysis?.tips && report.attachmentAnalysis.tips.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">建议</p>
                    <ul className="space-y-2">
                      {report.attachmentAnalysis.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </ScrollCard>

          <ScrollCard delay={0.05}>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center">
                  <MessageCircle className="w-4.5 h-4.5 text-[#EC4899]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    {report?.loveLanguageAnalysis?.title ?? "爱的语言"}
                  </h2>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-2">{nameA}</p>
                  <span className="inline-block px-3 py-1.5 rounded-lg text-sm font-semibold bg-pink-100 text-pink-700">
                    {resultData.initiatorLoveLanguage}
                  </span>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-2">{nameB}</p>
                  <span className="inline-block px-3 py-1.5 rounded-lg text-sm font-semibold bg-pink-100 text-pink-700">
                    {resultData.partnerLoveLanguage}
                  </span>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-500 leading-relaxed">
                  {loveLangAnalysis}
                </p>
                {report?.loveLanguageAnalysis?.tips && report.loveLanguageAnalysis.tips.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">建议</p>
                    <ul className="space-y-2">
                      {report.loveLanguageAnalysis.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </ScrollCard>

          <ScrollCard delay={0.05}>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center">
                    <BarChart3 className="w-4.5 h-4.5 text-[#EC4899]" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800">六维契合度</h2>
                </div>
                <div className="flex flex-col gap-4">
                  {dimensions.map((dim, i) => (
                    <div key={dim.key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-gray-600">{dim.name}</span>
                        <span className="text-sm font-semibold text-gray-800">
                          {dim.score}%
                        </span>
                      </div>
                      <AnimatedBar score={dim.score} delay={i * 0.1} />
                    </div>
                  ))}
                </div>
              </div>
            </ScrollCard>
          </>
          ) : null}

          {hasReport ? (
            <motion.div
              className={isScenarioReport ? "flex flex-col gap-5" : "flex flex-col gap-4"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {/* 阶段：契合解读；场景：AI 场景复盘（与阶段不同的内容版块顺序见上方「场上焦点」「六维题脉」） */}
              <div className="rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm border border-pink-100/50 shadow-sm">
                <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-3 flex items-center gap-3">
                  <div
                    className="w-1 h-8 rounded-full flex-shrink-0"
                    style={{ background: "linear-gradient(180deg, #EC4899, #8B5CF6)" }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                        {isScenarioReport ? "AI 场景复盘" : "契合解读"}
                      </h2>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                      {isScenarioReport
                        ? "结合上方真实题干与六维得分（仅本题已测维度），解读你们在这个生活现场里的合拍与摩擦；下滑可解锁场景深度包"
                        : resultData.scenarioTitle
                          ? "简版 AI 解读（专题量表）；下滑可解锁与完整测评相同的深度报告"
                          : "基于你们的答题数据生成的契合分析"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 px-5 sm:px-6 pb-5 sm:pb-6">
              <ScrollCard delay={0.05}>
                <div className="rounded-xl bg-gradient-to-br from-pink-50/60 to-violet-50/40 p-4 sm:p-5">
                  <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#EC4899]" />
                    {isScenarioReport ? "现场整体节奏" : "整体分析"}
                  </p>
                  {report?.overallAnalysis != null ? (
                    typeof report.overallAnalysis === "string" ? (
                      (report.overallAnalysis as string).trim() ? (
                        <div style={{ fontSize: 15, lineHeight: 1.8, color: "#444444" }}>
                          {(report.overallAnalysis as string).trim().split("\n").filter(Boolean).map((para, i, arr) => (
                            <p key={i} style={{ marginBottom: i < arr.length - 1 ? 12 : 0 }}>{para}</p>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: 15, lineHeight: 1.8, color: "#444444" }}>AI 正在分析中...</p>
                      )
                    ) : (
                      (() => {
                        const oa = report.overallAnalysis as OverallAnalysisObject;
                        return (
                          <>
                            <p style={{ fontSize: 15, lineHeight: 1.7, color: "#444444", marginBottom: 16 }}>{oa.summary}</p>
                            <div className="space-y-2.5" style={{ marginBottom: 0 }}>
                              {oa.highlights?.map((h, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.35, delay: i * 0.1 }}
                                  style={{
                                    background: "#FAFAFA",
                                    borderRadius: 10,
                                    padding: "14px 16px",
                                  }}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-base">{h.emoji}</span>
                                    <span style={{ fontSize: 16, fontWeight: 600, color: "#222222" }}>{h.title}</span>
                                  </div>
                                  <p style={{ fontSize: 14, color: "#666666", lineHeight: 1.6, marginTop: 4 }}>{h.detail}</p>
                                </motion.div>
                              ))}
                            </div>
                            {oa.advice ? (
                              <p style={{ marginTop: 16, fontSize: 15, color: "#EC4899", display: "flex", alignItems: "center", gap: 6 }}>
                                <Heart className="w-4 h-4 flex-shrink-0 fill-[#EC4899]" style={{ color: "#EC4899" }} />
                                {oa.advice}
                              </p>
                            ) : null}
                          </>
                        );
                      })()
                    )
                  ) : (
                    <p style={{ fontSize: 15, lineHeight: 1.8, color: "#444444" }}>AI 正在分析中...</p>
                  )}
                </div>
              </ScrollCard>

              {((report?.strengths && report.strengths.length > 0) || (report?.challenges && report.challenges.length > 0)) && (
                <ScrollCard delay={0.05}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {report?.strengths && report.strengths.length > 0 && (
                      <div className="rounded-xl bg-emerald-50/70 p-4">
                        <p className="text-sm font-semibold text-emerald-700 mb-3 flex items-center gap-1.5">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          {isScenarioReport ? "场上默契时刻" : "你们的优势"}
                        </p>
                        <ul className="space-y-2">
                          {report.strengths.map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-600 leading-relaxed">
                              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-emerald-500" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {report?.challenges && report.challenges.length > 0 && (
                      <div className="rounded-xl bg-amber-50/70 p-4">
                        <p className="text-sm font-semibold text-amber-700 mb-3 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {isScenarioReport ? "容易卡住的点" : "需要注意"}
                        </p>
                        <ul className="space-y-2">
                          {report.challenges.map((c, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-600 leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 bg-amber-400" />
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </ScrollCard>
              )}

              {report?.actionItems && report.actionItems.length > 0 && (
                <ScrollCard delay={0.05}>
                  <div className="rounded-xl bg-violet-50/50 p-4 sm:p-5">
                    <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-[#8B5CF6]" />
                      {isScenarioReport ? "下次可以试一小步" : "成长任务"}
                    </p>
                    <div className="space-y-2.5">
                      {report.actionItems.map((item, i) => (
                        <div key={i} className="flex items-start gap-3 bg-white/80 rounded-lg p-3">
                          <span
                            className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                            style={{ background: "linear-gradient(135deg, #EC4899, #8B5CF6)" }}
                          >
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                            <p className="text-xs text-gray-500 leading-relaxed mt-1">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollCard>
              )}

              <div className="rounded-lg bg-gray-50 px-3.5 py-2.5 flex items-start gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] leading-relaxed text-gray-400">
                  {isScenarioReport
                    ? "简版分析结合本专题得分与 AI 生成，解读仅围绕本题已测维度；仅供自我觉察与沟通参考，不构成专业心理咨询、医疗或法律建议。"
                    : "本报告基于问卷结果与 AI 分析生成，仅供自我觉察和关系参考，不构成专业心理咨询、医疗或法律建议。"}
                </p>
              </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm border border-pink-100/50 shadow-sm">
              <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-3 flex items-center gap-3">
                <div
                  className="w-1 h-8 rounded-full flex-shrink-0"
                  style={{ background: "linear-gradient(180deg, #EC4899, #8B5CF6)" }}
                />
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    {isScenarioReport ? "AI 场景复盘" : "契合解读"}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {isScenarioReport
                      ? "正在根据本专题题干与作答生成简版复盘…"
                      : "基于你们的答题数据生成的契合分析"}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 px-5 sm:px-6 pb-5 sm:pb-6">
              <ScrollCard delay={0.05}>
                <div className="rounded-xl bg-gradient-to-br from-pink-50/60 to-violet-50/40 p-4 sm:p-5">
                  {reportPollTimeout ? (
                    <p className="text-sm text-gray-500 py-2">
                      报告生成较慢，请稍后
                      <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="text-[#EC4899] font-medium underline underline-offset-2 hover:text-[#DB2777] focus:outline-none focus:ring-2 focus:ring-pink-300 rounded"
                      >
                        刷新页面
                      </button>
                      查看
                    </p>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#EC4899]" />
                          AI 正在生成报告
                        </p>
                        <span className="text-xs font-medium tabular-nums" style={{ color: "#EC4899" }}>
                          {reportProgress}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-pink-100/80 overflow-hidden mb-3">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: "linear-gradient(90deg, #EC4899, #8B5CF6)" }}
                          initial={{ width: "0%" }}
                          animate={{ width: `${reportProgress}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Loader2 className="w-4 h-4 text-pink-400 animate-spin flex-shrink-0" />
                        <div className="min-h-[20px] flex items-center flex-1">
                          <AnimatePresence mode="wait">
                            <motion.p
                              key={basicReportTipIndex}
                              initial={{ opacity: 0, x: 6 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -6 }}
                              transition={{ duration: 0.3 }}
                              className="text-xs text-gray-500"
                              style={{ margin: 0 }}
                            >
                              {basicReportAnalysisTips[basicReportTipIndex]}
                            </motion.p>
                          </AnimatePresence>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </ScrollCard>
              {!reportPollTimeout && (
                <>
                  <ReportCardSkeleton />
                  <ReportCardSkeleton />
                  <ReportCardSkeleton />
                </>
              )}
              </div>
            </div>
          )}

          {!unlocked ? (
              <ScrollCard delay={0.05} className="mt-6">
                <div
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm mx-auto text-center"
                  style={{ padding: 32, maxWidth: 400 }}
                >
                  <Lock className="w-12 h-12 mx-auto mb-4" style={{ color: "#EC4899" }} />
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {isScenarioReport ? "解锁场景深度包" : "解锁深度报告"}
                  </h2>
                  <p className="text-sm mb-5" style={{ color: "#888888" }}>
                    {isScenarioReport
                      ? "在简版解读之上，把本专题练透、说清楚"
                      : "更深入的分析，更具体的建议"}
                  </p>
                  <ul className="space-y-3 mb-5 text-left inline-block">
                    {(isScenarioReport
                      ? [
                          "专题向长文：卡点、差异与可执行建议",
                          "3～5 则本主题情景演练（误解何来、怎么接话）",
                          "4 周只围绕本专题的微行动清单",
                          "给双方的沟通话术与冲突暂停步骤",
                        ]
                      : [
                          "你们最容易在哪些事上产生矛盾",
                          "基于你们性格的专属沟通方式",
                          "量身定制的 4 周关系提升计划",
                          "吵架后如何快速修复关系",
                        ]
                    ).map((item) => (
                      <li key={item} className="flex items-center gap-2" style={{ fontSize: 15, color: "#333333" }}>
                        <Check className="w-4 h-4 flex-shrink-0" style={{ color: "#10B981" }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                  {/* 优惠码入口 */}
                  <div className="mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        setPromoExpanded((e) => !e);
                        setPromoError(null);
                        setPromoUnlockError(null);
                        setPromoUnlockStatusMessage(null);
                        if (!promoExpanded) setPromoApplied(null);
                      }}
                      className={
                        promoExpanded
                          ? "text-xs text-gray-400 hover:text-gray-500 transition-colors"
                          : "text-sm font-semibold bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] bg-clip-text text-transparent hover:opacity-90 transition-opacity"
                      }
                    >
                      {promoExpanded ? "收起优惠码" : "有优惠码？"}
                    </button>
                    {!promoExpanded && (
                      <p className="mt-1 text-[10px] text-gray-400 max-w-[280px] mx-auto leading-relaxed">
                        关注「知我实验室」公众号，回复「优惠码」获取
                      </p>
                    )}
                    {promoExpanded && (
                      <>
                      <div className="mt-2 mb-2 text-[11px] sm:text-xs text-gray-500 leading-relaxed max-w-[280px] mx-auto text-center space-y-0.5">
                        <p className="m-0">
                          微信搜索「<span className="text-gray-700">知我实验室</span>」关注并回复「<span className="text-gray-700">优惠码</span>」
                        </p>
                        <p className="m-0 text-gray-600">会自动发送优惠码</p>
                      </div>
                      <div className="mt-2 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center max-w-[280px] mx-auto">
                        <input
                          type="text"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handlePromoVerify()}
                          placeholder="输入优惠码"
                          className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-[#EC4899] focus:ring-1 focus:ring-[#EC4899]/30 outline-none"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handlePromoVerify}
                          disabled={promoVerifyLoading || !promoInput.trim()}
                          className="rounded-lg border-[#EC4899] text-[#EC4899] hover:bg-pink-50 shrink-0"
                        >
                          {promoVerifyLoading ? (
                            <><Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />验证中</>
                          ) : (
                            "验证"
                          )}
                        </Button>
                      </div>
                      </>
                    )}
                    {promoError && (
                      <p className="mt-1.5 text-xs text-red-500 max-w-[280px] mx-auto">{promoError}</p>
                    )}
                    {promoApplied && !promoError && (
                      <p className="mt-1.5 text-xs text-emerald-600 max-w-[280px] mx-auto">{promoApplied.message}</p>
                    )}
                  </div>
                  <Button
                    onClick={handleUnlockClick}
                    disabled={payLoading}
                    className="w-full max-w-[280px] h-12 rounded-xl bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] hover:from-[#DB2777] hover:to-[#7C3AED] text-white text-base font-semibold shadow-lg shadow-pink-500/10 transition-transform duration-200 hover:scale-[1.02] mx-auto disabled:opacity-70"
                  >
                    {payLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" />{promoApplied?.finalAmountCents === 0 ? "正在解锁..." : "正在发起支付..."}</>
                    ) : promoApplied?.finalAmountCents === 0 ? (
                      <>¥0 立即解锁</>
                    ) : promoApplied && promoApplied.finalAmountCents < 990 ? (
                      <><span className="line-through opacity-60 text-sm mr-1.5">¥9.90</span>¥{(promoApplied.finalAmountCents / 100).toFixed(2)} 立即解锁</>
                    ) : (
                      <><span className="line-through opacity-60 text-sm mr-1.5">¥29.90</span>¥9.90 立即解锁</>
                    )}
                  </Button>
                  <p className="mt-3 text-[11px] sm:text-xs leading-relaxed text-gray-400 max-w-[280px] mx-auto">
                    支持微信与支付宝；支付完成后返回本页即可查看。
                  </p>
                  {promoUnlockStatusMessage && (
                    <p className="mt-3 flex items-center justify-center gap-2 text-sm text-emerald-600 max-w-[280px] mx-auto">
                      <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                      {promoUnlockStatusMessage}
                    </p>
                  )}
                  {promoUnlockError && (
                    <p className="mt-2 text-xs text-red-500 max-w-[280px] mx-auto">{promoUnlockError}</p>
                  )}
                </div>
              </ScrollCard>
          ) : !hasPremiumReport ? (
            <ScrollCard delay={0.05}>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 sm:p-12 text-center">
                <div
                  className="w-8 h-8 mx-auto mb-6 rounded-full border-2 border-gray-100 animate-spin"
                  style={{
                    borderTopColor: "#EC4899",
                    borderRightColor: "#8B5CF6",
                    borderBottomColor: "#8B5CF6",
                    borderLeftColor: "#EC4899",
                  }}
                />
                <p className="text-base font-medium text-gray-800 mb-3" style={{ fontSize: 16 }}>
                  正在为你们生成深度报告...
                </p>
                <div className="w-full max-w-[200px] sm:max-w-[260px] mx-auto mb-5 flex items-center gap-2">
                  <div className="flex-1 min-w-0 h-1.5 rounded-full bg-pink-100/80 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: "linear-gradient(90deg, #EC4899, #8B5CF6)" }}
                      initial={{ width: "0%" }}
                      animate={{ width: `${premiumReportProgress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                  <span className="text-xs font-medium tabular-nums shrink-0" style={{ color: "#EC4899" }}>
                    {premiumReportProgress}%
                  </span>
                </div>
                <div className="min-h-[24px] flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={premiumTipIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35 }}
                      className="text-sm"
                      style={{ color: "#888888", fontSize: 14 }}
                    >
                      {premiumGeneratingTips[premiumTipIndex]}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>
            </ScrollCard>
          ) : (
            <motion.div
              className="flex flex-col gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {/* 深度解读版块（场景为「场景深度包」，与阶段标题不同；版块内容均为 PRO 深度，非简版六维） */}
              <div className="rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm border border-violet-100/50 shadow-sm">
                <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-3 flex items-center gap-3">
                  <div
                    className="w-1 h-8 rounded-full flex-shrink-0"
                    style={{ background: "linear-gradient(180deg, #8B5CF6, #EC4899)" }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                        {isScenarioReport ? "场景深度包" : "深度解读"}
                      </h2>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-violet-100 text-violet-600 tracking-wider">
                        PRO
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {isScenarioReport
                        ? "延伸分析、情景演练与专题练习；不等同完整依恋或关系阶段测评"
                        : "更深入的专业分析与个性化建议"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 px-5 sm:px-6 pb-5 sm:pb-6">
              <ScrollCard delay={0.05}>
                <div className="rounded-xl bg-gradient-to-br from-violet-50/60 to-pink-50/40 p-4 sm:p-5">
                  <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-[#8B5CF6]" />
                    {isScenarioReport ? "专题深度分析" : "深度分析"}
                  </p>
                  {typeof premiumReport.deepAnalysis === "object" && premiumReport.deepAnalysis !== null && "summary" in premiumReport.deepAnalysis ? (
                    <>
                      <p className="leading-relaxed text-gray-700 mb-6" style={{ fontSize: 15, lineHeight: 1.8 }}>
                        <ReportText text={premiumReport.deepAnalysis.summary} />
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {(premiumReport.deepAnalysis.highlights ?? []).map((h, i) => (
                          <div
                            key={i}
                            className="rounded-xl border border-pink-100 bg-gradient-to-br from-pink-50/80 to-violet-50/80 p-4"
                          >
                            <p className="text-sm font-semibold text-gray-800 mb-1.5">{h.title}</p>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              <ReportText text={h.detail} />
                            </p>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="leading-relaxed text-gray-700" style={{ fontSize: 15, lineHeight: 1.8 }}>
                      <ReportText text={typeof premiumReport.deepAnalysis === "string" ? premiumReport.deepAnalysis : ""} />
                    </p>
                  )}
                </div>
              </ScrollCard>

              {!isScenarioReport && premiumReport.attachmentDeep && (
                <ScrollCard delay={0.05}>
                  <div className="rounded-xl bg-pink-50/50 p-4 sm:p-5">
                    <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-[#EC4899]" />
                      {premiumReport.attachmentDeep.title ?? "依恋模式深度解析"}
                    </p>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                          <User className="w-4 h-4 text-pink-500 flex-shrink-0" />
                          {nameA}的依恋模式
                        </p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          <ReportText text={premiumReport.attachmentDeep.initiatorAnalysis ?? ""} />
                        </p>
                      </div>
                      <div className="border-t border-gray-100 pt-4">
                        <p className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                          <User className="w-4 h-4 text-pink-500 flex-shrink-0" />
                          {nameB}的依恋模式
                        </p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          <ReportText text={premiumReport.attachmentDeep.partnerAnalysis ?? ""} />
                        </p>
                      </div>
                      <div className="border-t border-gray-100 pt-4">
                        <p className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                          <Users className="w-4 h-4 text-violet-500 flex-shrink-0" />
                          你们的互动模式
                        </p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          <ReportText text={premiumReport.attachmentDeep.interactionPattern ?? ""} />
                        </p>
                      </div>
                      <div className="border-t border-gray-100 pt-4">
                        <p className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                          <Sprout className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          成长路径
                        </p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          <ReportText text={premiumReport.attachmentDeep.growthPath ?? ""} />
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollCard>
              )}

              {premiumReport.loveLanguageDeep && (
                <ScrollCard delay={0.05}>
                  <div className="rounded-xl bg-gradient-to-br from-pink-50/50 to-violet-50/30 p-4 sm:p-5">
                    <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <MessageCircleHeart className="w-4 h-4 text-[#EC4899]" />
                      {isScenarioReport
                        ? "本主题情景演练"
                        : (premiumReport.loveLanguageDeep.title ?? "爱的语言日常场景")}
                    </p>
                    {!isScenarioReport && (premiumReport.loveLanguageDeep.mismatchAnalysis ?? "").trim() ? (
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      <ReportText text={premiumReport.loveLanguageDeep.mismatchAnalysis ?? ""} />
                    </p>
                    ) : null}
                    <div className="space-y-3">
                      {premiumReport.loveLanguageDeep.dailyScenarios?.map((s, i) => (
                        <div key={i} className="rounded-lg p-4" style={{ backgroundColor: "#FDF2F8" }}>
                          <p className="text-sm text-gray-700 mb-2"><ReportText text={s.scenario} /></p>
                          <p className="text-sm mb-1">
                            <span className="text-gray-500">可能的误解：</span>
                            <span className="text-amber-600"><ReportText text={s.misunderstanding} /></span>
                          </p>
                          <p className="text-sm">
                            <span className="text-gray-500">更好的做法：</span>
                            <span className="text-emerald-600"><ReportText text={s.betterWay} /></span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollCard>
              )}

              {!isScenarioReport && premiumReport.relationshipForecast && (
                <ScrollCard delay={0.05}>
                  <div className="rounded-xl bg-violet-50/50 p-4 sm:p-5">
                    <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#8B5CF6]" />
                      {premiumReport.relationshipForecast.title ?? "关系趋势预测"}
                    </p>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-violet-500 flex-shrink-0" />
                          近期展望
                        </p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      <ReportText text={premiumReport.relationshipForecast.shortTerm ?? ""} />
                    </p>
                      </div>
                      <div className="border-t border-gray-100 pt-4">
                        <p className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-violet-500 flex-shrink-0" />
                          长期展望
                        </p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      <ReportText text={premiumReport.relationshipForecast.longTerm ?? ""} />
                    </p>
                      </div>
                      {premiumReport.relationshipForecast.turningPoints && premiumReport.relationshipForecast.turningPoints.length > 0 && (
                        <div className="border-t border-gray-100 pt-4">
                          <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-amber-500 flex-shrink-0" />
                            关键转折点
                          </p>
                          <ul className="space-y-2">
                            {premiumReport.relationshipForecast.turningPoints.map((t, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5 bg-pink-500" />
                                <span><ReportText text={t} /></span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollCard>
              )}

              {premiumReport.couplesTasks && premiumReport.couplesTasks.length > 0 && (
                <ScrollCard delay={0.05}>
                  <div className="rounded-xl bg-gradient-to-br from-pink-50/40 to-violet-50/40 p-4 sm:p-5">
                    <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#EC4899]" />
                      {isScenarioReport ? "4 周专题小步练习" : "4周成长任务"}
                    </p>
                    <div className="relative pl-1">
                      {/* 时间线连接线：贯穿所有周次 */}
                      {premiumReport.couplesTasks.length > 1 && (
                        <div
                          className="absolute top-6 bottom-6 left-[18px] w-1 -translate-x-1/2 rounded-full z-0"
                          style={{ background: "linear-gradient(180deg, #EC4899, #8B5CF6)" }}
                        />
                      )}
                      {premiumReport.couplesTasks.map((task, i) => (
                        <div key={i} className="relative z-10 flex gap-4 pb-8 last:pb-0">
                          <div
                            className="flex-shrink-0 w-9 flex justify-center"
                          >
                            <span
                              className="inline-flex justify-center items-center min-w-[2.25rem] px-2.5 py-1 rounded-lg text-white text-xs font-medium text-center tabular-nums"
                              style={{ background: "linear-gradient(135deg, #EC4899, #8B5CF6)" }}
                            >
                              {task.week}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 mb-1.5" style={{ fontSize: 16 }}><ReportText text={task.title} /></p>
                            <p className="text-sm text-gray-600 leading-relaxed mb-2" style={{ fontSize: 14 }}><ReportText text={task.description} /></p>
                            <p className="flex items-center gap-2 text-sm text-emerald-600">
                              <Target className="w-4 h-4 flex-shrink-0" />
                              <span><ReportText text={task.goal} /></span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollCard>
              )}

              {premiumReport.communicationGuide && (
                <ScrollCard delay={0.05}>
                  <div className="rounded-xl bg-violet-50/50 p-4 sm:p-5">
                    <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <MessagesSquare className="w-4 h-4 text-[#8B5CF6]" />
                      {premiumReport.communicationGuide.title ?? "专属沟通指南"}
                    </p>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 text-violet-500 flex-shrink-0" />
                          给{nameA}的建议
                        </p>
                        <CommunicationAdvice text={premiumReport.communicationGuide.forInitiator ?? ""} />
                      </div>
                      <div className="border-t border-gray-100 pt-4">
                        <p className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 text-violet-500 flex-shrink-0" />
                          给{nameB}的建议
                        </p>
                        <CommunicationAdvice text={premiumReport.communicationGuide.forPartner ?? ""} />
                      </div>
                      <div className="border-t border-gray-100 pt-4">
                        <p className="text-sm font-semibold text-amber-600 mb-1.5 flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0" />
                          冲突处理锦囊
                        </p>
                        {premiumReport.communicationGuide.conflictResolutionSteps &&
                         premiumReport.communicationGuide.conflictResolutionSteps.length > 0 ? (
                          (() => {
                            const rawSteps = premiumReport.communicationGuide.conflictResolutionSteps ?? [];
                            const cleanedSteps = rawSteps.map((s) =>
                              s.replace(/[，。；、]+$/u, "").trim(),
                            );
                            const hasChinesePrefix = cleanedSteps.some((s) =>
                              /^第[一二三四五六七八九十]+步/.test(s),
                            );
                            const ListTag = (hasChinesePrefix ? "ul" : "ol") as "ul" | "ol";
                            const listClassName = hasChinesePrefix
                              ? "space-y-2 text-sm text-gray-600 pl-4 border-l-2 border-amber-400"
                              : "space-y-2 text-sm text-gray-600 list-decimal list-inside pl-4 border-l-2 border-amber-400";

                            return (
                              <ListTag className={listClassName}>
                                {cleanedSteps.map((step, i) => (
                                  <li key={i} className="leading-relaxed">
                                    <ReportText text={step} />
                                  </li>
                                ))}
                              </ListTag>
                            );
                          })()
                        ) : (
                          (() => {
                            const raw = premiumReport.communicationGuide.conflictResolution ?? "";
                            const allSteps = raw
                              .split(/\s*\d+[.)]、?\s*/)
                              .map((s) => s.trim())
                              .filter(Boolean);
                            if (allSteps.length <= 1)
                              return (
                                <p className="text-sm text-gray-600 leading-relaxed pl-4">
                                  <ReportText text={raw} />
                                </p>
                              );
                            const intro =
                              allSteps[0] &&
                              (allSteps[0].includes("分四步") ||
                                allSteps[0].includes("分三步") ||
                                allSteps[0].includes("分几步"))
                                ? allSteps[0]
                                : null;
                            const steps = (intro ? allSteps.slice(1) : allSteps).map((s) =>
                              s.replace(/[，。；、]+$/u, "").trim(),
                            );
                            const hasChinesePrefix = steps.some((s) =>
                              /^第[一二三四五六七八九十]+步/.test(s),
                            );
                            const ListTag = (hasChinesePrefix ? "ul" : "ol") as "ul" | "ol";
                            const listClassName = hasChinesePrefix
                              ? "space-y-2 text-sm text-gray-600 pl-4 border-l-2 border-amber-400"
                              : "space-y-2 text-sm text-gray-600 list-decimal list-inside pl-4 border-l-2 border-amber-400";
                            return (
                              <>
                                {intro && (
                                  <p className="text-sm text-gray-700 font-semibold leading-relaxed mb-2">
                                    <ReportText text={intro} />
                                  </p>
                                )}
                                <ListTag className={listClassName}>
                                  {steps.map((step, i) => (
                                    <li key={i} className="leading-relaxed">
                                      <ReportText text={step} />
                                    </li>
                                  ))}
                                </ListTag>
                              </>
                            );
                          })()
                        )}
                      </div>
                    </div>
                  </div>
                </ScrollCard>
              )}
                </div>
              </div>
            </motion.div>
          )}

          <ScrollCard delay={0.05}>
            <div className="flex flex-row gap-3 pt-2 pb-4 mt-4">
              <Link href="/" className="min-w-0 flex-1">
                <Button
                  variant="outline"
                  className="w-full rounded-xl py-5 text-base text-gray-600 border-gray-200 hover:bg-gray-50 bg-transparent"
                >
                  <RotateCcw className="w-4.5 h-4.5 mr-2 shrink-0" />
                  重新测试
                </Button>
              </Link>
              <Button
                type="button"
                onClick={handleOpenShareDialog}
                className="min-w-0 flex-1 bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] hover:from-[#DB2777] hover:to-[#7C3AED] text-white rounded-xl py-5 text-base font-medium shadow-lg shadow-pink-500/10 transition-all duration-200"
              >
                <Share2 className="w-4.5 h-4.5 mr-2 shrink-0" />
                生成海报
              </Button>
            </div>
          </ScrollCard>

          <p className="mt-1 mb-6 text-center text-xs text-gray-400">
            对本次报告有疑问或建议？欢迎添加微信：
            <button
              type="button"
              onClick={() => {
                if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
                  navigator.clipboard
                    .writeText("SentioLab")
                    .then(() => {
                      setWechatCopied(true);
                      setTimeout(() => setWechatCopied(false), 2000);
                    })
                    .catch(() => {
                      /* ignore */
                    });
                }
              }}
              className="inline-flex items-center text-pink-500 underline underline-offset-2 cursor-pointer hover:text-pink-600 active:opacity-80"
            >
              SentioLab
            </button>{" "}
            <span className="text-[8px] text-gray-400 align-baseline">(点击复制)</span>
            {wechatCopied && (
              <span className="ml-1 text-[10px] text-emerald-500 align-baseline">已复制到粘贴板</span>
            )}{" "}
            进行反馈
          </p>
        </main>
      </div>

        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent className="sm:max-w-md gap-4">
            <DialogHeader className="text-left">
              <DialogTitle>分享海报</DialogTitle>
              <DialogDescription>
                保存后可分享给好友，或发送到朋友圈、小红书等社交平台。
              </DialogDescription>
            </DialogHeader>

            <div className="flex justify-center overflow-hidden rounded-xl bg-gray-100 p-2">
            <div
              id="couple-share-poster"
              className="relative w-[300px] h-[400px] rounded-[28px] p-6 text-white overflow-hidden shadow-lg"
              style={{
                fontFamily: COUPLE_POSTER_FONT,
                letterSpacing: 0,
                background: isScenarioReport
                  ? "linear-gradient(140deg, #4F46E5, #A855F7 45%, #EC4899)"
                  : "linear-gradient(140deg, #EC4899, #8B5CF6)",
              }}
            >
                {/* 渐变装饰层 */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-40"
                  style={{
                    background:
                      "radial-gradient(circle at 0% 0%, rgba(255,255,255,0.9), transparent 55%), radial-gradient(circle at 100% 100%, rgba(253,224,71,0.55), transparent 55%)",
                  }}
                  aria-hidden="true"
                />
                {/* 内容层 */}
                <div className="relative flex h-full flex-col justify-between">
                  {/* 顶部品牌区（无 AI 深度测评，重心靠左） */}
                  <div>
<span className="inline-block px-3 py-1 rounded-full bg-white text-sm font-bold tracking-wider shadow-sm">
                        <span className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">合拍吗</span>
                      </span>
                    <p className="mt-1.5 text-[11px] font-medium text-white/90">
                      {isScenarioReport ? "现实生活场景 · 情侣契合" : "超级准的情侣契合度测试"}
                    </p>
                  </div>

                  {/* 情侣名字与阶段标签同一行，标签紧挨名字、缩小 */}
                  <div className="flex items-center gap-2 mt-4">
                    <p className="text-2xl font-semibold leading-tight truncate min-w-0">
                      {nameA}{" "}
                      <Heart className="inline w-4 h-4 mx-1 fill-white text-white align-middle" />{" "}
                      {nameB}
                    </p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] shrink-0 max-w-[120px]">
                      {isScenarioReport ? (
                        <ClipboardList className="w-3 h-3 shrink-0 text-white" />
                      ) : (
                        <Heart className="w-3 h-3 fill-white text-white shrink-0" />
                      )}
                      <span className="truncate">{isScenarioReport ? scenarioReportTitle : stageLabel}</span>
                    </span>
                  </div>

                  {/* 中部核心内容，74% 与相互吸引左对齐、重心靠左 */}
                  <div className="space-y-3">
                    <div className="flex items-baseline gap-3 mt-1">
                      <p className="text-[60px] font-black leading-none tracking-tight drop-shadow-sm">
                        {resultData.overallScore}%
                      </p>
                      <p className="text-base font-medium">{ratingLabel}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px]">
                      {isScenarioReport ? (
                        <>
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                            <BarChart3 className="w-3.5 h-3.5 text-amber-100" />
                            <span>场景契合得分</span>
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                            <BarChart3 className="w-3.5 h-3.5 text-amber-100" />
                            <span>六维画像</span>
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                            <Brain className="w-3.5 h-3.5 text-amber-100" />
                            <span>深度解读</span>
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                            <TrendingUp className="w-3.5 h-3.5 text-amber-100" />
                            <span>关系趋势预测</span>
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                            <Calendar className="w-3.5 h-3.5 text-amber-100" />
                            <span>4周成长任务</span>
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                            <MessagesSquare className="w-3.5 h-3.5 text-amber-100" />
                            <span>专属沟通指南</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 底部引导文案 + 二维码（两行文案） */}
                  <div className="pt-3 mt-2 border-t border-white/25 flex items-end justify-between gap-3">
                    <div className="text-[11px] leading-relaxed text-white/85 space-y-1">
                      <p>{isScenarioReport ? "我们的场景测评报告出炉啦" : "我们的爱情密码已解锁"}</p>
                      <p>你们也来试试？</p>
                      <p className="font-semibold text-white">访问 hepaima.com</p>
                      <p className="text-white/70">
                        {isScenarioReport ? "选一个生活场景，测测你们有多合拍" : "测一测「你们有多合拍」？"}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <div className="rounded-2xl bg-white/90 p-1.5">
                        <Image
                          src="/qr-hepaima.png"
                          alt={isScenarioReport ? "扫码体验现实场景测评" : "扫码测测你们有多合拍"}
                          width={64}
                          height={64}
                          className="block rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShareDialogOpen(false)}
                className="rounded-full"
              >
                关闭
              </Button>
              <Button
                type="button"
                disabled={posterSaving}
                onClick={saveCouplePoster}
                className="rounded-full bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] text-white hover:from-[#DB2777] hover:to-[#7C3AED] inline-flex items-center gap-2"
              >
                {posterSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                    生成中…
                  </>
                ) : (
                  "保存图片"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={payDialogOpen} onOpenChange={(open) => {
          if (!open && paySuccess) {
            setPayDialogOpen(false);
            setPaySuccess(false);
            return;
          }
          setPayDialogOpen(open);
        }}>
          <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
            <DialogTitle className="sr-only">支付解锁</DialogTitle>
            {paySuccess && (
              <div className="px-6 py-10 flex flex-col items-center">
                {loadingReport ? (
                  <>
                    <Loader2 className="w-10 h-10 text-pink-500 animate-spin mb-3" />
                    <p className="text-base font-medium text-gray-800 mb-1">支付成功</p>
                    <p className="text-sm text-gray-500">正在加载深度报告，马上就好...</p>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-12 h-12 text-green-500 mb-3" />
                    <p className="text-base font-medium text-gray-800 mb-1">深度报告已就绪</p>
                    <p className="text-sm text-gray-500 mb-5">点击下方按钮立即查看</p>
                    <Button
                      className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8"
                      onClick={() => {
                        setPayDialogOpen(false);
                        setPaySuccess(false);
                        setLoadingReport(false);
                      }}
                    >
                      查看完整报告
                    </Button>
                  </>
                )}
              </div>
            )}
            {jsapiChecking && !paySuccess && (
              <div className="px-6 py-10 flex flex-col items-center">
                <Loader2 className="w-8 h-8 text-green-500 animate-spin mb-3" />
                <p className="text-base font-medium text-gray-800 mb-1">支付成功</p>
                <p className="text-sm text-gray-500">正在确认订单，请稍候...</p>
              </div>
            )}
            {!paySuccess && !jsapiChecking && payResult?.code_url && (
              <PaymentPanel
                paymentMethod={paymentMethod}
                onSelectMethod={(m) => {
                  void handlePay(m);
                }}
                payResult={payResult}
                loadingMethod={payLoadingMethod}
                price={promoApplied && promoApplied.finalAmountCents > 0 ? promoApplied.finalAmountCents / 100 : 9.9}
                originalPrice={promoApplied && promoApplied.finalAmountCents > 0 && promoApplied.finalAmountCents < 990 ? 9.9 : 29.9}
                orderId={payResult.orderId ?? resultData.id ?? ""}
                onRefresh={async () => {
                  const oid = payResult?.orderId;
                  if (oid) {
                    try {
                      const res = await fetch(`/api/v1/orders/${oid}/check`, { method: "POST" });
                      const data = await res.json();
                      if (data?.status === "PAID") {
                        setPaySuccess(true);
                        await onRefetchResult?.();
                        return;
                      }
                    } catch {
                      // 查单失败时回退到刷新结果
                    }
                  }
                  await onRefetchResult?.();
                }}
              />
            )}
            {!paySuccess && !jsapiChecking && !payResult?.code_url && !payError && (
              <div className="px-6 py-10 flex flex-col items-center">
                <Loader2 className="w-6 h-6 text-pink-500 animate-spin mb-3" />
                <p className="text-sm text-gray-600">正在为你生成支付二维码...</p>
              </div>
            )}
            {!paySuccess && !jsapiChecking && payError && (
              <div className="px-6 py-10 flex flex-col items-center">
                <p className="text-sm text-red-500 text-center mb-4">{payError}</p>
                <div className="flex gap-3 mb-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => {
                      setPayError(null);
                      void handlePay("WECHAT");
                    }}
                  >
                    重试微信支付
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => {
                      setPayError(null);
                      void handlePay("ALIPAY");
                    }}
                  >
                    切换支付宝
                  </Button>
                </div>
              </div>
            )}
            {payResult?.form_html && (
              <AlipayFormInjector html={payResult.form_html} />
            )}
          </DialogContent>
        </Dialog>
    </>
    );
}

interface PaymentPanelProps {
  paymentMethod: "WECHAT" | "ALIPAY";
  onSelectMethod: (m: "WECHAT" | "ALIPAY") => void;
  payResult: {
    type: string;
    orderId?: string;
    code_url?: string;
    paymentMethod?: string;
  };
  loadingMethod: "WECHAT" | "ALIPAY" | null;
  price: number;
  originalPrice?: number;
  orderId: string;
  onRefresh: () => void | Promise<void>;
}

function PaymentPanel({
  paymentMethod,
  onSelectMethod,
  payResult,
  loadingMethod,
  price,
  originalPrice,
  orderId,
  onRefresh,
}: PaymentPanelProps) {
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [refreshLoading, setRefreshLoading] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const isExpired = timeLeft <= 0;

  const methodConfig = {
    WECHAT: {
      color: "#07C160",
      bgLight: "#F0FDF4",
      name: "微信支付",
      iconSrc: "/icons/wechat.svg",
    },
    ALIPAY: {
      color: "#1677FF",
      bgLight: "#EFF6FF",
      name: "支付宝",
      iconSrc: "/icons/alipay.svg",
    },
  } as const;

  const current = methodConfig[paymentMethod];

  return (
    <div className="bg-gray-50">
      <main className="max-w-lg mx-auto px-4 py-5">
        {/* Order Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4">
          <div className="px-4 py-4 border-b border-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-medium text-gray-800 truncate">
                  合拍吗 · 深度报告解锁
                </h2>
                <p className="text-xs text-gray-400 mt-0.5 truncate">订单号：{orderId}</p>
              </div>
            </div>
          </div>
          <div className="px-4 py-4 bg-gray-50/50">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-gray-500">支付金额</span>
              <div className="flex items-baseline gap-2">
                {originalPrice && originalPrice !== price && (
                  <span className="text-sm text-gray-400 line-through">¥{originalPrice.toFixed(2)}</span>
                )}
                <span className="text-2xl font-semibold" style={{ color: current.color }}>
                  <span className="text-base">¥</span>
                  {price.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4">
          <div className="px-4 py-3 border-b border-gray-50">
            <span className="text-sm text-gray-500">选择支付方式</span>
          </div>
          <div className="flex">
            {(["WECHAT", "ALIPAY"] as const).map((method) => {
              const config = methodConfig[method];
              const isActive = paymentMethod === method;
              return (
                <button
                  key={method}
                  type="button"
                  onClick={() => {
                    if (loadingMethod) return;
                    onSelectMethod(method);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 border-b-2 transition-colors ${
                    isActive ? "bg-gray-50/50" : "border-transparent hover:bg-gray-50/30"
                  }`}
                  style={{
                    borderBottomColor: isActive ? config.color : "transparent",
                  }}
                >
                  <Image src={config.iconSrc} alt="" width={24} height={24} className="w-6 h-6 shrink-0" />
                  <span
                    className={`text-sm font-medium ${isActive ? "" : "text-gray-500"}`}
                    style={{ color: isActive ? config.color : undefined }}
                  >
                    {config.name}
                  </span>
                  {loadingMethod === method && (
                    <Loader2 className="w-4 h-4 text-gray-400 animate-spin" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* QR Code Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <AnimatePresence mode="wait">
            {!isExpired && (
              <motion.div
                key="qr"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-6 py-6"
              >
                <div className="flex flex-col items-center">
                  <div className="relative p-3 rounded-xl mb-4" style={{ backgroundColor: current.bgLight }}>
                    <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 rounded-tl-xl" style={{ borderColor: current.color }} />
                    <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 rounded-tr-xl" style={{ borderColor: current.color }} />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 rounded-bl-xl" style={{ borderColor: current.color }} />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 rounded-br-xl" style={{ borderColor: current.color }} />

                    <div className="w-52 h-52 rounded-lg flex items-center justify-center bg-white overflow-hidden">
                      {payResult.code_url && (
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                            payResult.code_url,
                          )}`}
                          alt={paymentMethod === "ALIPAY" ? "支付宝支付二维码" : "微信支付二维码"}
                          width={240}
                          height={240}
                          className="block"
                        />
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-1">
                    请使用{" "}
                    <span style={{ color: current.color }} className="font-medium">
                      {paymentMethod === "WECHAT" ? "微信" : "支付宝"}
                    </span>{" "}
                    扫码支付
                  </p>

                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      支付剩余时间：
                      <span className={timeLeft <= 60 ? "text-red-500 font-medium" : ""}>{formatTime(timeLeft)}</span>
                    </span>
                  </div>
                </div>

                <p className="mt-5 text-xs text-gray-400 text-center">
                  若已支付成功但未自动解锁，请<button
                    type="button"
                    disabled={refreshLoading}
                    onClick={async () => {
                      setRefreshLoading(true);
                      try {
                        await onRefresh();
                      } finally {
                        setRefreshLoading(false);
                      }
                    }}
                    className="underline text-pink-500 hover:text-pink-600 disabled:opacity-60"
                  >{refreshLoading ? "查询中..." : "刷新页面"}</button>
                </p>
              </motion.div>
            )}

            {isExpired && (
              <motion.div
                key="expired"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-6 py-10 flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-base font-medium text-gray-800 mb-1">二维码已过期</p>
                <p className="text-sm text-gray-500 mb-4">请重新生成支付二维码</p>
                <Button
                  type="button"
                  onClick={() => {
                    setTimeLeft(15 * 60);
                    onSelectMethod(paymentMethod);
                  }}
                  className="px-6 py-2 rounded-lg text-sm font-medium text-white"
                  style={{ backgroundColor: current.color }}
                >
                  重新生成二维码
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-400">
          <Shield className="w-3.5 h-3.5" />
          <span>安全支付 · {paymentMethod === "WECHAT" ? "微信" : "支付宝"}官方提供保障</span>
        </div>
      </main>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
        </div>
      }
    >
      <ResultPageContent />
    </Suspense>
  );
}
