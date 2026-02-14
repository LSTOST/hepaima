import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const MAX_COUNT = 1000;

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
    code = `HP-${randomSegment(4)}-${randomSegment(4)}`;
  } while (existing.has(code));
  return code;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const adminKey = body?.adminKey;
    const count = Math.min(
      Math.max(1, Number(body?.count) || 0),
      MAX_COUNT,
    );
    const batchId =
      typeof body?.batchId === "string" && body.batchId.trim()
        ? body.batchId.trim()
        : null;
    const expiresInDays =
      typeof body?.expiresInDays === "number" && body.expiresInDays > 0
        ? body.expiresInDays
        : null;

    const secret = process.env.ADMIN_SECRET_KEY;
    if (!secret || adminKey !== secret) {
      return NextResponse.json({ message: "无权限" }, { status: 403 });
    }

    if (count < 1 || count > MAX_COUNT) {
      return NextResponse.json(
        { message: `count 需在 1～${MAX_COUNT} 之间` },
        { status: 400 },
      );
    }

    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    const existingCodes = new Set(
      (await prisma.redeemCode.findMany({ select: { code: true } })).map(
        (r) => r.code,
      ),
    );

    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      codes.push(generateOneCode(existingCodes));
      existingCodes.add(codes[codes.length - 1]);
    }

    await prisma.redeemCode.createMany({
      data: codes.map((code) => ({
        code,
        batchId,
        status: "UNUSED",
        expiresAt,
      })),
    });

    return NextResponse.json({ codes });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("POST /api/v1/admin/generate-codes error:", err.message);
    return NextResponse.json(
      { message: "生成失败，请稍后再试" },
      { status: 500 },
    );
  }
}
