import Link from "next/link";

export default function ReportNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-2 text-center">
      <h1 className="at-font-serif mb-2 text-xl font-semibold text-[var(--at-ink)]">
        未找到报告
      </h1>
      <p className="mb-8 text-sm leading-relaxed text-[var(--at-ink-secondary)]">
        链接可能已过期，或报告尚未生成。请返回服务号重新获取。
      </p>
      <Link
        href="/attachment-test"
        className="text-sm font-medium text-[var(--at-primary)] underline underline-offset-4"
      >
        去测依恋类型
      </Link>
    </div>
  );
}
