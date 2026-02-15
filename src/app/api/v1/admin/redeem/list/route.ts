import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

const now = () => new Date();

function statusWhere(status: string): Prisma.RedeemCodeWhereInput {
  if (status === "all") return {};
  if (status === "UNUSED") {
    return {
      AND: [
        { disabled: false },
        { usages: { none: {} } },
        {
          OR: [
            { expiresAt: null },
            { expiresAt: { gte: now() } },
          ],
        },
      ],
    };
  }
  if (status === "USED") return { usages: { some: {} } };
  if (status === "EXPIRED") return { expiresAt: { lt: now() } };
  if (status === "DISABLED") return { disabled: true };
  return {};
}

function computeStatus(row: {
  disabled: boolean;
  expiresAt: Date | null;
  _count: { usages: number };
}): string {
  if (row.disabled) return "DISABLED";
  if (row.expiresAt && row.expiresAt < now()) return "EXPIRED";
  if (row._count.usages === 0) return "UNUSED";
  return "USED";
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

    const where: Prisma.RedeemCodeWhereInput = {
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

    const [rows, total] = await Promise.all([
      prisma.redeemCode.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          _count: { select: { usages: true } },
          usages: { select: { stage: true, usedAt: true } },
        },
      }),
      prisma.redeemCode.count({ where }),
    ]);

    const list = rows.map((r) => {
      const { _count, usages, ...rest } = r;
      return {
        ...rest,
        status: computeStatus({
          disabled: r.disabled,
          expiresAt: r.expiresAt,
          _count: { usages: _count.usages },
        }),
        usedAt: r.firstUsedAt ?? null,
        usagesCount: _count.usages,
        usages: usages.map((u) => ({ stage: u.stage, usedAt: u.usedAt })),
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
    console.error("GET /api/v1/admin/redeem/list error:", e);
    return NextResponse.json({ message: "获取列表失败" }, { status: 500 });
  }
}
