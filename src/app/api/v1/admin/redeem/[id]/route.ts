import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

const now = () => new Date();

function computeStatus(row: {
  disabled: boolean;
  expiresAt: Date | null;
  usages: unknown[];
}): string {
  if (row.disabled) return "DISABLED";
  if (row.expiresAt && row.expiresAt < now()) return "EXPIRED";
  if (row.usages.length === 0) return "UNUSED";
  return "USED";
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const err = requireAdmin(req);
  if (err) return err;

  try {
    const { id } = await params;
    const code = await prisma.redeemCode.findUnique({
      where: { id },
      include: { usages: { orderBy: { usedAt: "asc" } } },
    });
    if (!code) {
      return NextResponse.json({ message: "兑换码不存在" }, { status: 404 });
    }
    return NextResponse.json({
      ...code,
      status: computeStatus(code),
    });
  } catch (e) {
    console.error("GET /api/v1/admin/redeem/[id] error:", e);
    return NextResponse.json({ message: "获取详情失败" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const err = requireAdmin(req);
  if (err) return err;

  try {
    const { id } = await params;
    const body = await req.json().catch(() => null);
    const disabled = body?.disabled === true;

    const existing = await prisma.redeemCode.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: "兑换码不存在" }, { status: 404 });
    }

    if (disabled) {
      await prisma.redeemCode.update({
        where: { id },
        data: { disabled: true },
      });
    } else {
      if (!existing.disabled) {
        return NextResponse.json(
          { message: "仅可启用当前为已禁用的兑换码" },
          { status: 400 },
        );
      }
      await prisma.redeemCode.update({
        where: { id },
        data: { disabled: false },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("PATCH /api/v1/admin/redeem/[id] error:", e);
    return NextResponse.json({ message: "更新失败" }, { status: 500 });
  }
}
