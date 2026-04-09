"use client";

import { motion } from "framer-motion";
import type { AttachmentAnswerKey } from "@/lib/attachment-test/questions";

const VALUES = [1, 2, 3, 4, 5, 6, 7] as const;

/** 两端 44px，向中间递减至 32px（index 0..6 对应分值 1..7） */
function diameterPx(index: number): number {
  const center = 3;
  return 32 + 12 * (Math.abs(index - center) / 3);
}

interface LikertScale7Props {
  questionKey: AttachmentAnswerKey;
  value: number | undefined;
  onSelect: (v: number) => void;
  /** 选中后跳转前的 300ms 内为 true，禁止连点 */
  disabled?: boolean;
}

export function LikertScale7({
  questionKey,
  value,
  onSelect,
  disabled = false,
}: LikertScale7Props) {
  return (
    <div className="w-full">
      <div className="mb-2 flex justify-between text-xs leading-tight text-[var(--at-ink-tertiary)]">
        <span className="shrink-0 text-left">完全不符合</span>
        <span className="shrink-0 text-right">完全符合</span>
      </div>
      <div
        className="flex w-full items-end justify-between"
        role="radiogroup"
        aria-labelledby={`q-label-${questionKey}`}
      >
        {VALUES.map((n, i) => {
          const selected = value === n;
          const d = diameterPx(i);
          const fontSize = Math.round(d * 0.36);
          return (
            <motion.button
              key={n}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              style={{
                width: d,
                height: d,
                fontSize,
              }}
              className="flex shrink-0 items-center justify-center rounded-full border-[1.5px] font-medium text-[var(--at-ink-secondary)] disabled:opacity-60"
              initial={false}
              animate={{
                scale: selected ? 1.15 : 1,
                backgroundColor: selected
                  ? "var(--at-primary)"
                  : "var(--at-surface-raised)",
                borderColor: selected ? "var(--at-primary)" : "var(--at-border)",
                color: selected ? "#ffffff" : undefined,
              }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              whileHover={
                selected || disabled
                  ? undefined
                  : {
                      scale: 1.05,
                      borderColor: "var(--at-primary-light)",
                    }
              }
              whileTap={disabled ? undefined : { scale: 0.98 }}
              onClick={() => {
                if (!disabled) onSelect(n);
              }}
            >
              {n}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
