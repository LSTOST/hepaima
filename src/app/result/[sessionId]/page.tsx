"use client";

import React, { useEffect, useState, Suspense, useCallback } from "react";
import { useParams } from "next/navigation";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";
import { getCompatibilityLevel } from "@/lib/scoring";

type PageState = "loading" | "waiting" | "generating" | "ready" | "error";

interface SessionStatus {
  status: string;
  stage: string;
  inviteCode?: string;
  initiatorName?: string;
  partnerName?: string;
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

const STAGE_LABELS: Record<string, string> = {
  UNIVERSAL: "通用版",
  AMBIGUOUS: "暧昧期",
  ROMANCE: "热恋期",
  STABLE: "稳定期",
};

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
  const sessionId = params.sessionId as string;

  const [pageState, setPageState] = useState<PageState>("loading");
  const [sessionData, setSessionData] = useState<SessionStatus | null>(null);
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [reportPollTimeout, setReportPollTimeout] = useState(false);
  const [generatingTipIndex, setGeneratingTipIndex] = useState(0);
  const reportPollCountRef = React.useRef(0);
  const streamFetchStartedRef = React.useRef(false);
  const REPORT_POLL_MAX = 12;
  const REPORT_POLL_INTERVAL_MS = 5000;

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
        const res = await fetch(`/api/v1/result/${sessionId}`);
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

  // Poll status when waiting (every 10s)
  useEffect(() => {
    if (pageState !== "waiting" || !sessionId) return;

    const poll = async () => {
      try {
        const res = await fetch(`/api/v1/quiz/status/${sessionId}`);
        const data = await res.json();
        if (!res.ok) return;
        setSessionData(data);
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
        }
      } catch {
        /* ignore */
      }
    };

    const timer = setInterval(poll, 10000);
    return () => clearInterval(timer);
  }, [pageState, sessionId, fetchResultWithRetry]);

  // Poll result when generating (every 3s)
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

    const timer = setInterval(poll, 3000);
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
          const chunks: Uint8Array[] = [];
          for (;;) {
            const { done, value } = await reader.read();
            if (cancelled) return;
            if (done) break;
            if (value) chunks.push(value);
          }
          const full = chunks
            .map((c) => new TextDecoder().decode(c))
            .join("");
          let parsed: ReportData;
          try {
            parsed = JSON.parse(full) as ReportData;
          } catch {
            const jsonMatch = full.match(/\{[\s\S]*\}/);
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

  // 生成报告中轮播提示文案
  useEffect(() => {
    if (pageState !== "generating") return;
    const t = setInterval(() => {
      setGeneratingTipIndex((i) => (i + 1) % GENERATING_TIPS.length);
    }, 2500);
    return () => clearInterval(t);
  }, [pageState]);

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
          <p className="text-gray-500 text-sm mb-4">AI 正在为你们分析契合度</p>
          <div className="min-h-[28px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={generatingTipIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="text-gray-600 text-sm font-medium"
              >
                {GENERATING_TIPS[generatingTipIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
          <motion.div
            className="mt-6 flex justify-center gap-1.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-2.5 h-2.5 rounded-full bg-pink-400"
                animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.15, 0.9] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </motion.div>
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
}: {
  sessionId: string;
  resultData: ResultData;
  sessionData: SessionStatus;
  reportPollTimeout?: boolean;
}) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(resultData.purchasedTier === "PREMIUM");
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    if (resultData.purchasedTier === "PREMIUM") setUnlocked(true);
  }, [resultData.purchasedTier]);

  const [premiumTipIndex, setPremiumTipIndex] = useState(0);
  const [basicReportTipIndex, setBasicReportTipIndex] = useState(0);
  const PREMIUM_GENERATING_TIPS = [
    "AI 正在分析你们的依恋模式...",
    "正在模拟你们的日常互动场景...",
    "正在生成 4 周成长计划...",
    "正在撰写专属沟通指南...",
    "快好了，深度报告即将呈现...",
  ];
  const BASIC_REPORT_ANALYSIS_TIPS = [
    "正在分析你们的依恋类型…",
    "正在解读爱的语言匹配…",
    "正在撰写关系建议…",
    "正在整理行动清单…",
    "即将完成…",
  ];

  const [shareLinkCopied, setShareLinkCopied] = useState(false);

  const handleUnlockPremium = async () => {
    setUnlocking(true);
    try {
      const res = await fetch(`/api/v1/result/${sessionId}/unlock`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setUnlocked(true);
      } else {
        setUnlocked(false);
      }
    } catch {
      setUnlocked(false);
    } finally {
      setUnlocking(false);
    }
  };

  const premiumReport = resultData.premiumReport;
  const hasPremiumReport = premiumReport && premiumReport.deepAnalysis;

  const report = resultData.report;
  const hasReport =
    report && (report.overallAnalysis ?? report.attachmentAnalysis ?? report.loveLanguageAnalysis);

  useEffect(() => {
    if ((!unlocked && !unlocking) || hasPremiumReport) return;
    const t = setInterval(() => {
      setPremiumTipIndex((i) => (i + 1) % PREMIUM_GENERATING_TIPS.length);
    }, 3000);
    return () => clearInterval(t);
  }, [unlocked, unlocking, hasPremiumReport]);

  useEffect(() => {
    if (hasReport || reportPollTimeout) return;
    const t = setInterval(() => {
      setBasicReportTipIndex((i) => (i + 1) % BASIC_REPORT_ANALYSIS_TIPS.length);
    }, 2500);
    return () => clearInterval(t);
  }, [hasReport, reportPollTimeout]);

  const handleOpenShareDialog = useCallback(() => {
    setShareDialogOpen(true);
    setShareLinkCopied(false);
  }, []);
  const stageLabel = STAGE_LABELS[sessionData.stage] ?? "热恋期";
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
    name: DIMENSION_NAMES[key] ?? key,
    // 通用版返回 personality，分阶段返回 lifestyle，统一在「生活习惯」下展示
    score: dims[key] ?? (key === "lifestyle" ? dims["personality"] : undefined) ?? 0,
  }));

  const scoreCounter = useCounter(resultData.overallScore, 1600);
  const ratingLabel = getCompatibilityLevel(resultData.overallScore);

  useEffect(() => {
    const timer = setTimeout(() => scoreCounter.start(), 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 border-b border-white/20">
          <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex flex-col items-start">
              <span className="font-[family-name:var(--font-brand)] text-xl font-bold bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] bg-clip-text text-transparent leading-tight tracking-widest">
                合拍吗
              </span>
              <span className="font-[family-name:var(--font-brand)] text-[10px] text-gray-400 tracking-widest w-full text-center">
                hepaima.com
              </span>
            </div>
            <Button
              variant="ghost"
              onClick={handleOpenShareDialog}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </nav>

        <main className="max-w-[1000px] mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-4">
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

          <ScrollCard delay={0.05}>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center">
                  <Heart className="w-4.5 h-4.5 text-[#EC4899]" />
                </div>
                <h2 className="text-lg font-bold text-gray-800">依恋类型配对</h2>
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
                <h2 className="text-lg font-bold text-gray-800">
                  {report?.loveLanguageAnalysis?.title ?? "爱的语言"}
                </h2>
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
                  <div key={dim.name}>
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

          {hasReport ? (
            <motion.div
              className="flex flex-col gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <ScrollCard delay={0.05}>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm" style={{ padding: "20px 24px" }}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center">
                      <Sparkles className="w-4.5 h-4.5 text-[#EC4899]" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-800">AI 深度解读</h2>
                  </div>
                  <div
                    className="rounded-full mb-5"
                    style={{ height: 2, width: 40, background: "linear-gradient(90deg, #EC4899, #8B5CF6)" }}
                  />
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

              {report?.strengths && report.strengths.length > 0 && (
                <ScrollCard delay={0.05}>
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6">
                    <div className="flex items-center gap-2 mb-5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: "#ECFDF5" }}
                      >
                        <ThumbsUp className="w-4.5 h-4.5" style={{ color: "#10B981" }} />
                      </div>
                      <h2 className="text-lg font-bold text-gray-800">你们的优势</h2>
                    </div>
                    <ul className="space-y-2">
                      {report.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-600" style={{ fontSize: 15 }}>
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#10B981" }} />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </ScrollCard>
              )}

              {report?.challenges && report.challenges.length > 0 && (
                <ScrollCard delay={0.05}>
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6">
                    <div className="flex items-center gap-2 mb-5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: "#FFFBEB" }}
                      >
                        <AlertTriangle className="w-4.5 h-4.5" style={{ color: "#F59E0B" }} />
                      </div>
                      <h2 className="text-lg font-bold text-gray-800">需要注意</h2>
                    </div>
                    <ul className="space-y-2">
                      {report.challenges.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-600">
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                            style={{ backgroundColor: "#F59E0B" }}
                          />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </ScrollCard>
              )}

              {report?.actionItems && report.actionItems.length > 0 && (
                <ScrollCard delay={0.05}>
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6">
                    <div className="flex items-center gap-2 mb-5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: "#F5F3FF" }}
                      >
                        <Target className="w-4.5 h-4.5" style={{ color: "#8B5CF6" }} />
                      </div>
                      <h2 className="text-lg font-bold text-gray-800">成长任务</h2>
                    </div>
                    <div className="space-y-0">
                      {report.actionItems.map((item, i) => (
                        <div key={i}>
                          <div className="flex items-start gap-3 py-4">
                            <span
                              className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600"
                            >
                              {i + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-800 mb-1.5" style={{ fontSize: 16 }}>
                                {item.title}
                              </p>
                              <p className="leading-relaxed" style={{ fontSize: 14, color: "#666666" }}>
                                {item.description}
                              </p>
                            </div>
                          </div>
                          {i < report.actionItems!.length - 1 && (
                            <div className="border-t border-gray-100" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollCard>
              )}
            </motion.div>
          ) : (
            <div className="flex flex-col gap-4">
              <ScrollCard delay={0.05}>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm" style={{ padding: "20px 24px" }}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center">
                      <Sparkles className="w-4.5 h-4.5 text-[#EC4899]" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-800">AI 深度解读</h2>
                  </div>
                  <motion.div
                    className="rounded-full mb-5"
                    style={{ height: 2, width: 40, background: "linear-gradient(90deg, #EC4899, #8B5CF6)" }}
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <div className="flex items-center gap-3 py-4" style={{ fontSize: 15, color: "#444444" }}>
                    {reportPollTimeout ? (
                      <p>报告生成较慢，请稍后刷新页面查看</p>
                    ) : (
                      <>
                        <Loader2 className="w-5 h-5 text-pink-500 animate-spin flex-shrink-0" />
                        <div className="min-h-[22px] flex items-center flex-1">
                          <AnimatePresence mode="wait">
                            <motion.p
                              key={basicReportTipIndex}
                              initial={{ opacity: 0, x: 6 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -6 }}
                              transition={{ duration: 0.3 }}
                              style={{ margin: 0 }}
                            >
                              {BASIC_REPORT_ANALYSIS_TIPS[basicReportTipIndex]}
                            </motion.p>
                          </AnimatePresence>
                        </div>
                        <motion.div className="flex gap-1 flex-shrink-0" aria-hidden>
                          {[0, 1, 2].map((i) => (
                            <motion.span
                              key={i}
                              className="w-1.5 h-1.5 rounded-full bg-pink-300"
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                            />
                          ))}
                        </motion.div>
                      </>
                    )}
                  </div>
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
          )}

          {!unlocked && !unlocking ? (
            <div className="flex flex-col">
              <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50/80" style={{ minHeight: 100 }}>
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/90 shadow-sm border border-gray-100">
                    <Lock className="w-4 h-4 flex-shrink-0" style={{ color: "#EC4899" }} />
                    <span className="text-sm font-medium text-gray-700">深度报告内容预览 · 解锁后可查看</span>
                  </div>
                </div>
                <div className="select-none pointer-events-none opacity-60" style={{ filter: "blur(6px)", padding: "14px 16px" }}>
                  <p className="text-sm text-gray-500">
                    根据依恋理论和 Gottman 研究发现，你们的关系呈现出独特的互动模式。双方在依恋类型上的差异既是吸引的来源，也可能成为需要磨合的地方。安全型伴侣能为关系提供稳定基础，而焦虑型或回避型若能在关系中逐渐获得安全感，也能与伴侣建立更深的联结。
                  </p>
                </div>
                <div
                  className="absolute bottom-0 left-0 right-0 pointer-events-none"
                  style={{ height: 48, background: "linear-gradient(to bottom, transparent, rgba(249,250,251,0.98))" }}
                />
              </div>
              <ScrollCard delay={0.05} className="mt-6">
                <div
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm mx-auto text-center"
                  style={{ padding: 32, maxWidth: 400 }}
                >
                  <Lock className="w-12 h-12 mx-auto mb-4" style={{ color: "#EC4899" }} />
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">解锁深度报告</h2>
                  <p className="text-sm mb-5" style={{ color: "#888888" }}>更深入的分析，更具体的建议</p>
                  <ul className="space-y-3 mb-5 text-left inline-block">
                    {[
                      "深度关系解读（300+字专业分析）",
                      "爱的语言日常场景模拟",
                      "4周情侣成长任务",
                      "专属沟通指南与冲突处理锦囊",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2" style={{ fontSize: 15, color: "#333333" }}>
                        <Check className="w-4 h-4 flex-shrink-0" style={{ color: "#10B981" }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
                    <span className="text-[20px] text-[#AAAAAA]" style={{ textDecoration: "line-through", marginRight: 12 }}>
                      ¥19.9
                    </span>
                    <span
                      className="inline-block px-2 py-0.5 rounded text-sm"
                      style={{ background: "#FDF2F8", color: "#EC4899", fontSize: 14 }}
                    >
                      免费解锁
                    </span>
                  </div>
                  <Button
                    onClick={handleUnlockPremium}
                    disabled={unlocking}
                    className="w-full max-w-[280px] h-12 rounded-xl bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] hover:from-[#DB2777] hover:to-[#7C3AED] text-white text-base font-semibold shadow-lg shadow-pink-500/10 transition-transform duration-200 hover:scale-[1.02] mx-auto"
                  >
                    {unlocking ? (
                      <>
                        <Loader2 className="w-4.5 h-4.5 mr-2 animate-spin" />
                        解锁中...
                      </>
                    ) : (
                      "立即解锁"
                    )}
                  </Button>
                  <p className="mt-2 text-xs" style={{ color: "#AAAAAA" }}>限时免费 · 原价 ¥19.9</p>
                </div>
              </ScrollCard>
            </div>
          ) : (unlocking || !hasPremiumReport) ? (
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
                  {unlocking ? "正在解锁..." : "正在为你们生成深度报告..."}
                </p>
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
                      {PREMIUM_GENERATING_TIPS[premiumTipIndex]}
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
              <ScrollCard delay={0.05}>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#F5F3FF" }}>
                      <Brain className="w-4.5 h-4.5" style={{ color: "#8B5CF6" }} />
                    </div>
                    <h2 className="text-lg font-bold text-gray-800">深度关系解读</h2>
                  </div>
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

              {premiumReport.attachmentDeep && (
                <ScrollCard delay={0.05}>
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6">
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center">
                        <Heart className="w-4.5 h-4.5 text-[#EC4899]" />
                      </div>
                      <h2 className="text-lg font-bold text-gray-800">
                        {premiumReport.attachmentDeep.title ?? "依恋模式深度解析"}
                      </h2>
                    </div>
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
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6">
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center">
                        <MessageCircleHeart className="w-4.5 h-4.5 text-[#EC4899]" />
                      </div>
                      <h2 className="text-lg font-bold text-gray-800">
                        {premiumReport.loveLanguageDeep.title ?? "爱的语言日常场景"}
                      </h2>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      <ReportText text={premiumReport.loveLanguageDeep.mismatchAnalysis ?? ""} />
                    </p>
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

              {premiumReport.relationshipForecast && (
                <ScrollCard delay={0.05}>
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6">
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#F5F3FF" }}>
                        <TrendingUp className="w-4.5 h-4.5" style={{ color: "#8B5CF6" }} />
                      </div>
                      <h2 className="text-lg font-bold text-gray-800">
                        {premiumReport.relationshipForecast.title ?? "关系趋势预测"}
                      </h2>
                    </div>
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
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6">
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center">
                        <Calendar className="w-4.5 h-4.5 text-[#EC4899]" />
                      </div>
                      <h2 className="text-lg font-bold text-gray-800">4周成长任务</h2>
                    </div>
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
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6">
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#F5F3FF" }}>
                        <MessagesSquare className="w-4.5 h-4.5" style={{ color: "#8B5CF6" }} />
                      </div>
                      <h2 className="text-lg font-bold text-gray-800">
                        {premiumReport.communicationGuide.title ?? "专属沟通指南"}
                      </h2>
                    </div>
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
            </motion.div>
          )}

          <ScrollCard delay={0.05}>
            <div className="flex flex-col sm:flex-row gap-3 pt-2 pb-8 mt-4">
              <Link href="/" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full rounded-xl py-5 text-base text-gray-600 border-gray-200 hover:bg-gray-50 bg-transparent"
                >
                  <RotateCcw className="w-4.5 h-4.5 mr-2" />
                  重新测试
                </Button>
              </Link>
              <Button
                onClick={handleOpenShareDialog}
                className="flex-1 bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] hover:from-[#DB2777] hover:to-[#7C3AED] text-white rounded-xl py-5 text-base font-medium shadow-lg shadow-pink-500/10 transition-all duration-200"
              >
                <Share2 className="w-4.5 h-4.5 mr-2" />
                分享结果
              </Button>
            </div>
          </ScrollCard>
        </main>

        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogTitle className="sr-only">分享结果</DialogTitle>
            {/* 只展示分享卡片，用户自行截图或长按保存 */}
            <div
              id="share-card"
              className="relative w-[300px] h-[400px] mx-auto rounded-[28px] p-6 text-white overflow-hidden"
              style={{
                background: "linear-gradient(140deg, #EC4899, #8B5CF6)",
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
                    <p className="mt-1.5 text-[11px] font-medium text-white/90">超级准的情侣契合度测试</p>
                  </div>

                  {/* 情侣名字与阶段标签同一行，标签紧挨名字、缩小 */}
                  <div className="flex items-center gap-2 mt-4">
                    <p className="text-2xl font-semibold leading-tight truncate min-w-0">
                      {nameA}{" "}
                      <Heart className="inline w-4 h-4 mx-1 fill-white text-white align-middle" />{" "}
                      {nameB}
                    </p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] shrink-0">
                      <Heart className="w-3 h-3 fill-white text-white" />
                      <span>{stageLabel}</span>
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
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                        <Brain className="w-3.5 h-3.5 text-amber-100" />
                        <span>深度关系解读</span>
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
                    </div>
                  </div>

                  {/* 底部引导文案 + 二维码（两行文案） */}
                  <div className="pt-3 mt-2 border-t border-white/25 flex items-end justify-between gap-3">
                    <div className="text-[11px] leading-relaxed text-white/85 space-y-1">
                      <p>我们的爱情密码已解锁</p>
                      <p>你们也来试试？</p>
                      <p className="font-semibold text-white">访问 hepaima.com</p>
                      <p className="text-white/70">测一测「你们有多合拍」？</p>
                    </div>
                    <div className="shrink-0">
                      <div className="rounded-2xl bg-white/90 p-1.5">
                        <Image
                          src="/qr-hepaima.png"
                          alt="扫码测测你们有多合拍"
                          width={64}
                          height={64}
                          className="block rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
          </DialogContent>
        </Dialog>
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
