import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

const now = () => new Date();

function todayStart(d = now()) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export async function GET(req: NextRequest) {
  const err = requireAdmin(req);
  if (err) return err;

  try {
    const n = now();
    const day0 = todayStart(n);
    const [
      total,
      unused,
      used,
      expired,
      disabled,
      totalUsages,
      usedToday,
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
      prisma.redeemCodeUsage.count({
        where: { usedAt: { gte: day0 } },
      }),
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
      usedToday,
      batches,
    });
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("GET /api/v1/admin/redeem/stats error:", err.message, err);
    const isDbError =
      err.message.includes("P1001") ||
      err.message.includes("P2021") ||
      err.message.includes("does not exist") ||
      err.message.includes("prisma");
    return NextResponse.json(
      {
        message: "获取统计失败",
        ...(isDbError && {
          hint: "请检查 DATABASE_URL 与是否已执行 pnpm prisma migrate deploy",
        }),
      },
      { status: 500 },
    );
  }
}
