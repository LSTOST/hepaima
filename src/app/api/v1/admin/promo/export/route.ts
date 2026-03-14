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

export async function GET(req: NextRequest) {
  const err = requireAdmin(req);
  if (err) return err;

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") ?? "all";
    const batch = searchParams.get("batch") ?? "all";

    const where: Prisma.PromoCodeWhereInput = {
      ...statusWhere(status),
    };
    if (batch !== "all" && batch) {
      where.batchId = batch;
    }

    const list = await prisma.promoCode.findMany({
      where,
      orderBy: [{ batchId: "asc" }, { createdAt: "desc" }],
      select: { code: true },
    });

    const text = list.map((r) => r.code).join("\n");
    return new NextResponse(text, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="hepaima-promo-codes-${new Date().toISOString().slice(0, 10)}.txt"`,
      },
    });
  } catch (e) {
    console.error("GET /api/v1/admin/promo/export error:", e);
    return NextResponse.json({ message: "导出失败" }, { status: 500 });
  }
}
