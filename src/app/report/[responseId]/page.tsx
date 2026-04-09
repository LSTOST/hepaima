import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReportMarkdown } from "@/components/attachment-report/ReportMarkdown";
import { fetchAttachmentReportData } from "@/lib/attachment-report/fetch-report-data";
import {
  ATTACHMENT_TYPE_CSS_VARS,
  attachmentTypeAccentColor,
  attachmentTypeColorVar,
} from "@/lib/attachment-report/type-theme";
import type { ReportSections } from "@/lib/attachment-report/types";

type PageProps = { params: Promise<{ responseId: string }> };

const SECTION_ORDER: { key: keyof ReportSections; title: string }[] = [
  { key: "overview", title: "总览" },
  { key: "patterns", title: "关系模式" },
  { key: "conflicts", title: "冲突与压力" },
  { key: "compatibility", title: "亲密关系契合" },
  { key: "exercises", title: "练习与建议" },
];

function formatScore(n: number): string {
  if (typeof n !== "number" || Number.isNaN(n)) return "—";
  return n.toFixed(2);
}

/** 外圈圆环边框：类型色 + 透明度 */
function hexToRgba(hex: string, alpha: number): string {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) {
    h = `${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`;
  }
  if (h.length !== 6) return `rgba(124, 92, 191, ${alpha})`;
  const r = Number.parseInt(h.slice(0, 2), 16);
  const g = Number.parseInt(h.slice(2, 4), 16);
  const b = Number.parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function typeInitialChar(typeCode: string): string {
  const u = typeCode.trim().toUpperCase();
  const map: Record<string, string> = {
    SECURE: "安",
    ANXIOUS: "焦",
    AVOIDANT: "回",
    FEARFUL: "恐",
  };
  return map[u] ?? "?";
}

function ZhiwoBrandRow() {
  return (
    <p className="pt-8 text-center text-sm text-[var(--at-ink-tertiary)]">知我实验室</p>
  );
}

const TYPE_LABELS: { code: string; label: string }[] = [
  { code: "SECURE", label: "安全型" },
  { code: "ANXIOUS", label: "焦虑型" },
  { code: "AVOIDANT", label: "回避型" },
  { code: "FEARFUL", label: "恐惧型" },
];

function AttachmentTypeLegend({ currentCode }: { currentCode: string }) {
  const upper = currentCode.trim().toUpperCase();
  return (
    <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
      {TYPE_LABELS.map(({ code, label }) => {
        const token = attachmentTypeColorVar(code);
        const active = code === upper;
        return (
          <li
            key={code}
            className={`flex items-center gap-2 text-xs ${
              active ? "font-bold" : "font-normal text-[var(--at-ink-tertiary)]"
            }`}
            style={active ? { color: token } : undefined}
          >
            <span
              className={`inline-block shrink-0 rounded-full ${
                active ? "size-3" : "size-1.5"
              }`}
              style={{ backgroundColor: token }}
              aria-hidden
            />
            {label}
          </li>
        );
      })}
    </ul>
  );
}

function DimensionScoreCards({
  anxietyScore,
  avoidanceScore,
}: {
  anxietyScore: number;
  avoidanceScore: number;
}) {
  return (
    <div className="mt-8 grid grid-cols-2 gap-3">
      <div
        className="rounded-2xl border border-[var(--at-border)] border-t-2 bg-white p-4"
        style={{ borderTopColor: "var(--color-type-anxious)" }}
      >
        <p className="text-xs text-[var(--at-ink-tertiary)]">焦虑维度</p>
        <p className="mt-1 text-3xl font-bold tabular-nums text-[var(--at-ink)]">
          {formatScore(anxietyScore)}
        </p>
        <p className="mt-1 text-xs text-[var(--at-ink-tertiary)]">满分 7 分</p>
      </div>
      <div
        className="rounded-2xl border border-[var(--at-border)] border-t-2 bg-white p-4"
        style={{ borderTopColor: "var(--color-type-avoidant)" }}
      >
        <p className="text-xs text-[var(--at-ink-tertiary)]">回避维度</p>
        <p className="mt-1 text-3xl font-bold tabular-nums text-[var(--at-ink)]">
          {formatScore(avoidanceScore)}
        </p>
        <p className="mt-1 text-xs text-[var(--at-ink-tertiary)]">满分 7 分</p>
      </div>
    </div>
  );
}

function TypeResultSeal({
  typeCode,
  accent,
}: {
  typeCode: string;
  accent: string;
}) {
  const initial = typeInitialChar(typeCode);
  return (
    <div
      className="mt-6 flex size-[5.5rem] shrink-0 items-center justify-center rounded-full border-4 bg-transparent"
      style={{ borderColor: hexToRgba(accent, 0.4) }}
      aria-hidden
    >
      <div
        className="flex size-14 items-center justify-center rounded-full text-2xl font-bold text-white"
        style={{ backgroundColor: accent }}
      >
        {initial}
      </div>
    </div>
  );
}

function ReportLoadError({ message }: { message: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <h1 className="at-font-serif mb-2 text-xl font-semibold text-[var(--at-ink)]">
        暂时无法加载报告
      </h1>
      <p className="mb-8 text-sm leading-relaxed text-[var(--at-ink-secondary)]">
        {message}
      </p>
      <Link
        href="/attachment-test"
        className="text-sm font-medium text-[var(--at-primary)] underline underline-offset-4"
      >
        返回问卷页
      </Link>
    </div>
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { responseId } = await params;
  const result = await fetchAttachmentReportData(responseId);
  if (!result.ok) {
    return { title: "依恋报告 | 知我实验室" };
  }
  const { type_name, nickname } = result.data;
  const nick = nickname?.trim();
  return {
    title: nick ? `${nick}的依恋报告 · ${type_name}` : `依恋报告 · ${type_name}`,
    description: "知我实验室 · 依恋类型深度解读报告",
  };
}

export default async function ReportH5Page({ params }: PageProps) {
  const { responseId } = await params;
  const result = await fetchAttachmentReportData(responseId);

  if (!result.ok) {
    if (result.status === 404) notFound();
    return <ReportLoadError message={result.message} />;
  }

  const data = result.data;
  const accent = attachmentTypeAccentColor(data.type_code);
  const nick = data.nickname?.trim();
  const downloadHref = `/api/download/${encodeURIComponent(responseId)}`;

  const rootStyle = {
    ...ATTACHMENT_TYPE_CSS_VARS,
    "--report-accent": accent,
  } as CSSProperties;

  return (
    <div style={rootStyle}>
      <header className="flex flex-col items-center border-b border-[var(--at-border)] pb-6 text-center">
        <ZhiwoBrandRow />
        <TypeResultSeal typeCode={data.type_code} accent={accent} />
        <h1
          className="at-font-serif mt-4 text-3xl font-semibold leading-tight"
          style={{ color: accent }}
        >
          {data.type_name}
        </h1>
        <p className="mt-2 text-sm text-[var(--at-ink-tertiary)]">依恋类型深度解读报告</p>
        {nick ? (
          <p className="mt-2 text-sm text-[var(--at-ink-secondary)]">致 {nick}</p>
        ) : null}

        <DimensionScoreCards
          anxietyScore={data.anxiety_score}
          avoidanceScore={data.avoidance_score}
        />

        <AttachmentTypeLegend currentCode={data.type_code} />
      </header>

      <main>
        {SECTION_ORDER.map(({ key, title }, index) => {
          const body = data.sections?.[key];
          const md = typeof body === "string" ? body : "";
          return (
            <section
              key={key}
              className={
                index === 0
                  ? "mt-8"
                  : "mt-8 border-t border-[var(--at-border)] pt-8"
              }
            >
              <h2 className="at-font-serif mb-3 text-xl font-semibold text-[var(--at-ink)]">
                {title}
              </h2>
              <ReportMarkdown markdown={md} />
            </section>
          );
        })}
      </main>

      <footer className="mt-10">
        <a
          href={downloadHref}
          className="at-btn-primary flex w-full items-center justify-center no-underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          保存报告
        </a>
        <p className="mt-2 text-center text-xs text-[var(--at-ink-tertiary)]">
          不想保存报告？发送「报告」给知我实验室服务号，随时可以找回
        </p>
        <p className="mt-6 text-center text-xs leading-relaxed text-[var(--at-ink-tertiary)]">
          知我实验室出品 · 仅供个人参考
        </p>
      </footer>
    </div>
  );
}
