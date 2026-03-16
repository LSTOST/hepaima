import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

const now = () => new Date();

function statusWhere(status: string): Prisma.PromoCodeWhereInput {
  const n = now();
  if (status === "all") return {};
  if (status === "UNUSED") {
    return {
      disabled: false,
      usedCount: 0,
      OR: [{ expiresAt: null }, { expiresAt: { gte: n } }],
    };
  }
  if (status === "USED") return { usedCount: { gt: 0 } };
  if (status === "EXPIRED") return { expiresAt: { lt: n } };
  if (status === "DISABLED") return { disabled: true };
  return {};
}

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

export async function GET(req: NextRequest) {
  const err = requireAdmin(req);
  if (err) return err;

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, Number(searchParams.get("pageSize")) || 10),
    );
    const search = (searchParams.get("search") ?? "").trim();
    const status = searchParams.get("status") ?? "all";
    const batch = searchParams.get("batch") ?? "all";
    const type = searchParams.get("type") ?? "all";

    const where: Prisma.PromoCodeWhereInput = {
      ...statusWhere(status),
    };

    if (search) {
      where.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { batchId: { contains: search, mode: "insensitive" } },
      ];
    }
    if (batch !== "all" && batch) {
      where.batchId = batch;
    }
    if (type !== "all" && type) {
      // 这里直接按字符串匹配枚举值，由 Prisma 在运行时校验
      where.type = type as any;
    }

    const [rows, total] = await Promise.all([
      prisma.promoCode.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          _count: { select: { usages: true } },
          usages: { select: { resultId: true, orderId: true, usedAt: true }, orderBy: { usedAt: "desc" }, take: 5 },
        },
      }),
      prisma.promoCode.count({ where }),
    ]);

    const list = rows.map((r) => {
      const { _count, usages, ...rest } = r;
      return {
        ...rest,
        status: computeStatus({
          disabled: r.disabled,
          expiresAt: r.expiresAt,
          usedCount: r.usedCount,
          maxUses: r.maxUses,
        }),
        usagesCount: _count.usages,
        usages: usages.map((u) => ({ resultId: u.resultId, orderId: u.orderId, usedAt: u.usedAt })),
      };
    });

    return NextResponse.json({
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("GET /api/v1/admin/promo/list error:", err.message, err);
    const isDbError =
      err.message.includes("P1001") ||
      err.message.includes("P2021") ||
      err.message.includes("does not exist") ||
      err.message.includes("prisma");
    return NextResponse.json(
      {
        message: "获取列表失败",
        ...(isDbError && {
          hint: "请检查 DATABASE_URL 与是否已执行 pnpm prisma migrate deploy",
        }),
      },
      { status: 500 },
    );
  }
}
