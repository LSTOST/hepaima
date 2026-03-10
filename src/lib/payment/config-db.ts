import { prisma } from "@/lib/db";

export type PaymentConfig = {
  appId: string;
  mchId: string | null;
  apiKey: string | null;
  privateKey: string | null;
  publicKey: string | null;
  notifyUrl: string | null;
  isEnabled: boolean;
};

export async function getPaymentProviderConfig(
  type: "WECHAT" | "ALIPAY"
): Promise<PaymentConfig | null> {
  const row = await prisma.paymentProviderConfig.findFirst({
    where: { type },
  });
  if (!row || !row.isEnabled) return null;
  if (type === "WECHAT" && row.appId && row.mchId && row.apiKey) {
    return {
      appId: row.appId,
      mchId: row.mchId,
      apiKey: row.apiKey,
      privateKey: row.privateKey,
      publicKey: row.publicKey,
      notifyUrl: row.notifyUrl,
      isEnabled: row.isEnabled,
    };
  }
  if (type === "ALIPAY" && row.appId && row.privateKey && row.publicKey) {
    return {
      appId: row.appId,
      mchId: row.mchId,
      apiKey: row.apiKey,
      privateKey: row.privateKey,
      publicKey: row.publicKey,
      notifyUrl: row.notifyUrl,
      isEnabled: row.isEnabled,
    };
  }
  return null;
}
