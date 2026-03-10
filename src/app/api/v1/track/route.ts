import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const ALLOWED_EVENT_TYPES = [
  "page_view",
  "quiz_start",
  "quiz_complete",
  "result_view",
  "pay_click",
  "redeem_use",
] as const;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const eventType = typeof body.eventType === "string" ? body.eventType.trim() : "";
    if (!eventType || !ALLOWED_EVENT_TYPES.includes(eventType as (typeof ALLOWED_EVENT_TYPES)[number])) {
      return NextResponse.json(
        { message: "eventType 必填且为允许的类型" },
        { status: 400 },
      );
    }
    const path = typeof body.path === "string" ? body.path.slice(0, 500) : null;
    const visitorId = typeof body.visitorId === "string" ? body.visitorId.slice(0, 128) : null;

    await prisma.analyticsEvent.create({
      data: { eventType, path, visitorId },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST /api/v1/track error:", e);
    return NextResponse.json({ message: "记录失败" }, { status: 500 });
  }
}
