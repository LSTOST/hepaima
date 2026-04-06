/**
 * attachment-report 服务根地址（无尾部斜杠）。
 * 生产环境请设置 ATTACHMENT_REPORT_BASE_URL，例如 https://report.example.com
 */
export function getAttachmentReportBaseUrl(): string {
  const raw = process.env.ATTACHMENT_REPORT_BASE_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  return "http://127.0.0.1:8001";
}
