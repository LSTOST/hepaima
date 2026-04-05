"use client";

import type { AttachmentAnswerKey } from "@/lib/attachment-test/questions";

const VALUES = [1, 2, 3, 4, 5, 6, 7] as const;

interface LikertScale7Props {
  questionKey: AttachmentAnswerKey;
  value: number | undefined;
  onSelect: (v: number) => void;
}

export function LikertScale7({ questionKey, value, onSelect }: LikertScale7Props) {
  return (
    <div className="w-full">
      <div className="mb-2 flex justify-between gap-1 text-[0.75rem] leading-tight text-[var(--at-ink-tertiary)]">
        <span className="max-w-[5rem] shrink-0">完全不符合</span>
        <span className="max-w-[5rem] shrink-0 text-right">完全符合</span>
      </div>
      <div
        className="flex w-full justify-between gap-1"
        role="radiogroup"
        aria-labelledby={`q-label-${questionKey}`}
      >
        {VALUES.map((n) => {
          const selected = value === n;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={selected}
              className={[
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-transform active:scale-[0.98]",
                selected
                  ? "bg-[var(--at-primary)] text-white"
                  : "border border-[var(--at-border)] bg-[var(--at-surface-raised)] text-[var(--at-ink-secondary)]",
              ].join(" ")}
              onClick={() => onSelect(n)}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}
