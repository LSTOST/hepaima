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

/** 创建 Native 支付订单（PC 扫码），返回 code_url */
export async function createWechatNativeOrder(params: {
  outTradeNo: string;
  description: string;
  amountCents: number;
}): Promise<{ code_url: string }> {
  const pay = getWxPay();
  let result: { status?: number; code_url?: string; errcode?: string; errmsg?: string; message?: string };
  try {
    result = await pay.transactions_native({
      description: params.description,
      out_trade_no: params.outTradeNo,
      notify_url: `${BASE_URL}/api/v1/payment/wechat/notify`,
      amount: { total: params.amountCents, currency: "CNY" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`微信 Native 下单异常: ${msg}`);
  }
  if (result.status !== 200 || !result.code_url) {
    const detail = [result.errcode, result.errmsg, result.message].filter(Boolean).join(" ");
    throw new Error(detail ? `微信 Native 下单失败: ${detail}` : "微信 Native 下单失败");
  }
  return { code_url: result.code_url };
}

/** 创建 H5 支付订单（手机浏览器），返回 h5_url */
export async function createWechatH5Order(params: {
  outTradeNo: string;
  description: string;
  amountCents: number;
  clientIp?: string;
}): Promise<{ h5_url: string }> {
  const pay = getWxPay();
  let result: { status?: number; h5_url?: string; errcode?: string; errmsg?: string; message?: string };
  try {
    result = await pay.transactions_h5({
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
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`微信 H5 下单异常: ${msg}`);
  }
  if (result.status !== 200 || !result.h5_url) {
    const detail = [result.errcode, result.errmsg, result.message].filter(Boolean).join(" ");
    throw new Error(detail ? `微信 H5 下单失败: ${detail}` : "微信 H5 下单失败");
  }
  return { h5_url: result.h5_url };
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
