/**
 * 微信支付异步通知
 * POST /api/v1/payment/wechat/notify
 * 验签 → 解密 → 幂等更新订单与报告解锁 → 返回微信要求格式
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  verifyWechatNotifySign,
  decryptWechatNotifyResource,
} from "@/lib/payment/wechat";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const headers: Record<string, string | undefined> = {};
  req.headers.forEach((v, k) => {
    headers[k.toLowerCase()] = v;
  });

  try {
    const ok = await verifyWechatNotifySign(headers, rawBody);
    if (!ok) {
      return NextResponse.json(
        { code: "FAIL", message: "验签失败" },
        { status: 401 }
      );
    }

    const body = JSON.parse(rawBody) as {
      event_type?: string;
      resource?: {
        ciphertext: string;
        nonce: string;
        associated_data?: string;
      };
    };
    if (body.event_type !== "TRANSACTION.SUCCESS" || !body.resource) {
      return NextResponse.json({ code: "SUCCESS", message: "忽略" });
    }

    const decrypted = decryptWechatNotifyResource(body.resource);
    if (decrypted.trade_state !== "SUCCESS") {
      return NextResponse.json({ code: "SUCCESS", message: "未支付成功" });
    }

    const outTradeNo = decrypted.out_trade_no;
    const transactionId = decrypted.transaction_id;
    const total = decrypted.amount?.total;

    const order = await prisma.order.findUnique({
      where: { id: outTradeNo },
    });
    if (!order) {
      return NextResponse.json({ code: "FAIL", message: "订单不存在" }, { status: 404 });
    }
    if (order.status === "PAID") {
      return NextResponse.json({ code: "SUCCESS", message: "已处理" });
    }
    if (total != null && order.amount !== total) {
      return NextResponse.json({ code: "FAIL", message: "金额不一致" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.order.update({
        where: { id: outTradeNo },
        data: {
          status: "PAID",
          paymentId: transactionId ?? undefined,
          paidAt: new Date(),
        },
      }),
      prisma.result.update({
        where: { id: order.resultId },
        data: { purchasedTier: order.tier },
      }),
    ]);

    return NextResponse.json({ code: "SUCCESS", message: "成功" });
  } catch (error) {
    console.error("wechat notify error:", error);
    return NextResponse.json(
      { code: "FAIL", message: "处理异常" },
      { status: 500 }
    );
  }
}
