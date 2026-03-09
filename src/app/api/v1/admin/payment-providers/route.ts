import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { PaymentProviderType } from "@prisma/client";

export async function GET(req: NextRequest) {
  const err = requireAdmin(req);
  if (err) return err;

  try {
    const list = await prisma.paymentProviderConfig.findMany({
      orderBy: { type: "asc" },
    });
    return NextResponse.json(list);
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

