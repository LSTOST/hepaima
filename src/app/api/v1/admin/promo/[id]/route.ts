import type { Prisma } from "@prisma/client";
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
    if (!body || typeof body !== "object") {
      return NextResponse.json({ message: "请求体无效" }, { status: 400 });
    }

    const existing = await prisma.promoCode.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: "优惠码不存在" }, { status: 404 });
    }

    const data: Prisma.PromoCodeUpdateInput = {};

    if ("maxUses" in body) {
      const v = body.maxUses;
      if (v === null) {
        data.maxUses = null;
      } else if (typeof v === "number" && Number.isInteger(v) && v >= 1) {
        if (v < existing.usedCount) {
          return NextResponse.json(
            {
              message: `单码上限不能小于已使用次数（当前已用 ${existing.usedCount}）`,
            },
            { status: 400 },
          );
        }
        data.maxUses = v;
      } else {
        return NextResponse.json(
          { message: "maxUses 需为正整数或 null（表示不限制）" },
          { status: 400 },
        );
      }
    }

    if (body.disabled === true) {
      data.disabled = true;
    } else if (body.disabled === false) {
      if (!existing.disabled) {
        return NextResponse.json(
          { message: "仅可启用当前为已禁用的优惠码" },
          { status: 400 },
        );
      }
      data.disabled = false;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ message: "无有效更新字段" }, { status: 400 });
    }

    await prisma.promoCode.update({ where: { id }, data });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("PATCH /api/v1/admin/promo/[id] error:", e);
    return NextResponse.json({ message: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const err = requireAdmin(req);
  if (err) return err;

  try {
    const { id } = await ctx.params;
    const existing = await prisma.promoCode.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: "优惠码不存在" }, { status: 404 });
    }
    if (existing.usedCount > 0) {
      return NextResponse.json(
        {
          message:
            "已产生使用记录的优惠码不能删除，请使用「禁用」停止继续核销",
        },
        { status: 400 },
      );
    }
    await prisma.promoCode.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/v1/admin/promo/[id] error:", e);
    return NextResponse.json({ message: "删除失败" }, { status: 500 });
  }
}
