import type { CSSProperties } from "react";

type IconProps = {
  className?: string;
  style?: CSSProperties;
  "aria-hidden"?: boolean;
};

/** 16×16 视口，线条图标；用 className 控制外框尺寸（如 size-4 / size-5） */
export function AttachmentTypeLineIcon({
  code,
  className,
  style,
  "aria-hidden": ariaHidden = true,
}: IconProps & { code: string }) {
  const c = code.trim().toUpperCase();
  const common = {
    viewBox: "0 0 16 16",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.35,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    style,
    "aria-hidden": ariaHidden,
  };

  switch (c) {
    case "SECURE":
      return (
        <svg {...common}>
          <path d="M1.5 8c1.4-1.35 2.7 1.35 4.1 0s2.7 1.35 4.1 0 2.7 1.35 4.1 0 2.6-1.35 3.8 0" />
        </svg>
      );
    case "ANXIOUS":
      return (
        <svg {...common}>
          <path d="M9.35 1.5L4.6 9.25h3.05L6.15 14.5 12.4 6.05H9.3L9.35 1.5z" />
        </svg>
      );
    case "AVOIDANT":
      return (
        <svg {...common}>
          <path d="M8 1.25L2.75 3.25v4.2c0 3.35 2.65 6.15 5.25 7.3 2.6-1.15 5.25-3.95 5.25-7.3V3.25L8 1.25z" />
        </svg>
      );
    case "FEARFUL":
      return (
        <svg {...common}>
          <path d="M8 11.6v.01M6.15 5.9a1.85 1.85 0 1 1 2.1 2.95c-.45.35-.75.75-.75 1.35" />
          <circle cx="8" cy="13.35" r="0.9" fill="currentColor" stroke="none" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="6.5" />
        </svg>
      );
  }
}
