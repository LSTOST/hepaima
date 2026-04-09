export default function AttachmentTestResultPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="at-font-serif text-2xl font-semibold leading-[1.4] text-[var(--at-ink)]">
        报告已完成
      </h1>
      <p className="mt-2 text-base leading-relaxed text-[var(--at-ink-secondary)]">
        稍后通过微信发送，请查收。
      </p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--at-ink-tertiary)]">
        可以关闭此页面。
      </p>
    </div>
  );
}
