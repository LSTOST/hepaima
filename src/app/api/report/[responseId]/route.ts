import { NextRequest, NextResponse } from "next/server";
import { fetchAttachmentReportData } from "@/lib/attachment-report/fetch-report-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ responseId: string }> }
) {
  const { responseId } = await ctx.params;
  const result = await fetchAttachmentReportData(responseId ?? "");

  if (!result.ok) {
    return NextResponse.json(
      { error: result.message },
      { status: result.status }
    );
  }

  return NextResponse.json(result.data, {
    status: 200,
    headers: { "Cache-Control": "private, no-store" },
  });
}
