import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReportMarkdown } from "@/components/attachment-report/ReportMarkdown";
import { fetchAttachmentReportData } from "@/lib/attachment-report/fetch-report-data";
import { attachmentTypeAccentColor } from "@/lib/attachment-report/type-theme";
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

function ZhiwoBrandRow() {
  return (
    <div className="flex items-center justify-center gap-3">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-white"
        style={{ backgroundColor: "var(--at-primary)" }}
        aria-hidden
      >
        知
      </div>
      <div className="min-w-0 text-left">
        <p className="text-sm font-medium tracking-[0.2em] text-[var(--at-ink-secondary)]">
          知我实验室
        </p>
        <p className="text-xs text-[var(--at-ink-tertiary)]">依恋类型深度解读</p>
      </div>
    </div>
  );
}

function ReportLoadError({ message }: { message: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-2 text-center">
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

  return (
    <div style={{ "--report-accent": accent } as CSSProperties}>
      <header className="mb-8 flex flex-col items-center gap-6 text-center">
        <ZhiwoBrandRow />
        <div>
          <p
            className="at-font-serif mb-2 text-3xl font-semibold leading-tight"
            style={{ color: accent }}
          >
            {data.type_name}
          </p>
          {nick ? (
            <p className="text-sm text-[var(--at-ink-secondary)]">致 {nick}</p>
          ) : null}
        </div>
        <div className="at-card w-full text-left">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--at-ink-tertiary)]">
            维度得分
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-[var(--at-ink)]">
            <div>
              <span className="text-[var(--at-ink-secondary)]">焦虑维度</span>
              <span className="ml-2 font-semibold tabular-nums">
                {formatScore(data.anxiety_score)}
              </span>
            </div>
            <div>
              <span className="text-[var(--at-ink-secondary)]">回避维度</span>
              <span className="ml-2 font-semibold tabular-nums">
                {formatScore(data.avoidance_score)}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="space-y-2">
        {SECTION_ORDER.map(({ key, title }) => {
          const body = data.sections?.[key];
          const md = typeof body === "string" ? body : "";
          return (
            <section key={key} className="at-card mb-5">
              <h2 className="at-font-serif mb-4 text-xl font-semibold leading-tight text-[var(--at-ink)]">
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
        <p className="mt-4 text-center text-xs leading-relaxed text-[var(--at-ink-tertiary)]">
          了解自己，是一切关系的起点
        </p>
      </footer>
    </div>
  );
}
