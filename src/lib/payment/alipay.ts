/**
 * 支付宝：电脑网站支付、手机网站支付、异步通知验签
 * 依赖 alipay-sdk，公钥模式（应用私钥 + 支付宝公钥）
 */
import { AlipaySdk } from "alipay-sdk";
import { getTierAmountYuan } from "./constants";

const APP_ID = process.env.ALIPAY_APP_ID;
const PRIVATE_KEY = process.env.ALIPAY_PRIVATE_KEY;
const ALIPAY_PUBLIC_KEY = process.env.ALIPAY_ALIPAY_PUBLIC_KEY;
const GATEWAY = process.env.ALIPAY_GATEWAY || "https://openapi.alipay.com/gateway.do";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://hepaima.kyx123.com";
/** 私钥格式：支付宝密钥工具默认生成 PKCS8，与 PKCS1 不兼容。填 PKCS8 或 PKCS1，不填默认为 PKCS8 */
const KEY_TYPE = (process.env.ALIPAY_KEY_TYPE || "PKCS8") as "PKCS8" | "PKCS1";

function normalizePrivateKey(key: string): string {
  let k = key.trim().replace(/\\n/g, "\n");
  if (!k.includes("-----BEGIN")) {
    const base64 = k.replace(/\s/g, "");
    const lines = base64.match(/.{1,64}/g) || [];
    k = "-----BEGIN PRIVATE KEY-----\n" + lines.join("\n") + "\n-----END PRIVATE KEY-----";
  }
  return k;
}

function normalizePublicKey(key: string): string {
  let k = key.trim().replace(/\\n/g, "\n");
  if (!k.includes("-----BEGIN")) {
    const base64 = k.replace(/\s/g, "");
    const lines = base64.match(/.{1,64}/g) || [];
    k = "-----BEGIN PUBLIC KEY-----\n" + lines.join("\n") + "\n-----END PUBLIC KEY-----";
  }
  return k;
}

let alipayInstance: AlipaySdk | null = null;

/** 获取支付宝 SDK 实例（公钥模式） */
export function getAlipaySdk(): AlipaySdk {
  if (!APP_ID || !PRIVATE_KEY || !ALIPAY_PUBLIC_KEY) {
    throw new Error("支付宝环境变量未配置：ALIPAY_APP_ID / ALIPAY_PRIVATE_KEY / ALIPAY_ALIPAY_PUBLIC_KEY");
  }
  if (!alipayInstance) {
    alipayInstance = new AlipaySdk({
      appId: APP_ID,
      privateKey: normalizePrivateKey(PRIVATE_KEY),
      alipayPublicKey: normalizePublicKey(ALIPAY_PUBLIC_KEY),
      gateway: GATEWAY,
      keyType: KEY_TYPE,
    });
  }
  return alipayInstance;
}

/** 电脑网站支付：返回 POST 表单 HTML，前端提交后跳转支付宝收银台 */
export function createAlipayPagePay(params: {
  outTradeNo: string;
  subject: string;
  totalAmountYuan: string;
  body?: string;
}): string {
  const sdk = getAlipaySdk();
  const html = sdk.pageExecute(
    "alipay.trade.page.pay",
    "POST",
    {
      bizContent: {
        out_trade_no: params.outTradeNo,
        product_code: "FAST_INSTANT_TRADE_PAY",
        subject: params.subject,
        body: params.body ?? "合拍吗报告解锁",
        total_amount: params.totalAmountYuan,
      },
      returnUrl: `${BASE_URL}/result/return`,
      notifyUrl: `${BASE_URL}/api/v1/payment/alipay/notify`,
    } as Parameters<AlipaySdk["pageExecute"]>[2]
  );
  return html;
}

/** 手机网站支付：返回 GET 跳转 URL，前端 location.href 即可 */
export function createAlipayWapPay(params: {
  outTradeNo: string;
  subject: string;
  totalAmountYuan: string;
  body?: string;
}): string {
  const sdk = getAlipaySdk();
  const url = sdk.pageExecute(
    "alipay.trade.wap.pay",
    "GET",
    {
      bizContent: {
        out_trade_no: params.outTradeNo,
        product_code: "QUICK_WAP_WAY",
        subject: params.subject,
        body: params.body ?? "合拍吗报告解锁",
        total_amount: params.totalAmountYuan,
      },
      returnUrl: `${BASE_URL}/result/return`,
      notifyUrl: `${BASE_URL}/api/v1/payment/alipay/notify`,
    } as Parameters<AlipaySdk["pageExecute"]>[2]
  );
  return url;
}

/** 异步通知验签（POST body 为 form 键值对） */
export function verifyAlipayNotifySign(postData: Record<string, string>): boolean {
  const sdk = getAlipaySdk();
  return sdk.checkNotifySignV2(postData);
}

export { getTierAmountYuan };
