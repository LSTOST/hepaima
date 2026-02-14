/**
 * 报告档位对应金额（单位：分，用于微信支付）
 * 可根据 PRD 按通用版/阶段版细分，此处先统一
 */
export const TIER_AMOUNT_CENTS: Record<string, number> = {
  STANDARD: 1290, // 12.9 元
  PREMIUM: 2990,  // 29.9 元
};

/** 档位对应金额（元，字符串，用于支付宝） */
export function getTierAmountYuan(tier: string): string {
  const cents = TIER_AMOUNT_CENTS[tier] ?? 0;
  return (cents / 100).toFixed(2);
}
