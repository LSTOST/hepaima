/**
 * POST /api/v1/orders
 * 创建订单并返回支付参数（微信 code_url / h5_url 或支付宝 form/url）
 * 支持可选 promoCode：校验后按折后价创建订单，支付成功后记入 PromoCodeUsage
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createWechatNativeOrder, createWechatJsapiOrder } from "@/lib/payment/wechat";
import { createAlipayPrecreate, createAlipayWapPay, getTierAmountYuan } from "@/lib/payment/alipay";
import { TIER_AMOUNT_CENTS } from "@/lib/payment/constants";

const VALID_TIERS = ["STANDARD", "PREMIUM"] as const;
const VALID_METHODS = ["WECHAT", "ALIPAY"] as const;
const PREMIUM_BASE_CENTS = TIER_AMOUNT_CENTS.PREMIUM ?? 990;

function isMobile(userAgent: string): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const resultId = body?.resultId as string | undefined;
    const sessionId = body?.sessionId as string | undefined;
    const tier = body?.tier as string | undefined;
    const paymentMethod = body?.paymentMethod as string | undefined;
    const deviceId = body?.deviceId as string | undefined;
    const openid = body?.openid as string | undefined;
    const promoCode = (body?.promoCode as string)?.trim?.();

    if (!resultId || !tier || !paymentMethod) {
      return NextResponse.json(
        { message: "resultId、tier、paymentMethod 为必填" },
        { status: 400 }
      );
    }
    if (!VALID_TIERS.includes(tier as (typeof VALID_TIERS)[number])) {
      return NextResponse.json({ message: "tier 不合法" }, { status: 400 });
    }
    if (!VALID_METHODS.includes(paymentMethod as (typeof VALID_METHODS)[number])) {
      return NextResponse.json({ message: "paymentMethod 不合法" }, { status: 400 });
    }
    if (!deviceId) {
      return NextResponse.json({ message: "deviceId 为必填" }, { status: 400 });
    }

    const result = await prisma.result.findUnique({
      where: { id: resultId },
      include: { session: true },
    });
    if (!result) {
      return NextResponse.json({ message: "未找到对应结果" }, { status: 404 });
    }
    if (result.purchasedTier !== "FREE") {
      return NextResponse.json({ message: "该报告已解锁" }, { status: 400 });
    }

    let amount = TIER_AMOUNT_CENTS[tier] ?? 0;
    let promoCodeId: string | undefined;

    if (promoCode && tier === "PREMIUM") {
      const promo = await prisma.promoCode.findUnique({ where: { code: promoCode } });
      if (!promo) {
        return NextResponse.json({ message: "优惠码不存在" }, { status: 400 });
      }
      if (promo.disabled) {
        return NextResponse.json({ message: "优惠码已失效" }, { status: 400 });
      }
      const now = new Date();
      if (promo.expiresAt && promo.expiresAt < now) {
        return NextResponse.json({ message: "优惠码已过期" }, { status: 400 });
      }
      if (promo.maxUses != null && promo.usedCount >= promo.maxUses) {
        return NextResponse.json({ message: "优惠码已达使用上限" }, { status: 400 });
      }
      if (promo.type === "FREE_UNLOCK") {
        return NextResponse.json(
          { message: "该优惠码为免单，请使用「¥0 立即解锁」按钮" },
          { status: 400 },
        );
      }
      if (promo.type === "FIXED_OFF") {
        amount = Math.max(0, PREMIUM_BASE_CENTS - promo.value);
      } else if (promo.type === "PERCENT_OFF") {
        const pct = Math.min(99, Math.max(1, promo.value));
        amount = Math.round((PREMIUM_BASE_CENTS * pct) / 100);
      }
      promoCodeId = promo.id;
    }

    if (amount <= 0) {
      return NextResponse.json({ message: "档位金额未配置或优惠后金额无效" }, { status: 400 });
    }

    const order = await prisma.order.create({
      data: {
        resultId,
        deviceId,
        tier: tier as "STANDARD" | "PREMIUM",
        amount,
        status: "PENDING",
        paymentMethod: paymentMethod as "WECHAT" | "ALIPAY",
        promoCodeId: promoCodeId ?? undefined,
      },
    });

    const outTradeNo = order.id;
    const description = `合拍吗-${tier === "PREMIUM" ? "深度报告" : "标准报告"}`;
    const amountYuan = (amount / 100).toFixed(2);
    const userAgent = req.headers.get("user-agent") ?? "";

    if (paymentMethod === "WECHAT") {
      // 微信内浏览器：JSAPI 直接唤起支付（需要 openid）
      if (openid) {
        const jsapiParams = await createWechatJsapiOrder({
          outTradeNo,
          description,
          amountCents: amount,
          openid,
        });
        return NextResponse.json({
          orderId: order.id,
          paymentMethod: "WECHAT",
          type: "jsapi",
          jsapiParams,
        });
      }
      // 非微信浏览器：Native 扫码支付
      const { code_url } = await createWechatNativeOrder({
        outTradeNo,
        description,
        amountCents: amount,
      });
      return NextResponse.json({
        orderId: order.id,
        paymentMethod: "WECHAT",
        type: "native",
        code_url,
      });
    }

    // 支付宝：PC 用「当面付」预创建二维码，手机用「手机网站支付」
    if (paymentMethod === "ALIPAY") {
      const mobile = isMobile(userAgent);
      if (mobile) {
        const payUrl = await createAlipayWapPay({
          outTradeNo,
          subject: description,
          totalAmountYuan: amountYuan,
        });
        return NextResponse.json({
          orderId: order.id,
          paymentMethod: "ALIPAY",
          type: "wap",
          pay_url: payUrl,
        });
      } else {
        const { qr_code } = await createAlipayPrecreate({
          outTradeNo,
          subject: description,
          totalAmountYuan: amountYuan,
        });
        return NextResponse.json({
          orderId: order.id,
          paymentMethod: "ALIPAY",
          type: "native",
          code_url: qr_code,
        });
      }
    }

    return NextResponse.json({ message: "不支持的支付方式" }, { status: 400 });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("POST /api/v1/orders error:", err.message);
    return NextResponse.json(
      { message: err.message || "创建订单失败" },
      { status: 500 }
    );
  }
}
