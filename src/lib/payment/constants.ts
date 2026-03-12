/**
 * 报告档位对应金额（单位：分，用于微信支付）
 * 本地测试可设 PAYMENT_TEST_AMOUNT_CENTS=100 改为 1 元
 */
const REAL_AMOUNTS: Record<string, number> = {
  STANDARD: 990,  // 9.9 元
  PREMIUM: 990,   // 9.9 元
};

const testCents = process.env.PAYMENT_TEST_AMOUNT_CENTS
  ? parseInt(process.env.PAYMENT_TEST_AMOUNT_CENTS, 10)
  : null;

export const TIER_AMOUNT_CENTS: Record<string, number> = {
  STANDARD: testCents ?? REAL_AMOUNTS.STANDARD,
  PREMIUM: testCents ?? REAL_AMOUNTS.PREMIUM,
};

/** 档位对应金额（元，字符串，用于支付宝） */
export function getTierAmountYuan(tier: string): string {
  const cents = TIER_AMOUNT_CENTS[tier] ?? 0;
  return (cents / 100).toFixed(2);
}
