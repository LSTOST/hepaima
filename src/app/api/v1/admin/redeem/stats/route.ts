import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

const now = () => new Date();

export async function GET(req: NextRequest) {
  const err = requireAdmin(req);
  if (err) return err;

  try {
    const [
      total,
      unused,
      used,
      expired,
      disabled,
      totalUsages,
      batchRows,
    ] = await Promise.all([
      prisma.redeemCode.count(),
      prisma.redeemCode.count({
        where: {
          disabled: false,
          usages: { none: {} },
          OR: [{ expiresAt: null }, { expiresAt: { gte: now() } }],
        },
      }),
      prisma.redeemCode.count({ where: { usages: { some: {} } } }),
      prisma.redeemCode.count({ where: { expiresAt: { lt: now() } } }),
      prisma.redeemCode.count({ where: { disabled: true } }),
      prisma.redeemCodeUsage.count(),
      prisma.redeemCode.findMany({
        where: { batchId: { not: null } },
        select: { batchId: true },
        distinct: ["batchId"],
      }),
    ]);

    const batches = batchRows
      .map((r) => r.batchId)
      .filter((b): b is string => !!b)
      .sort();

    return NextResponse.json({
      total,
      unused,
      used,
      expired,
      disabled,
      totalUsages,
      batches,
    });
  } catch (e) {
    console.error("GET /api/v1/admin/redeem/stats error:", e);
    return NextResponse.json({ message: "获取统计失败" }, { status: 500 });
  }
}
