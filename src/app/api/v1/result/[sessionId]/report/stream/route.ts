import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ATTACHMENT_LABELS, LOVE_LANGUAGE_LABELS } from "@/lib/resultGenerator";
import {
  generateReportStream,
  parseReportJson,
  type ReportStreamPayload,
} from "@/lib/ai";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await ctx.params;
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { result: true },
    });

    if (!session || session.status !== "COMPLETED" || !session.result) {
      return NextResponse.json(
        { message: "会话未完成或结果不存在" },
        { status: 404 },
      );
    }

    const result = session.result;
    if (result.reportBasic != null) {
      return NextResponse.json(
        { message: "基础报告已生成" },
        { status: 400 },
      );
    }

    const payload: ReportStreamPayload = {
      stage: (session as { stage?: string }).stage ?? "STAGED",
      initiatorName: session.initiatorName ?? "你",
      partnerName: session.partnerName ?? "TA",
      initiatorAttachment:
        ATTACHMENT_LABELS[result.initiatorAttachment] ?? result.initiatorAttachment,
      partnerAttachment:
        ATTACHMENT_LABELS[result.partnerAttachment] ?? result.partnerAttachment,
      initiatorLoveLanguage:
        LOVE_LANGUAGE_LABELS[result.initiatorLoveLanguage] ??
        result.initiatorLoveLanguage,
      partnerLoveLanguage:
        LOVE_LANGUAGE_LABELS[result.partnerLoveLanguage] ??
        result.partnerLoveLanguage,
      overallScore: result.overallScore,
      dimensions: (result.dimensions as Record<string, number>) ?? {},
    };

    const rawStream = await generateReportStream(payload);
    if (!rawStream) {
      return NextResponse.json(
        { message: "报告流生成失败" },
        { status: 503 },
      );
    }

    const resultId = result.id;
    const chunks: Uint8Array[] = [];

    const transform = new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        chunks.push(chunk);
        controller.enqueue(chunk);
      },
      async flush() {
        try {
          const full = chunks
            .map((c) => new TextDecoder().decode(c))
            .join("");
          const parsed = parseReportJson(full);
          await prisma.result.update({
            where: { id: resultId },
            data: {
              reportBasic: JSON.parse(JSON.stringify(parsed)) as object,
            },
          });
          console.log("基础报告流式写入完成，resultId:", resultId);
        } catch (e) {
          console.error("流式报告解析/写入失败:", e);
        }
      },
    });

    rawStream.pipeThrough(transform);
    return new Response(transform.readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("GET /api/v1/result/[sessionId]/report/stream error:", err.message);
    return NextResponse.json(
      { message: "获取报告流失败" },
      { status: 500 },
    );
  }
}
