/**
 * POST /api/v1/admin/promo/generate
 * 批量生成优惠码（用于深度报告解锁减免/免单）
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const MAX_COUNT = 500;
const PROMO_PREFIX = "HP9-";

function randomSegment(length: number): string {
  let s = "";
  for (let i = 0; i < length; i++) {
    s += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return s;
}

function generateOneCode(existing: Set<string>): string {
  let code: string;
  do {
    code = `${PROMO_PREFIX}${randomSegment(4)}-${randomSegment(4)}`;
  } while (existing.has(code));
  return code;
}

const VALID_TYPES = ["FIXED_OFF", "PERCENT_OFF", "FREE_UNLOCK"] as const;

export async function POST(req: NextRequest) {
  const err = requireAdmin(req);
  if (err) return err;

  try {
    const body = await req.json().catch(() => null);
    const count = Math.min(
      Math.max(1, Number(body?.count) || 0),
      MAX_COUNT,
    );
    const type = body?.type as string | undefined;
    const value = typeof body?.value === "number" ? body.value : 0;
    const batchId =
      typeof body?.batchId === "string" && body.batchId.trim()
        ? body.batchId.trim()
        : null;
    const expiresInDays =
      typeof body?.expiresInDays === "number" && body.expiresInDays > 0
        ? body.expiresInDays
        : null;
    const maxUses =
      typeof body?.maxUses === "number" && body.maxUses > 0
        ? body.maxUses
        : null;

    if (!type || !VALID_TYPES.includes(type as (typeof VALID_TYPES)[number])) {
      return NextResponse.json(
        { message: "type 必填，且为 FIXED_OFF | PERCENT_OFF | FREE_UNLOCK" },
        { status: 400 },
      );
    }
    if (type === "PERCENT_OFF" && (value < 1 || value > 99)) {
      return NextResponse.json(
        { message: "折扣类型 value 需为 1～99（表示折）" },
        { status: 400 },
      );
    }
    if (type === "FIXED_OFF" && value < 0) {
      return NextResponse.json(
        { message: "固定减免 value 需为非负整数（单位：分）" },
        { status: 400 },
      );
    }
    if (type === "FREE_UNLOCK" && value !== 0) {
      return NextResponse.json(
        { message: "免单类型 value 应为 0" },
        { status: 400 },
      );
    }

    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    const existingCodes = new Set(
      (await prisma.promoCode.findMany({ select: { code: true } })).map(
        (r) => r.code,
      ),
    );

    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      codes.push(generateOneCode(existingCodes));
      existingCodes.add(codes[codes.length - 1]!);
    }

    await prisma.promoCode.createMany({
      data: codes.map((code) => ({
        code,
        type: type as "FIXED_OFF" | "PERCENT_OFF" | "FREE_UNLOCK",
        value: type === "FREE_UNLOCK" ? 0 : value,
        maxUses: maxUses,
        expiresAt,
        batchId,
      })),
    });

    return NextResponse.json({ codes });
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("POST /api/v1/admin/promo/generate error:", err.message);
    return NextResponse.json(
      { message: err.message || "生成失败" },
      { status: 500 },
    );
  }
}
