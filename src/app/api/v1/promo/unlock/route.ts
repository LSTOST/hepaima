/**
 * POST /api/v1/promo/unlock
 * 使用优惠码免单解锁深度报告（仅当校验为 0 元时前端调用）
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { TIER_AMOUNT_CENTS } from "@/lib/payment/constants";

const PREMIUM_BASE_CENTS = TIER_AMOUNT_CENTS.PREMIUM ?? 990;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const code = (body?.code as string)?.trim?.();
    const resultId = body?.resultId as string | undefined;

    if (!code || !resultId) {
      return NextResponse.json(
        { message: "参数错误" },
        { status: 400 },
      );
    }

    const result = await prisma.result.findUnique({
      where: { id: resultId },
    });
    if (!result) {
      return NextResponse.json(
        { message: "未找到对应结果" },
        { status: 404 },
      );
    }
    if (result.purchasedTier !== "FREE") {
      return NextResponse.json(
        { success: true, purchasedTier: "PREMIUM" },
        { status: 200 },
      );
    }

    const promo = await prisma.promoCode.findUnique({
      where: { code },
    });
    if (!promo) {
      return NextResponse.json(
        { message: "优惠码不存在" },
        { status: 404 },
      );
    }
    if (promo.disabled) {
      return NextResponse.json(
        { message: "优惠码已失效" },
        { status: 400 },
      );
    }
    const now = new Date();
    if (promo.expiresAt && promo.expiresAt < now) {
      return NextResponse.json(
        { message: "优惠码已过期" },
        { status: 400 },
      );
    }
    if (promo.maxUses != null && promo.usedCount >= promo.maxUses) {
      return NextResponse.json(
        { message: "优惠码已达使用上限" },
        { status: 400 },
      );
    }

    let finalAmountCents = PREMIUM_BASE_CENTS;
    if (promo.type === "FREE_UNLOCK") {
      finalAmountCents = 0;
    } else if (promo.type === "FIXED_OFF") {
      finalAmountCents = Math.max(0, PREMIUM_BASE_CENTS - promo.value);
    } else if (promo.type === "PERCENT_OFF") {
      const pct = Math.min(99, Math.max(1, promo.value));
      finalAmountCents = Math.round((PREMIUM_BASE_CENTS * pct) / 100);
    }

    if (finalAmountCents !== 0) {
      return NextResponse.json(
        { message: "该优惠码非免单，请使用支付方式解锁" },
        { status: 400 },
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.result.update({
        where: { id: resultId },
        data: { purchasedTier: "PREMIUM" },
      });
      await tx.promoCodeUsage.create({
        data: {
          promoCodeId: promo.id,
          resultId,
          orderId: null,
        },
      });
      await tx.promoCode.update({
        where: { id: promo.id },
        data: { usedCount: { increment: 1 } },
      });
    });

    return NextResponse.json({ success: true, purchasedTier: "PREMIUM" });
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("POST /api/v1/promo/unlock error:", err.message);
    return NextResponse.json(
      { message: "解锁失败，请稍后再试" },
      { status: 500 },
    );
  }
}
