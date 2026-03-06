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

function normalizePrivateKey(key: string): string {
  let k = key.trim().replace(/\\n/g, "\n");
  const beginMatch = k.match(/-----BEGIN (?:RSA )?PRIVATE KEY-----/);
  const endMatch = k.match(/-----END (?:RSA )?PRIVATE KEY-----/);
  if (beginMatch && endMatch) {
    const begin = beginMatch[0];
    const end = endMatch[0];
    const middle = k
      .replace(begin, "")
      .replace(end, "")
      .replace(/\s/g, "");
    const lines = middle.match(/.{1,64}/g) || [];
    k = `${begin}\n${lines.join("\n")}\n${end}`;
  } else if (!k.includes("-----BEGIN")) {
    const base64 = k.replace(/\s/g, "");
    const lines = base64.match(/.{1,64}/g) || [];
    k = "-----BEGIN PRIVATE KEY-----\n" + lines.join("\n") + "\n-----END PRIVATE KEY-----";
  }
  return k;
}

/** 根据私钥内容判断格式：BEGIN RSA PRIVATE KEY 为 PKCS1，BEGIN PRIVATE KEY 为 PKCS8 */
function getKeyType(privateKey: string): "PKCS8" | "PKCS1" {
  const envType = process.env.ALIPAY_KEY_TYPE?.toUpperCase();
  if (envType === "PKCS1" || envType === "PKCS8") return envType as "PKCS8" | "PKCS1";
  return privateKey.includes("RSA PRIVATE KEY") ? "PKCS1" : "PKCS8";
}

function normalizePublicKey(key: string): string {
  let k = key.trim().replace(/\\n/g, "\n");
  const beginMatch = k.match(/-----BEGIN PUBLIC KEY-----/);
  const endMatch = k.match(/-----END PUBLIC KEY-----/);
  if (beginMatch && endMatch) {
    const begin = beginMatch[0];
    const end = endMatch[0];
    const middle = k
      .replace(begin, "")
      .replace(end, "")
      .replace(/\s/g, "");
    const lines = middle.match(/.{1,64}/g) || [];
    k = `${begin}\n${lines.join("\n")}\n${end}`;
  } else if (!k.includes("-----BEGIN")) {
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
    const privateKey = normalizePrivateKey(PRIVATE_KEY);
    const keyType = getKeyType(privateKey);
    alipayInstance = new AlipaySdk({
      appId: APP_ID,
      privateKey,
      alipayPublicKey: normalizePublicKey(ALIPAY_PUBLIC_KEY),
      gateway: GATEWAY,
      keyType,
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

/** 当面付-预创建：生成二维码串，PC 端展示给用户扫码（仅需签约「当面付」） */
export async function createAlipayPrecreate(params: {
  outTradeNo: string;
  subject: string;
  totalAmountYuan: string;
  body?: string;
}): Promise<{ qr_code: string }> {
  const sdk = getAlipaySdk();
  const res = await (sdk as {
    exec: (method: string, params: Record<string, unknown>) => Promise<Record<string, unknown>>;
  }).exec("alipay.trade.precreate", {
    notify_url: `${BASE_URL}/api/v1/payment/alipay/notify`,
    bizContent: {
      out_trade_no: params.outTradeNo,
      total_amount: params.totalAmountYuan,
      subject: params.subject,
      body: params.body ?? "合拍吗报告解锁",
    },
  });

  // 兼容多种返回结构：v2/v3、data 字符串或已解析对象
  let payload: any = res;
  if (payload?.data) {
    try {
      const dataObj = typeof payload.data === "string" ? JSON.parse(payload.data) : payload.data;
      if (dataObj?.alipay_trade_precreate_response) {
        payload = dataObj.alipay_trade_precreate_response;
      } else {
        payload = dataObj;
      }
    } catch {
      // ignore JSON parse error, fallback to original payload
    }
  } else if (payload?.alipay_trade_precreate_response) {
    payload = payload.alipay_trade_precreate_response;
  }

  const code = payload?.code as string | undefined;
  // SDK 可能返回驼峰 qrCode 或下划线 qr_code
  const qrCode =
    (payload?.qr_code as string | undefined) || (payload?.qrCode as string | undefined);

  if (code !== "10000" || !qrCode) {
    const subMsg = (payload?.sub_msg as string) || (payload?.msg as string) || "";
    console.error("Alipay precreate raw response:", JSON.stringify(res));
    throw new Error(subMsg ? `支付宝预创建失败: ${subMsg}` : "支付宝预创建失败");
  }

  return { qr_code: qrCode };
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
