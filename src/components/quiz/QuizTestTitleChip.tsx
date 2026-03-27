import type { LucideIcon } from "lucide-react";

/** 与昵称页/答题顶栏设计稿一致：浅粉胶囊 + 品红细边，图标与文案同色 */
const baseClass =
  "inline-flex max-w-full min-w-0 items-center gap-2 rounded-full border border-[#EC4899] bg-pink-50 px-4 py-2 text-sm font-medium text-[#EC4899]";

export function QuizTestTitleChip({
  label,
  icon: Icon,
  className = "",
}: {
  label: string;
  icon: LucideIcon;
  className?: string;
}) {
  return (
    <div className={`${baseClass} ${className}`.trim()}>
      <Icon className="h-4 w-4 shrink-0 text-[#EC4899]" aria-hidden />
      <span className="truncate">{label}</span>
    </div>
  );
}
