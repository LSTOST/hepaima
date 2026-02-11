"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Heart, Clock, Share2, ChevronRight, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getDeviceId } from "@/lib/device";
import { getCompatibilityLevel } from "@/lib/scoring";

// --- Types ---

type RecordStatus = "completed" | "waiting" | "expired";

interface QuizRecord {
  id: string;
  nameA: string;
  nameB: string;
  stage: string;
  stageKey: string;
  date: string;
  status: RecordStatus;
  score?: number;
  label?: string;
  inviteCode?: string;
}

// --- Stage Labels ---

const STAGE_LABELS: Record<string, string> = {
  AMBIGUOUS: "暧昧期",
  ROMANCE: "热恋期",
  STABLE: "稳定期",
};

// --- Stage Badge Colors ---

const STAGE_BADGE_STYLES: Record<string, string> = {
  AMBIGUOUS: "bg-pink-100 text-pink-600 border-pink-200",
  ROMANCE: "bg-pink-100 text-pink-600 border-pink-200",
  STABLE: "bg-violet-100 text-violet-600 border-violet-200",
};

// --- Record Card ---

function RecordCard({
  record,
  index,
}: {
  record: QuizRecord;
  index: number;
}) {
  const [copied, setCopied] = useState(false);

  const handleShareInvite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (record.inviteCode) {
      try {
        const url = `${typeof window !== "undefined" ? window.location.origin : "https://hepaima.com"}/quiz/join?code=${record.inviteCode}`;
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // fallback
      }
    }
  };

  const isExpired = record.status === "expired";
  const isWaiting = record.status === "waiting";
  const isCompleted = record.status === "completed";

  const cardContent = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
      className={`relative bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-200 ${
        isExpired ? "opacity-60" : "hover:shadow-md hover:border-gray-200"
      }`}
    >
      <div className="flex">
        {/* Left gradient accent bar */}
        <div
          className={`w-1 flex-shrink-0 ${
            isExpired
              ? "bg-gray-300"
              : "bg-gradient-to-b from-[#EC4899] to-[#8B5CF6]"
          }`}
        />

        {/* Content */}
        <div className="flex-1 p-4 sm:p-5">
          {/* Row 1: Names + Score/Status */}
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-base font-semibold text-gray-800">
              {record.nameA}{" "}
              <span className="text-gray-300 font-normal mx-1">{"&"}</span>{" "}
              {record.nameB}
            </h3>

            {isCompleted && record.score !== undefined && (
              <span className="text-xl font-bold bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] bg-clip-text text-transparent">
                {record.score}%
              </span>
            )}

            {isCompleted && record.score === undefined && record.label && (
              <span className="text-sm text-gray-400 font-medium">
                {record.label}
              </span>
            )}

            {isWaiting && (
              <Clock className="w-5 h-5 text-amber-500" />
            )}

            {isExpired && (
              <span className="text-sm text-gray-400 font-medium">
                已过期
              </span>
            )}
          </div>

          {/* Row 2: Badge + Label/Status */}
          <div className="flex items-center gap-2 mb-2.5">
            <Badge
              className={`text-xs px-2 py-0.5 border ${
                STAGE_BADGE_STYLES[record.stageKey] || STAGE_BADGE_STYLES.ROMANCE
              }`}
            >
              {record.stage}
            </Badge>

            {isCompleted && record.label && record.label !== "生成中" && (
              <span className="text-sm text-gray-400">{record.label}</span>
            )}

            {isWaiting && (
              <span className="text-sm text-amber-500 font-medium">
                等待对方完成
              </span>
            )}
          </div>

          {/* Row 3: Date + Share link */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{record.date}</span>

            {isWaiting && (
              <button
                type="button"
                onClick={handleShareInvite}
                className="inline-flex items-center gap-1 text-sm font-medium text-[#EC4899] hover:text-[#DB2777] transition-colors cursor-pointer"
              >
                {copied ? (
                  <>已复制</>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    分享邀请码
                  </>
                )}
              </button>
            )}

            {isCompleted && (
              <ChevronRight className="w-4 h-4 text-gray-300" />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (isCompleted || isWaiting) {
    return (
      <Link href={`/result/${record.id}`} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

// --- Empty State ---

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex-1 flex flex-col items-center justify-center py-24 px-4"
    >
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
        <Heart className="w-10 h-10 text-gray-300" />
      </div>
      <h2 className="text-lg font-semibold text-gray-500 mb-2">
        还没有测试记录
      </h2>
      <p className="text-sm text-gray-400 mb-8">
        和 TA 一起来测测吧
      </p>
      <Link href="/">
        <Button className="bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] hover:from-[#DB2777] hover:to-[#7C3AED] text-white rounded-full px-8 py-5 text-base font-medium shadow-lg shadow-pink-500/15 transition-all duration-200">
          开始测试
        </Button>
      </Link>
    </motion.div>
  );
}

// --- Page ---

function mapSessionToRecord(session: {
  id: string;
  inviteCode: string;
  stage: string;
  status: string;
  initiatorName: string;
  partnerName: string | null;
  createdAt: string;
  expiresAt: string;
  result?: { overallScore: number } | null;
}): QuizRecord {
  const now = new Date();
  const expiresAt = new Date(session.expiresAt);
  const isExpiredByTime = expiresAt < now;
  const isExpiredStatus = session.status === "EXPIRED";
  const isExpired = isExpiredByTime || isExpiredStatus;

  let status: RecordStatus;
  if (isExpired) {
    status = "expired";
  } else if (session.status === "COMPLETED") {
    status = "completed";
  } else {
    status = "waiting";
  }

  const stageLabel = STAGE_LABELS[session.stage] ?? session.stage;
  const dateStr = new Date(session.createdAt).toISOString().slice(0, 10);

  const record: QuizRecord = {
    id: session.id,
    nameA: session.initiatorName,
    nameB:
      status === "waiting"
        ? session.partnerName ?? "等待中"
        : status === "expired"
          ? "未完成"
          : session.partnerName ?? "TA",
    stage: stageLabel,
    stageKey: session.stage,
    date: dateStr,
    status,
    inviteCode: session.inviteCode,
  };

  if (status === "completed") {
    if (session.result) {
      record.score = session.result.overallScore;
      record.label = getCompatibilityLevel(session.result.overallScore);
    } else {
      record.label = "生成中";
    }
  }

  return record;
}

export default function HistoryPage() {
  const [records, setRecords] = useState<QuizRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const deviceId = getDeviceId();
    if (!deviceId) {
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/v1/history?deviceId=${encodeURIComponent(deviceId)}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.message ?? "获取失败");
          return;
        }
        const sessions = data.sessions ?? [];
        setRecords(sessions.map(mapSessionToRecord));
      } catch {
        setError("网络错误，请稍后重试");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const hasRecords = records.length > 0;

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Top nav */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 border-b border-white/20"
      >
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link href="/">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-gray-800">历史记录</h1>
        </div>
      </motion.nav>

      {/* Content */}
      {loading ? (
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col items-center justify-center py-24 px-4"
        >
          <Loader2 className="w-12 h-12 text-pink-500 animate-spin mb-4" />
          <p className="text-gray-500">加载中...</p>
        </motion.main>
      ) : error ? (
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col items-center justify-center py-24 px-4"
        >
          <p className="text-red-500 mb-4">{error}</p>
          <Link href="/">
            <Button variant="outline" className="rounded-xl">
              返回首页
            </Button>
          </Link>
        </motion.main>
      ) : hasRecords ? (
        <main className="max-w-[1000px] mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-[#FDF2F8] px-3.5 py-2.5">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#EC4899" }} />
            <p className="text-[13px] text-[#888888] leading-[1.5]">
              测评记录保存在当前设备和浏览器中，清除浏览器数据或更换设备后将无法找回
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {records.map((record, index) => (
                <RecordCard key={record.id} record={record} index={index} />
              ))}
            </AnimatePresence>
          </div>

          {/* Bottom spacing */}
          <div className="h-12" />
        </main>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
