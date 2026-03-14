import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

const now = () => new Date();

export async function GET(req: NextRequest) {
  const err = requireAdmin(req);
  if (err) return err;

  try {
    const n = now();
    const [
      total,
      used,
      expired,
      disabled,
      totalUsages,
      batchRows,
    ] = await Promise.all([
      prisma.promoCode.count(),
      prisma.promoCode.count({ where: { usedCount: { gt: 0 } } }),
      prisma.promoCode.count({ where: { expiresAt: { lt: n } } }),
      prisma.promoCode.count({ where: { disabled: true } }),
      prisma.promoCodeUsage.count(),
      prisma.promoCode.findMany({
        where: { batchId: { not: null } },
        select: { batchId: true },
        distinct: ["batchId"],
      }),
    ]);

    // 未使用：未禁用、未过期、且 (无 maxUses 或 usedCount < maxUses)
    const unused = await prisma
      .$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) AS count FROM "PromoCode"
      WHERE "disabled" = false
        AND ("expiresAt" IS NULL OR "expiresAt" >= ${n})
        AND ("maxUses" IS NULL OR "usedCount" < "maxUses")
    `
      .then((rows) => Number(rows[0]?.count ?? 0));

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
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("GET /api/v1/admin/promo/stats error:", err.message, err);
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
