/**
 * 微信支付 V3：Native（扫码）、H5、下单与回调验签/解密
 * 依赖 wechatpay-node-v3，证书与密钥通过环境变量配置
 */
import fs from "node:fs";
import path from "node:path";
import WxPay from "wechatpay-node-v3";
import { TIER_AMOUNT_CENTS } from "./constants";

const MCH_ID = process.env.WECHAT_PAY_MCH_ID;
const APP_ID = process.env.WECHAT_PAY_APP_ID;
const API_V3_KEY = process.env.WECHAT_PAY_API_V3_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://hepaima.kyx123.com";

function getCertPath(filename: string): string {
  const dir = process.env.WECHAT_PAY_CERT_DIR || path.join(process.cwd(), "certs", "wechat");
  return path.join(dir, filename);
}

let wxPayInstance: InstanceType<typeof WxPay> | null = null;

/** 获取微信支付实例（公钥=证书 pem，私钥=apiclient_key.pem） */
export function getWxPay(): InstanceType<typeof WxPay> {
  if (!MCH_ID || !APP_ID || !API_V3_KEY) {
    throw new Error("微信支付环境变量未配置：WECHAT_PAY_MCH_ID / WECHAT_PAY_APP_ID / WECHAT_PAY_API_V3_KEY");
  }
  const certPath = getCertPath("apiclient_cert.pem");
  const keyPath = getCertPath("apiclient_key.pem");
  if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
    throw new Error("微信支付证书文件不存在，请将 apiclient_cert.pem、apiclient_key.pem 放到 certs/wechat/ 或 WECHAT_PAY_CERT_DIR 指定目录");
  }
  if (!wxPayInstance) {
    wxPayInstance = new WxPay({
      appid: APP_ID,
      mchid: MCH_ID,
      publicKey: fs.readFileSync(certPath),
      privateKey: fs.readFileSync(keyPath),
      key: API_V3_KEY,
    });
  }
  return wxPayInstance;
}

/** 从微信 API 响应或异常中提取错误文案，便于排查 */
function getWechatErrorDetail(result: Record<string, unknown> | null, fallback = ""): string {
  if (!result || typeof result !== "object") return fallback;
  const data = (result.data as Record<string, unknown>) || result;
  const parts = [
    (data.errcode as string) || (result.errcode as string),
    (data.errmsg as string) || (result.errmsg as string),
    (data.message as string) || (result.message as string),
    (data.code as string) ? `${data.code}: ${(data.message as string) || ""}`.trim() : null,
  ].filter(Boolean);
  if (parts.length) return parts.join(" ");
  try {
    const raw = JSON.stringify(data);
    if (raw && raw !== "{}") return raw;
  } catch {
    // ignore
  }
  return fallback;
}

/** 创建 Native 支付订单（PC 扫码），返回 code_url */
export async function createWechatNativeOrder(params: {
  outTradeNo: string;
  description: string;
  amountCents: number;
}): Promise<{ code_url: string }> {
  const pay = getWxPay();
  let result: Record<string, unknown> & { status?: number; code_url?: string };
  try {
    result = (await pay.transactions_native({
      description: params.description,
      out_trade_no: params.outTradeNo,
      notify_url: `${BASE_URL}/api/v1/payment/wechat/notify`,
      amount: { total: params.amountCents, currency: "CNY" },
    })) as typeof result;
  } catch (e: unknown) {
    const err = e as { message?: string; response?: { data?: Record<string, unknown> } };
    const msg = err?.message ?? String(e);
    const apiDetail = err?.response?.data ? getWechatErrorDetail(err.response.data, "") : "";
    const fullMsg = apiDetail ? `微信 Native 下单异常: ${apiDetail}` : `微信 Native 下单异常: ${msg}`;
    console.error("[WeChat Native] 请求异常:", fullMsg, "原始 error:", err?.response?.data ?? msg);
    throw new Error(fullMsg);
  }
  const codeUrl = (result.data as { code_url?: string } | undefined)?.code_url ?? result.code_url;
  if (result.status !== 200 || !codeUrl) {
    const detail = getWechatErrorDetail(result, "");
    console.error("[WeChat Native] 非 200 或缺少 code_url, 完整响应:", JSON.stringify(result));
    throw new Error(detail ? `微信 Native 下单失败: ${detail}` : `微信 Native 下单失败(无详情)，status=${result.status}`);
  }
  return { code_url: codeUrl };
}

/** 创建 H5 支付订单（手机浏览器），返回 h5_url */
export async function createWechatH5Order(params: {
  outTradeNo: string;
  description: string;
  amountCents: number;
  clientIp?: string;
}): Promise<{ h5_url: string }> {
  const pay = getWxPay();
  let result: Record<string, unknown> & { status?: number; h5_url?: string };
  try {
    result = (await pay.transactions_h5({
      description: params.description,
      out_trade_no: params.outTradeNo,
      notify_url: `${BASE_URL}/api/v1/payment/wechat/notify`,
      amount: { total: params.amountCents, currency: "CNY" },
      scene_info: {
        payer_client_ip: params.clientIp || "127.0.0.1",
        h5_info: {
          type: "Wap",
          app_name: "合拍吗",
          app_url: BASE_URL,
        },
      },
    })) as typeof result;
  } catch (e: unknown) {
    const err = e as { message?: string; response?: { data?: Record<string, unknown> } };
    const msg = err?.message ?? String(e);
    const apiDetail = err?.response?.data ? getWechatErrorDetail(err.response.data, "") : "";
    const fullMsg = apiDetail ? `微信 H5 下单异常: ${apiDetail}` : `微信 H5 下单异常: ${msg}`;
    console.error("[WeChat H5] 请求异常:", fullMsg, "原始 error:", err?.response?.data ?? msg);
    throw new Error(fullMsg);
  }
  const h5Url = (result.data as { h5_url?: string } | undefined)?.h5_url ?? result.h5_url;
  if (result.status !== 200 || !h5Url) {
    const detail = getWechatErrorDetail(result, "");
    console.error("[WeChat H5] 非 200 或缺少 h5_url, 完整响应:", JSON.stringify(result));
    throw new Error(detail ? `微信 H5 下单失败: ${detail}` : `微信 H5 下单失败(无详情)，status=${result.status}`);
  }
  return { h5_url: h5Url };
}

/** 验签：请求头 + 原始 body 字符串 */
export async function verifyWechatNotifySign(
  headers: Record<string, string | undefined>,
  bodyRaw: string
): Promise<boolean> {
  const pay = getWxPay();
  const signature = headers["wechatpay-signature"] ?? headers["Wechatpay-Signature"];
  const serial = headers["wechatpay-serial"] ?? headers["Wechatpay-Serial"];
  const nonce = headers["wechatpay-nonce"] ?? headers["Wechatpay-Nonce"];
  const timestamp = headers["wechatpay-timestamp"] ?? headers["Wechatpay-Timestamp"];
  if (!signature || !serial || !nonce || !timestamp) return false;
  const ret = await pay.verifySign({
    body: bodyRaw,
    signature,
    serial,
    nonce,
    timestamp,
  });
  return !!ret;
}

/** 解密回调 resource（AES-256-GCM） */
export function decryptWechatNotifyResource(resource: {
  ciphertext: string;
  nonce: string;
  associated_data?: string;
}): {
  out_trade_no: string;
  trade_state: string;
  transaction_id?: string;
  amount?: { total: number };
} {
  const pay = getWxPay();
  const decrypted = pay.decipher_gcm(
    resource.ciphertext,
    resource.associated_data ?? "",
    resource.nonce,
    API_V3_KEY!
  );
  return decrypted as {
    out_trade_no: string;
    trade_state: string;
    transaction_id?: string;
    amount?: { total: number };
  };
}

export { TIER_AMOUNT_CENTS };
