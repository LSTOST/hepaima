/**
 * 主动查单 API
 * POST /api/v1/orders/[orderId]/check
 * 当异步回调失败时，前端可调用此接口主动向微信查询订单支付状态
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { queryWechatOrder } from "@/lib/payment/wechat";
import { queryAlipayOrder } from "@/lib/payment/alipay";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  if (!orderId) {
    return NextResponse.json({ error: "缺少 orderId" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return NextResponse.json({ error: "订单不存在" }, { status: 404 });
  }

  if (order.status === "PAID") {
    return NextResponse.json({ status: "PAID", purchasedTier: order.tier });
  }

  const markPaid = async (paymentId?: string) => {
    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: {
          status: "PAID",
          paymentId: paymentId ?? undefined,
          paidAt: new Date(),
        },
      }),
      prisma.result.update({
        where: { id: order.resultId },
        data: { purchasedTier: order.tier },
      }),
    ]);
    return NextResponse.json({ status: "PAID", purchasedTier: order.tier });
  };

  if (order.paymentMethod === "WECHAT") {
    try {
      const result = await queryWechatOrder(orderId);
      console.log("[order check] 微信查单结果:", orderId, result.trade_state);
      if (result.trade_state === "SUCCESS") return markPaid(result.transaction_id);
      return NextResponse.json({ status: result.trade_state });
    } catch (e) {
      console.error("[order check] 微信查单异常:", e);
      return NextResponse.json({ error: "查询支付状态失败，请稍后重试" }, { status: 502 });
    }
  }

  if (order.paymentMethod === "ALIPAY") {
    try {
      const result = await queryAlipayOrder(orderId);
      console.log("[order check] 支付宝查单结果:", orderId, result.trade_status);
      if (result.trade_status === "TRADE_SUCCESS" || result.trade_status === "TRADE_FINISHED") {
        return markPaid(result.trade_no);
      }
      return NextResponse.json({ status: result.trade_status });
    } catch (e) {
      console.error("[order check] 支付宝查单异常:", e);
      return NextResponse.json({ error: "查询支付状态失败，请稍后重试" }, { status: 502 });
    }
  }

  return NextResponse.json({ status: order.status });
}
