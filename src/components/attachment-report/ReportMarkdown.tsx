import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

const components: Partial<Components> = {
  h1: ({ children, ...props }) => (
    <h1
      className="at-font-serif mt-8 mb-3 text-2xl font-semibold leading-[1.4] text-[var(--at-ink)] first:mt-0"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2
      className="mt-6 mb-2 text-lg font-semibold leading-[1.4] text-[var(--at-primary)]"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      className="mt-5 mb-2 text-base font-semibold leading-[1.4] text-[var(--at-ink)]"
      {...props}
    >
      {children}
    </h3>
  ),
  p: ({ children, ...props }) => (
    <p
      className="mb-4 text-base leading-[1.7] text-[var(--at-ink)] last:mb-0"
      {...props}
    >
      {children}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul
      className="mb-4 list-disc space-y-2 pl-5 text-base leading-[1.7] text-[var(--at-ink)]"
      {...props}
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol
      className="mb-4 list-decimal space-y-2 pl-5 text-base leading-[1.7] text-[var(--at-ink)]"
      {...props}
    >
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="pl-1 marker:text-[var(--at-ink-tertiary)]" {...props}>
      {children}
    </li>
  ),
  strong: ({ children, ...props }) => (
    <strong className="font-semibold text-[var(--at-ink)]" {...props}>
      {children}
    </strong>
  ),
  a: ({ children, ...props }) => (
    <a
      className="font-medium text-[var(--at-primary)] underline decoration-[var(--at-border)] underline-offset-4"
      {...props}
    >
      {children}
    </a>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="mb-4 border-l-[3px] pl-4 text-base leading-[1.7] text-[var(--at-ink-secondary)]"
      style={{ borderLeftColor: "var(--report-accent, var(--at-primary))" }}
      {...props}
    >
      {children}
    </blockquote>
  ),
  hr: (props) => (
    <hr className="my-8 border-0 border-t border-[var(--at-border)]" {...props} />
  ),
  pre: ({ children, ...props }) => (
    <pre
      className="mb-4 overflow-x-auto rounded-2xl border border-[var(--at-border)] bg-[var(--at-surface-raised)] p-4 text-sm leading-relaxed text-[var(--at-ink)]"
      {...props}
    >
      {children}
    </pre>
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = typeof className === "string" && className.includes("language-");
    if (isBlock) {
      return (
        <code className={`text-sm ${className ?? ""}`} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded-md bg-[#F0EBFA] px-1.5 py-0.5 text-[0.875em] text-[var(--at-ink)]"
        {...props}
      >
        {children}
      </code>
    );
  },
};

export function ReportMarkdown({ markdown }: { markdown: string }) {
  if (!markdown?.trim()) {
    return (
      <p className="text-sm leading-relaxed text-[var(--at-ink-tertiary)]">本节暂无内容</p>
    );
  }
  return (
    <div className="report-md">
      <ReactMarkdown components={components}>{markdown}</ReactMarkdown>
    </div>
  );
}
