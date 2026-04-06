import { getAttachmentReportBaseUrl } from "./upstream";
import type { AttachmentReportData } from "./types";

export type FetchReportResult =
  | { ok: true; data: AttachmentReportData }
  | { ok: false; status: number; message: string };

export async function fetchAttachmentReportData(
  responseId: string
): Promise<FetchReportResult> {
  const id = responseId.trim();
  if (!id) {
    return { ok: false, status: 400, message: "缺少 responseId" };
  }

  const upstreamUrl = new URL(
    `/report-data/${encodeURIComponent(id)}`,
    `${getAttachmentReportBaseUrl()}/`
  );

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
  } catch {
    return {
      ok: false,
      status: 502,
      message: "无法连接报告服务，请稍后重试",
    };
  }

  const text = await upstream.text();
  if (!upstream.ok) {
    try {
      const j = JSON.parse(text) as { error?: string; message?: string };
      const msg =
        typeof j.error === "string"
          ? j.error
          : typeof j.message === "string"
            ? j.message
            : `加载失败（${upstream.status}）`;
      return { ok: false, status: upstream.status, message: msg };
    } catch {
      return {
        ok: false,
        status: upstream.status,
        message: text.slice(0, 200) || `加载失败（${upstream.status}）`,
      };
    }
  }

  try {
    const data = JSON.parse(text) as AttachmentReportData;
    return { ok: true, data };
  } catch {
    return { ok: false, status: 502, message: "报告数据格式无效" };
  }
}
