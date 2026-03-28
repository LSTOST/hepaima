"use client";

import React, {
  Suspense,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Loader2,
  ArrowRight,
  ClipboardList,
  LayoutGrid,
  Share2,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/** 海报导出用：html2canvas 对 CJK 小字 + flex 易错位，统一栈并避免过小字号 */
const PERSONAL_POSTER_FONT =
  '"PingFang SC","Hiragino Sans GB","Noto Sans SC","Source Han Sans SC","Microsoft YaHei","Microsoft JhengHei",sans-serif';

type PageState = "loading" | "in_progress" | "ready" | "error" | "other";

interface PersonalDimensionBreakdownItem {
  key: string;
  label: string;
  score0to100: number;
  mean1to5: number;
}

interface PersonalReportBasic {
  type?: string;
  summary?: string;
  highlights?: string[];
  cautions?: string[];
  nextStep?: string;
  dimensionBreakdown?: PersonalDimensionBreakdownItem[];
  aiSynthesis?: string;
  aiAdvice?: string;
}

function PersonalResultContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const sessionId = params.sessionId as string;
  const readyHint = searchParams.get("ready") === "1";

  const [state, setState] = useState<PageState>("loading");
  const [message, setMessage] = useState<string | null>(null);
  const [quizPath, setQuizPath] = useState<string | null>(null);
  const [overallScore, setOverallScore] = useState<number | null>(null);
  const [dimensions, setDimensions] = useState<Record<string, number> | null>(
    null,
  );
  const [dimensionLabels, setDimensionLabels] = useState<Record<
    string,
    string
  > | null>(null);
  const [reportBasic, setReportBasic] = useState<PersonalReportBasic | null>(
    null,
  );
  const [trackLabel, setTrackLabel] = useState<string | null>(null);
  const [posterOpen, setPosterOpen] = useState(false);
  const [posterSaving, setPosterSaving] = useState(false);

  const fetchResult = useCallback(async () => {
    setState("loading");
    setMessage(null);
    try {
      const res = await fetch(`/api/v1/result/${sessionId}`, {
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message ?? "加载失败");
      }
      if (data.status === "in_progress") {
        setQuizPath(
          typeof data.quizPath === "string"
            ? data.quizPath
            : `/quiz/${sessionId}?mode=PERSONAL`,
        );
        setTrackLabel(
          typeof data.personalTrackLabel === "string"
            ? data.personalTrackLabel
            : null,
        );
        setMessage(
          typeof data.message === "string"
            ? data.message
            : "测评尚未完成",
        );
        setState("in_progress");
        return;
      }
      if (data.status === "waiting" || data.status === "generating") {
        setMessage(
          typeof data.message === "string" ? data.message : "暂不可用",
        );
        setState("other");
        return;
      }
      if (data.status === "ready" && data.result?.isPersonal) {
        setTrackLabel(
          typeof data.result.personalTrackLabel === "string"
            ? data.result.personalTrackLabel
            : null,
        );
        setOverallScore(
          typeof data.result.overallScore === "number"
            ? data.result.overallScore
            : null,
        );
        setDimensions(
          data.result.dimensions &&
            typeof data.result.dimensions === "object" &&
            !Array.isArray(data.result.dimensions)
            ? (data.result.dimensions as Record<string, number>)
            : null,
        );
        setDimensionLabels(
          data.result.dimensionLabels &&
          typeof data.result.dimensionLabels === "object"
            ? (data.result.dimensionLabels as Record<string, string>)
            : null,
        );
        const rb = data.result.reportBasic;
        setReportBasic(
          rb && typeof rb === "object" && !Array.isArray(rb)
            ? (rb as PersonalReportBasic)
            : null,
        );
        setState("ready");
        return;
      }
      setMessage("该会话不是个人自测结果，请到对应结果页查看。");
      setState("other");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "加载失败");
      setState("error");
    }
  }, [sessionId]);

  useEffect(() => {
    fetchResult();
  }, [fetchResult, readyHint]);

  const dimEntries =
    dimensions && Object.keys(dimensions).length > 0
      ? Object.entries(dimensions).sort((a, b) => b[1] - a[1])
      : [];

  const breakdown =
    reportBasic?.dimensionBreakdown &&
    Array.isArray(reportBasic.dimensionBreakdown) &&
    reportBasic.dimensionBreakdown.length > 0
      ? reportBasic.dimensionBreakdown
      : null;

  const posterDimRows = useMemo(() => {
    if (breakdown && breakdown.length > 0) {
      return breakdown.slice(0, 4).map((d) => ({
        label: d.label,
        score: d.score0to100,
        mean: d.mean1to5,
      }));
    }
    return dimEntries.slice(0, 4).map(([key, score]) => ({
      label: dimensionLabels?.[key] ?? key,
      score,
      mean: null as number | null,
    }));
  }, [breakdown, dimEntries, dimensionLabels]);

  const posterOverviewText = useMemo(() => {
    const ai = reportBasic?.aiSynthesis?.trim();
    if (ai) return ai;
    const s = reportBasic?.summary?.trim();
    if (s) return s;
    return "";
  }, [reportBasic]);

  const savePersonalPoster = useCallback(async () => {
    const el = document.getElementById("personal-share-poster");
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
          node.style.fontFamily = PERSONAL_POSTER_FONT;
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
        console.warn("personal poster: html-to-image failed, fallback html2canvas", toPngErr);
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
                : clonedDoc.getElementById("personal-share-poster");
            if (!(root instanceof HTMLElement)) return;
            applyPosterFontTree(root);
          },
        });
        url = canvas.toDataURL("image/png");
      }
      const safe =
        (trackLabel ?? "自测").replace(/[/\\?%*:|"<>]/g, "_").trim().slice(0, 24) ||
        "自测";
      const a = document.createElement("a");
      a.href = url;
      a.download = `合拍吗-${safe}-自测海报.png`;
      a.click();
    } catch (e) {
      console.error("personal poster export:", e);
    } finally {
      setPosterSaving(false);
    }
  }, [trackLabel]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col pb-28">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-pink-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-[360px] h-[360px] bg-violet-100/30 rounded-full blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <Link href="/" className="shrink-0">
            <Logo size="md" />
          </Link>
          {state === "ready" ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5 rounded-full border-pink-200 bg-white text-pink-700 hover:bg-pink-50 hover:text-pink-800"
              onClick={() => setPosterOpen(true)}
            >
              <Share2 className="h-4 w-4 shrink-0" aria-hidden />
              <span className="text-sm font-medium">生成海报</span>
            </Button>
          ) : (
            <span className="text-sm font-medium text-[#6B7280] truncate text-right max-w-[min(200px,45vw)]">
              {trackLabel ? `个人自测 · ${trackLabel}` : "个人自测"}
            </span>
          )}
        </div>
      </header>

      <main className="relative z-10 flex-1 px-4 py-8 max-w-lg mx-auto w-full">
        {state === "loading" ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-pink-500 animate-spin mb-3" />
            <p className="text-sm text-[#6B7280]">加载中…</p>
          </div>
        ) : null}

        {state === "in_progress" ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-amber-100 bg-amber-50/80 p-6 text-center"
          >
            <ClipboardList className="w-10 h-10 text-amber-600 mx-auto mb-3" />
            <p className="text-[#1F2937] font-medium mb-2">
              {message ?? "测评尚未完成"}
            </p>
            {quizPath ? (
              <Button
                asChild
                className="mt-4 rounded-full bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] text-white"
              >
                <Link href={quizPath}>继续答题</Link>
              </Button>
            ) : null}
          </motion.div>
        ) : null}

        {(state === "error" || state === "other") && message ? (
          <div className="rounded-2xl border border-red-100 bg-red-50/80 p-6 text-center text-sm text-red-800">
            {message}
            <div className="mt-4">
              <Button variant="outline" onClick={fetchResult} className="mr-2">
                重试
              </Button>
              <Button asChild variant="ghost">
                <Link href="/">回首页</Link>
              </Button>
            </div>
          </div>
        ) : null}

        {state === "ready" ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="relative overflow-hidden rounded-3xl border border-white/25 bg-gradient-to-br from-[#EC4899] via-[#D946EF] to-[#8B5CF6] p-6 sm:p-8 text-center shadow-xl shadow-violet-500/25">
              <div
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                  background:
                    "radial-gradient(circle at 0% 0%, rgba(255,255,255,0.35), transparent 55%), radial-gradient(circle at 100% 100%, rgba(253,224,71,0.2), transparent 50%)",
                }}
                aria-hidden
              />
              <div className="relative z-10 text-white">
                <p className="text-sm font-medium text-white/90 mb-4">
                  先了解自己 · {trackLabel ?? "自测"}
                </p>
                <p className="text-5xl sm:text-6xl font-bold tabular-nums text-white leading-none drop-shadow-sm">
                  {overallScore ?? "—"}
                </p>
                <p className="text-xs font-semibold tracking-wider text-white/85 mt-3">
                  自测指数
                </p>
                <p className="text-xs text-white/75 mt-3 leading-relaxed max-w-xs mx-auto">
                  非诊断、非双人契合度，仅供自我觉察。
                </p>
              </div>
            </div>

            {breakdown ? (
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
                <h2 className="text-sm font-semibold text-[#1F2937]">
                  各维度得分
                </h2>
                <p className="text-xs text-[#9CA3AF] -mt-2">
                  分值越高表示越符合正向描述
                </p>
                {breakdown.map((d) => (
                  <div key={d.key}>
                    <div className="flex justify-between items-start text-xs mb-1 gap-2">
                      <span className="min-w-0 text-[#6B7280]">
                        {d.label}（均值 {d.mean1to5}）
                      </span>
                      <span className="tabular-nums font-medium text-[#1F2937] shrink-0">
                        {d.score0to100}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#EC4899] to-[#8B5CF6]"
                        style={{
                          width: `${Math.min(100, Math.max(0, d.score0to100))}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : dimEntries.length > 0 ? (
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
                <h2 className="text-sm font-semibold text-[#1F2937]">
                  各维度得分
                </h2>
                <p className="text-xs text-[#9CA3AF] -mt-2">
                  分值越高表示越符合正向描述
                </p>
                {dimEntries.map(([key, score]) => (
                  <div key={key}>
                    <div className="flex justify-between text-xs text-[#6B7280] mb-1">
                      <span>{dimensionLabels?.[key] ?? key}</span>
                      <span className="tabular-nums font-medium text-[#1F2937]">
                        {score}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#EC4899] to-[#8B5CF6]"
                        style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {reportBasic ? (
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4 text-[#1F2937]">
                {reportBasic.summary ? (
                  <p className="text-sm leading-relaxed text-[#374151]">
                    {reportBasic.summary}
                  </p>
                ) : null}
                {reportBasic.aiSynthesis ? (
                  <p className="text-sm leading-relaxed text-[#4B5563] border-l-2 border-violet-200 pl-3">
                    {reportBasic.aiSynthesis}
                  </p>
                ) : null}
                {Array.isArray(reportBasic.highlights) &&
                reportBasic.highlights.length > 0 ? (
                  <div>
                    <p className="text-xs font-semibold text-[#8B5CF6] mb-2">
                      相对从容的方面
                    </p>
                    <ul className="text-sm space-y-2 text-[#4B5563] list-disc pl-4">
                      {reportBasic.highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {Array.isArray(reportBasic.cautions) &&
                reportBasic.cautions.length > 0 ? (
                  <div>
                    <p className="text-xs font-semibold text-pink-600 mb-2">
                      你可能想多留意的点
                    </p>
                    <ul className="text-sm space-y-2 text-[#4B5563] list-disc pl-4">
                      {reportBasic.cautions.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {reportBasic.nextStep ? (
                  <p className="text-sm text-[#6B7280] border-t border-gray-100 pt-4">
                    <span className="font-medium text-[#1F2937]">下一步：</span>
                    {reportBasic.nextStep}
                  </p>
                ) : null}
                {reportBasic.aiAdvice ? (
                  <p className="text-sm text-[#6B7280] italic">
                    {reportBasic.aiAdvice}
                  </p>
                ) : null}
              </div>
            ) : null}
          </motion.div>
        ) : null}
      </main>

      {state === "ready" ? (
        <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-100 bg-white/95 backdrop-blur-md px-4 py-4 safe-area-pb">
          <div className="max-w-lg mx-auto flex flex-col sm:flex-row gap-3">
            <Button
              asChild
              className="flex-1 rounded-full h-12 font-semibold bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] text-white shadow-md shadow-pink-500/20 hover:from-[#DB2777] hover:to-[#7C3AED]"
            >
              <Link href="/#stage-selection">
                <span className="inline-flex items-center justify-center gap-2">
                  <UsersRound className="w-4 h-4 shrink-0 opacity-95" aria-hidden />
                  双人测评
                  <ArrowRight className="w-4 h-4 shrink-0" aria-hidden />
                </span>
              </Link>
            </Button>
            <Button
              asChild
              className="flex-1 rounded-full h-12 font-semibold border-2 border-violet-300/90 bg-white text-violet-700 shadow-sm hover:bg-violet-50/90 hover:border-violet-400"
            >
              <Link href="/#scenario">
                <span className="inline-flex items-center justify-center gap-2">
                  <LayoutGrid
                    className="w-4 h-4 shrink-0 text-violet-600"
                    aria-hidden
                  />
                  场景测评
                  <ArrowRight className="w-4 h-4 shrink-0 text-violet-500" aria-hidden />
                </span>
              </Link>
            </Button>
          </div>
        </div>
      ) : null}

      <Dialog open={posterOpen} onOpenChange={setPosterOpen}>
        <DialogContent className="sm:max-w-md gap-4">
          <DialogHeader className="text-left">
            <DialogTitle>分享海报</DialogTitle>
            <DialogDescription>
              保存后可分享给好友，或发送到朋友圈、小红书等社交平台。
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center overflow-hidden rounded-xl bg-gray-100 p-2">
            {/*
              海报：块级流 + 标签行与进度条分离（避免 table 双行在栅格化时粘连）；
              高度随内容（minHeight），减少底部大块留白。
            */}
            <div
              id="personal-share-poster"
              className="overflow-hidden rounded-[24px] text-left shadow-lg"
              style={{
                width: 300,
                minHeight: 360,
                height: "auto",
                boxSizing: "border-box",
                padding: 24,
                position: "relative",
                background:
                  "linear-gradient(145deg, rgb(236, 72, 153) 0%, rgb(139, 92, 246) 100%)",
                color: "#ffffff",
                fontFamily: PERSONAL_POSTER_FONT,
                letterSpacing: 0,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: 0.35,
                  pointerEvents: "none",
                  background:
                    "radial-gradient(circle at 0% 0%, rgba(255,255,255,0.85), transparent 55%), radial-gradient(circle at 100% 100%, rgba(253,224,71,0.45), transparent 50%)",
                }}
                aria-hidden
              />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    alignItems: "flex-end",
                    columnGap: 10,
                    rowGap: 6,
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      flexShrink: 0,
                      padding: "6px 12px",
                      borderRadius: 9999,
                      background: "#ffffff",
                      fontSize: 14,
                      fontWeight: 700,
                      boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                    }}
                  >
                    <span style={{ color: "#9333EA", fontWeight: 800 }}>
                      合拍吗
                    </span>
                  </span>
                  <p
                    style={{
                      margin: 0,
                      flex: "0 1 auto",
                      maxWidth: "calc(100% - 98px)",
                      fontSize: 12,
                      lineHeight: "18px",
                      fontWeight: 600,
                      opacity: 0.92,
                    }}
                  >
                    先了解自己 · {trackLabel ?? "自测"}
                  </p>
                </div>

                <div style={{ marginTop: 14, textAlign: "center" }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 54,
                      lineHeight: "54px",
                      fontWeight: 800,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {overallScore ?? "—"}
                  </p>
                  <p
                    style={{
                      margin: "6px 0 0 0",
                      fontSize: 14,
                      lineHeight: "18px",
                      fontWeight: 600,
                      opacity: 0.9,
                    }}
                  >
                    自测指数
                  </p>
                </div>

                <div style={{ marginTop: 12 }}>
                  <p
                    style={{
                      fontSize: 12,
                      lineHeight: "18px",
                      fontWeight: 600,
                      opacity: 0.85,
                      margin: "0 0 10px 0",
                    }}
                  >
                    各维度得分
                  </p>
                  {posterDimRows.map((row, i) => (
                    <div key={i} style={{ marginBottom: 14 }}>
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          tableLayout: "fixed",
                          marginBottom: 10,
                        }}
                      >
                        <tbody>
                          <tr>
                            <td
                              style={{
                                width: "62%",
                                fontSize: 12,
                                lineHeight: "18px",
                                padding: "0 8px 0 0",
                                verticalAlign: "top",
                                opacity: 0.95,
                                wordBreak: "keep-all",
                              }}
                            >
                              {row.mean != null
                                ? `${row.label}（均值 ${row.mean}）`
                                : row.label}
                            </td>
                            <td
                              style={{
                                width: "38%",
                                fontSize: 12,
                                lineHeight: "18px",
                                fontWeight: 700,
                                textAlign: "right",
                                verticalAlign: "top",
                                padding: 0,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {row.score}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <div
                        style={{
                          height: 6,
                          borderRadius: 9999,
                          background: "rgba(255,255,255,0.22)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${Math.min(100, Math.max(0, row.score))}%`,
                            borderRadius: 9999,
                            background: "rgb(252, 231, 243)",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {posterOverviewText ? (
                  <div
                    style={{
                      marginTop: 14,
                      padding: "14px 16px",
                      borderRadius: 20,
                      background: "rgba(255,255,255,0.2)",
                      border: "1px solid rgba(255,255,255,0.38)",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: 11,
                        lineHeight: "17px",
                        fontWeight: 500,
                        opacity: 0.92,
                        wordBreak: "break-word",
                      }}
                    >
                      {posterOverviewText}
                    </p>
                  </div>
                ) : null}

                <div style={{ marginTop: 18, paddingTop: 12 }}>
                  <p
                    style={{
                      fontSize: 11,
                      lineHeight: "17px",
                      opacity: 0.78,
                      margin: "0 0 6px 0",
                    }}
                  >
                    非诊断、非双人契合度，仅供自我觉察。
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      lineHeight: "18px",
                      fontWeight: 600,
                      opacity: 0.88,
                      margin: 0,
                    }}
                  >
                    hepaima.com
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPosterOpen(false)}
              className="rounded-full"
            >
              关闭
            </Button>
            <Button
              type="button"
              disabled={posterSaving}
              onClick={savePersonalPoster}
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
    </div>
  );
}

export default function ReadyPersonalResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
        </div>
      }
    >
      <PersonalResultContent />
    </Suspense>
  );
}
