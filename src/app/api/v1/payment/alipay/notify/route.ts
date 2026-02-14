/**
 * 支付宝异步通知
 * POST /api/v1/payment/alipay/notify
 * 验签 → 幂等更新订单与报告解锁 → 返回 success
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAlipayNotifySign } from "@/lib/payment/alipay";

function parseFormBody(body: string): Record<string, string> {
  const params: Record<string, string> = {};
  new URLSearchParams(body).forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";
  let postData: Record<string, string>;

  try {
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const raw = await req.text();
      postData = parseFormBody(raw);
    } else {
      const json = await req.json().catch(() => ({}));
      postData = typeof json === "object" && json !== null ? (json as Record<string, string>) : {};
    }

    const tradeStatus = postData.trade_status;
    if (tradeStatus !== "TRADE_SUCCESS" && tradeStatus !== "TRADE_FINISH") {
      return new NextResponse("success", {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const ok = verifyAlipayNotifySign(postData);
    if (!ok) {
      return new NextResponse("fail", {
        status: 400,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const outTradeNo = postData.out_trade_no;
    const totalAmount = postData.total_amount;
    if (!outTradeNo) {
      return new NextResponse("success", {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const order = await prisma.order.findUnique({
      where: { id: outTradeNo },
    });
    if (!order) {
      return new NextResponse("success", {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
    if (order.status === "PAID") {
      return new NextResponse("success", {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const amountCents = Math.round(parseFloat(totalAmount || "0") * 100);
    if (amountCents !== order.amount) {
      return new NextResponse("fail", {
        status: 400,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    await prisma.$transaction([
      prisma.order.update({
        where: { id: outTradeNo },
        data: {
          status: "PAID",
          paymentId: postData.trade_no ?? undefined,
          paidAt: new Date(),
        },
      }),
      prisma.result.update({
        where: { id: order.resultId },
        data: { purchasedTier: order.tier },
      }),
    ]);

    return new NextResponse("success", {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("alipay notify error:", error);
    return new NextResponse("fail", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
