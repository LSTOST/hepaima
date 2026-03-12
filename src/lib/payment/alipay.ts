/**
 * 支付宝：电脑网站支付、手机网站支付、异步通知验签
 * 优先使用后台 PaymentProviderConfig 配置，否则使用环境变量
 */
import { AlipaySdk } from "alipay-sdk";
import { getTierAmountYuan } from "./constants";
import { getPaymentProviderConfig } from "./config-db";

const APP_ID = process.env.ALIPAY_APP_ID;
const PRIVATE_KEY = process.env.ALIPAY_PRIVATE_KEY;
const ALIPAY_PUBLIC_KEY = process.env.ALIPAY_ALIPAY_PUBLIC_KEY;
const GATEWAY = process.env.ALIPAY_GATEWAY || "https://openapi.alipay.com/gateway.do";
const BASE_URL = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "https://hepaima.kyx123.com";

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

/** 获取支付宝 SDK 实例（优先数据库配置） */
export async function getAlipaySdk(): Promise<AlipaySdk> {
  const dbConfig = await getPaymentProviderConfig("ALIPAY");
  if (dbConfig?.appId && dbConfig?.privateKey && dbConfig?.publicKey) {
    const privateKey = normalizePrivateKey(dbConfig.privateKey);
    const keyType = getKeyType(privateKey);
    return new AlipaySdk({
      appId: dbConfig.appId,
      privateKey,
      alipayPublicKey: normalizePublicKey(dbConfig.publicKey),
      gateway: GATEWAY,
      keyType,
    });
  }
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
export async function createAlipayPagePay(params: {
  outTradeNo: string;
  subject: string;
  totalAmountYuan: string;
  body?: string;
}): Promise<string> {
  const sdk = await getAlipaySdk();
  const dbConfig = await getPaymentProviderConfig("ALIPAY");
  const notifyUrl = dbConfig?.notifyUrl || `${BASE_URL}/api/v1/payment/alipay/notify`;
  const returnUrl = `${BASE_URL}/result/return`;
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
      returnUrl,
      notifyUrl,
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
  const sdk = await getAlipaySdk();
  const dbConfig = await getPaymentProviderConfig("ALIPAY");
  const notifyUrl = dbConfig?.notifyUrl || `${BASE_URL}/api/v1/payment/alipay/notify`;
  console.log("[Alipay Precreate] notify_url:", notifyUrl, "| BASE_URL:", BASE_URL);
  const res = await (sdk as {
    exec: (method: string, params: Record<string, unknown>) => Promise<Record<string, unknown>>;
  }).exec("alipay.trade.precreate", {
    notify_url: notifyUrl,
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
export async function createAlipayWapPay(params: {
  outTradeNo: string;
  subject: string;
  totalAmountYuan: string;
  body?: string;
}): Promise<string> {
  const sdk = await getAlipaySdk();
  const dbConfig = await getPaymentProviderConfig("ALIPAY");
  const notifyUrl = dbConfig?.notifyUrl || `${BASE_URL}/api/v1/payment/alipay/notify`;
  const returnUrl = `${BASE_URL}/result/return`;
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
      returnUrl,
      notifyUrl,
    } as Parameters<AlipaySdk["pageExecute"]>[2]
  );
  return url;
}

/** 主动查询支付宝订单状态 */
export async function queryAlipayOrder(outTradeNo: string): Promise<{
  trade_status: string;
  trade_no?: string;
  total_amount?: string;
}> {
  const sdk = await getAlipaySdk();
  let res: Record<string, unknown>;
  try {
    res = await (sdk as {
      exec: (method: string, params: Record<string, unknown>) => Promise<Record<string, unknown>>;
    }).exec("alipay.trade.query", {
      bizContent: { out_trade_no: outTradeNo },
    });
  } catch (e) {
    console.error("[Alipay Query] SDK exec 异常:", e);
    throw new Error(`支付宝查单请求异常: ${e instanceof Error ? e.message : String(e)}`);
  }

  console.log("[Alipay Query] 原始响应:", JSON.stringify(res));

  let payload: Record<string, unknown> = res;
  if (payload?.data) {
    try {
      const dataObj = typeof payload.data === "string" ? JSON.parse(payload.data as string) : payload.data;
      payload = ((dataObj as Record<string, unknown>)?.alipay_trade_query_response as Record<string, unknown>) ?? (dataObj as Record<string, unknown>);
    } catch {
      // fallback
    }
  } else if (payload?.alipay_trade_query_response) {
    payload = payload.alipay_trade_query_response as Record<string, unknown>;
  }

  const code = (payload?.code as string) || (payload?.Code as string) || undefined;
  if (code !== "10000") {
    const subMsg = (payload?.sub_msg as string) || (payload?.subMsg as string)
      || (payload?.msg as string) || (payload?.Msg as string) || "";
    console.error("[Alipay Query] 查单业务失败, code:", code, "payload:", JSON.stringify(payload));
    throw new Error(subMsg ? `支付宝查单失败: ${subMsg}` : `支付宝查单失败(code=${code})`);
  }

  const tradeStatus = (payload.trade_status as string)
    || (payload.tradeStatus as string) || "UNKNOWN";
  const tradeNo = (payload.trade_no as string)
    || (payload.tradeNo as string) || undefined;
  const totalAmount = (payload.total_amount as string)
    || (payload.totalAmount as string) || undefined;

  console.log("[Alipay Query] 解析结果: trade_status=", tradeStatus, "trade_no=", tradeNo);
  return { trade_status: tradeStatus, trade_no: tradeNo, total_amount: totalAmount };
}

/** 异步通知验签（POST body 为 form 键值对） */
export async function verifyAlipayNotifySign(postData: Record<string, string>): Promise<boolean> {
  const sdk = await getAlipaySdk();
  return sdk.checkNotifySignV2(postData);
}

export { getTierAmountYuan };
