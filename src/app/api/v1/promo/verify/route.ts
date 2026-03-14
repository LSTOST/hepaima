/**
 * POST /api/v1/promo/verify
 * 校验优惠码是否可用于当前结果页，返回折后金额（分）
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
        { message: "请填写优惠码" },
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
        { message: "该报告已解锁" },
        { status: 400 },
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

    const message =
      finalAmountCents === 0
        ? "免单，可直接解锁"
        : finalAmountCents < PREMIUM_BASE_CENTS
          ? `已减免，实付 ¥${(finalAmountCents / 100).toFixed(2)}`
          : undefined;

    return NextResponse.json({
      valid: true,
      finalAmountCents,
      message: message ?? `实付 ¥${(finalAmountCents / 100).toFixed(2)}`,
    });
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("POST /api/v1/promo/verify error:", err.message);
    return NextResponse.json(
      { message: "校验失败，请稍后再试" },
      { status: 500 },
    );
  }
}
