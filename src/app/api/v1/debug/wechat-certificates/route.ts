/**
 * 诊断接口：请求微信「平台证书」接口，返回真实 HTTP 状态与响应体
 * 用于排查「拉取平台证书失败」——SDK 不暴露微信返回的 status/body，此接口直接请求并返回
 * 仅当 ENABLE_DEBUG_ROUTES=true 时可用，用毕请关闭
 */
import { NextResponse } from "next/server";
import { getWxPay } from "@/lib/payment/wechat";

const WX_CERT_URL = "https://api.mch.weixin.qq.com/v3/certificates";

export async function GET() {
  if (process.env.ENABLE_DEBUG_ROUTES !== "true") {
    return NextResponse.json({ error: "未开启 ENABLE_DEBUG_ROUTES" }, { status: 404 });
  }
  try {
    const pay = getWxPay();
    const auth = (pay as { buildAuthorization(method: string, url: string, params?: unknown): string }).buildAuthorization(
      "GET",
      WX_CERT_URL
    );
    const res = await fetch(WX_CERT_URL, {
      method: "GET",
      headers: { Authorization: auth, "Content-Type": "application/json" },
    });
    const text = await res.text();
    let body: unknown = text;
    try {
      body = JSON.parse(text);
    } catch {
      // leave as string
    }
    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      body,
      hint:
        res.status !== 200
          ? "非 200 会导致验签时「拉取平台证书失败」。常见：网络不通、商户号/证书/APIv3 密钥错误、证书路径不对（cwd/certs/wechat 或 WECHAT_PAY_CERT_DIR）"
          : "拉取成功，验签应可用。可关闭 ENABLE_DEBUG_ROUTES。",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: msg, hint: "检查环境变量与证书路径、服务器能否访问 api.mch.weixin.qq.com" },
      { status: 500 }
    );
  }
}
