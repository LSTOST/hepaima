import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

const now = () => new Date();

function computeStatus(row: {
  disabled: boolean;
  expiresAt: Date | null;
  usedCount: number;
  maxUses: number | null;
}): string {
  const n = now();
  if (row.disabled) return "DISABLED";
  if (row.expiresAt && row.expiresAt < n) return "EXPIRED";
  if (row.usedCount > 0) return "USED";
  return "UNUSED";
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const err = requireAdmin(req);
  if (err) return err;

  try {
    const { id } = await ctx.params;
    const code = await prisma.promoCode.findUnique({
      where: { id },
      include: { usages: { orderBy: { usedAt: "desc" } } },
    });
    if (!code) {
      return NextResponse.json({ message: "优惠码不存在" }, { status: 404 });
    }
    return NextResponse.json({
      ...code,
      status: computeStatus({
        disabled: code.disabled,
        expiresAt: code.expiresAt,
        usedCount: code.usedCount,
        maxUses: code.maxUses,
      }),
    });
  } catch (e) {
    console.error("GET /api/v1/admin/promo/[id] error:", e);
    return NextResponse.json({ message: "获取详情失败" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const err = requireAdmin(req);
  if (err) return err;

  try {
    const { id } = await ctx.params;
    const body = await req.json().catch(() => null);
    const disabled = body?.disabled === true;

    const existing = await prisma.promoCode.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: "优惠码不存在" }, { status: 404 });
    }

    if (disabled) {
      await prisma.promoCode.update({
        where: { id },
        data: { disabled: true },
      });
    } else {
      if (!existing.disabled) {
        return NextResponse.json(
          { message: "仅可启用当前为已禁用的优惠码" },
          { status: 400 },
        );
      }
      await prisma.promoCode.update({
        where: { id },
        data: { disabled: false },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("PATCH /api/v1/admin/promo/[id] error:", e);
    return NextResponse.json({ message: "更新失败" }, { status: 500 });
  }
}
