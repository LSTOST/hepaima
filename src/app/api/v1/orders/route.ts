/**
 * POST /api/v1/orders
 * 创建订单并返回支付参数（微信 code_url / h5_url 或支付宝 form/url）
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createWechatNativeOrder, createWechatH5Order } from "@/lib/payment/wechat";
import { createAlipayPagePay, createAlipayWapPay, getTierAmountYuan } from "@/lib/payment/alipay";
import { TIER_AMOUNT_CENTS } from "@/lib/payment/constants";

const VALID_TIERS = ["STANDARD", "PREMIUM"] as const;
const VALID_METHODS = ["WECHAT", "ALIPAY"] as const;

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

    const amount = TIER_AMOUNT_CENTS[tier] ?? 0;
    if (amount <= 0) {
      return NextResponse.json({ message: "档位金额未配置" }, { status: 400 });
    }

    const order = await prisma.order.create({
      data: {
        resultId,
        deviceId,
        tier: tier as "STANDARD" | "PREMIUM",
        amount,
        status: "PENDING",
        paymentMethod: paymentMethod as "WECHAT" | "ALIPAY",
      },
    });

    const outTradeNo = order.id;
    const description = `合拍吗-${tier === "PREMIUM" ? "深度报告" : "标准报告"}`;
    const amountYuan = getTierAmountYuan(tier);
    const userAgent = req.headers.get("user-agent") ?? "";

    if (paymentMethod === "WECHAT") {
      const mobile = isMobile(userAgent);
      if (mobile) {
        const { h5_url } = await createWechatH5Order({
          outTradeNo,
          description,
          amountCents: amount,
        });
        return NextResponse.json({
          orderId: order.id,
          paymentMethod: "WECHAT",
          type: "h5",
          h5_url,
        });
      } else {
        const { code_url } = await createWechatNativeOrder({
          outTradeNo,
          description,
          amountCents: amount,
        });
        return NextResponse.json({
          orderId: order.id,
          paymentMethod: "WECHAT",
          type: "native",
          code_url: code_url,
        });
      }
    }

    if (paymentMethod === "ALIPAY") {
      const mobile = isMobile(userAgent);
      if (mobile) {
        const payUrl = createAlipayWapPay({
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
        const formHtml = createAlipayPagePay({
          outTradeNo,
          subject: description,
          totalAmountYuan: amountYuan,
        });
        return NextResponse.json({
          orderId: order.id,
          paymentMethod: "ALIPAY",
          type: "page",
          form_html: formHtml,
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
