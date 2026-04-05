export default function AttachmentTestResultPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-2 text-center">
      <h1 className="at-font-serif mb-4 text-2xl font-semibold text-[var(--at-ink)]">
        报告已生成
      </h1>
      <p className="mb-6 max-w-[20rem] text-base leading-relaxed text-[var(--at-ink-secondary)]">
        请返回知我实验室服务号，报告链接已发送
      </p>
      <p className="max-w-[22rem] text-sm leading-relaxed text-[var(--at-ink-tertiary)]">
        如未收到，请在服务号内发送「报告」重新获取
      </p>
    </div>
  );
}
