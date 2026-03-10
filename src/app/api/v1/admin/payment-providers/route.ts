import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { PaymentProviderType } from "@prisma/client";

const BASE_URL = () =>
  process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "https://hepaima.kyx123.com";

type ProviderRow = {
  id: string;
  type: PaymentProviderType;
  appId: string | null;
  mchId: string | null;
  apiKey: string | null;
  privateKey: string | null;
  publicKey: string | null;
  notifyUrl: string | null;
  isEnabled: boolean;
  isSandbox: boolean;
};

/** 返回带环境变量预设的占位配置（仅非敏感字段用 env 填充） */
function presetWechat(): ProviderRow {
  return {
    id: "preset-WECHAT",
    type: "WECHAT",
    appId: process.env.WECHAT_PAY_APP_ID ?? null,
    mchId: process.env.WECHAT_PAY_MCH_ID ?? null,
    apiKey: null,
    privateKey: null,
    publicKey: null,
    notifyUrl: `${BASE_URL()}/api/v1/payment/wechat/notify`,
    isEnabled: false,
    isSandbox: false,
  };
}

function presetAlipay(): ProviderRow {
  return {
    id: "preset-ALIPAY",
    type: "ALIPAY",
    appId: process.env.ALIPAY_APP_ID ?? null,
    mchId: null,
    apiKey: null,
    privateKey: null,
    publicKey: null,
    notifyUrl: `${BASE_URL()}/api/v1/payment/alipay/notify`,
    isEnabled: false,
    isSandbox: false,
  };
}

function toProviderRow(r: Awaited<ReturnType<typeof prisma.paymentProviderConfig.findFirst>>): ProviderRow {
  if (!r) throw new Error("unexpected");
  return {
    id: r.id,
    type: r.type,
    appId: r.appId ?? null,
    mchId: r.mchId ?? null,
    apiKey: r.apiKey ?? null,
    privateKey: r.privateKey ?? null,
    publicKey: r.publicKey ?? null,
    notifyUrl: r.notifyUrl ?? null,
    isEnabled: r.isEnabled,
    isSandbox: r.isSandbox,
  };
}

export async function GET(req: NextRequest) {
  const err = requireAdmin(req);
  if (err) return err;

  try {
    const list = await prisma.paymentProviderConfig.findMany({
      orderBy: { type: "asc" },
    });
    const wechat = list.find((r) => r.type === "WECHAT");
    const alipay = list.find((r) => r.type === "ALIPAY");
    const defaultWechatNotify = `${BASE_URL()}/api/v1/payment/wechat/notify`;
    const defaultAlipayNotify = `${BASE_URL()}/api/v1/payment/alipay/notify`;
    const rows: ProviderRow[] = [
      wechat ? toProviderRow(wechat) : presetWechat(),
      alipay ? toProviderRow(alipay) : presetAlipay(),
    ];
    const result = rows.map((r) => {
      const defaultNotify = r.type === "WECHAT" ? defaultWechatNotify : defaultAlipayNotify;
      return {
        id: r.id,
        type: r.type,
        appId: r.appId ?? null,
        mchId: r.mchId ?? null,
        apiKey: r.apiKey ?? null,
        privateKey: r.privateKey ?? null,
        publicKey: r.publicKey ?? null,
        notifyUrl: r.notifyUrl && r.notifyUrl.trim() ? r.notifyUrl : defaultNotify,
        isEnabled: r.isEnabled,
        isSandbox: r.isSandbox,
      };
    });
    return NextResponse.json(result);
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error("GET /api/v1/admin/payment-providers error:", error);
    return NextResponse.json(
      { message: "获取支付配置失败" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  const err = requireAdmin(req);
  if (err) return err;

  try {
    const body = await req.json();
    const items: Array<{
      type: PaymentProviderType;
      appId?: string;
      mchId?: string;
      apiKey?: string;
      privateKey?: string;
      publicKey?: string;
      notifyUrl?: string;
      isEnabled?: boolean;
      isSandbox?: boolean;
    }> = Array.isArray(body) ? body : [];

    const results = [];

    for (const item of items) {
      if (!item.type) continue;
      const existing = await prisma.paymentProviderConfig.findFirst({
        where: { type: item.type },
      });
      if (existing) {
        const updated = await prisma.paymentProviderConfig.update({
          where: { id: existing.id },
          data: {
            appId: item.appId ?? existing.appId,
            mchId: item.mchId ?? existing.mchId,
            apiKey: item.apiKey ?? existing.apiKey,
            privateKey: item.privateKey ?? existing.privateKey,
            publicKey: item.publicKey ?? existing.publicKey,
            notifyUrl: item.notifyUrl ?? existing.notifyUrl,
            isEnabled:
              typeof item.isEnabled === "boolean"
                ? item.isEnabled
                : existing.isEnabled,
            isSandbox:
              typeof item.isSandbox === "boolean"
                ? item.isSandbox
                : existing.isSandbox,
          },
        });
        results.push(updated);
      } else {
        const created = await prisma.paymentProviderConfig.create({
          data: {
            type: item.type,
            appId: item.appId,
            mchId: item.mchId,
            apiKey: item.apiKey,
            privateKey: item.privateKey,
            publicKey: item.publicKey,
            notifyUrl: item.notifyUrl,
            isEnabled: item.isEnabled ?? false,
            isSandbox: item.isSandbox ?? false,
          },
        });
        results.push(created);
      }
    }

    return NextResponse.json(results);
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error("PUT /api/v1/admin/payment-providers error:", error);
    return NextResponse.json(
      { message: "更新支付配置失败" },
      { status: 500 },
    );
  }
}

