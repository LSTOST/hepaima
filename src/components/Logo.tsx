/**
 * 导航栏 Logo：与报告页一致的两行样式（合拍吗 + hepaima.com）
 * 使用方用 Link 包裹即可实现点击回首页
 */
export function Logo({ size = "md", className = "" }: { size?: "sm" | "md"; className?: string }) {
  const isSm = size === "sm";
  return (
    <div className={`flex flex-col items-start leading-tight ${className}`}>
      <span
        className="font-[family-name:var(--font-brand)] font-bold bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] bg-clip-text text-transparent tracking-widest"
        style={{ fontSize: isSm ? 16 : 20 }}
      >
        合拍吗
      </span>
      <span
        className="font-[family-name:var(--font-brand)] text-gray-400 tracking-widest"
        style={{ fontSize: isSm ? 9 : 10 }}
      >
        hepaima.com
      </span>
    </div>
  );
}
