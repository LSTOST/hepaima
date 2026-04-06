import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UPSTREAM_BASE = "http://127.0.0.1:8001/download/";

const HOP_BY_HOP_REQ = new Set([
  "connection",
  "keep-alive",
  "proxy-connection",
  "transfer-encoding",
  "upgrade",
]);

const HOP_BY_HOP_RES = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
]);

function forwardRequestHeaders(req: NextRequest): Headers {
  const out = new Headers();
  req.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (k === "host" || HOP_BY_HOP_REQ.has(k)) return;
    out.set(key, value);
  });
  return out;
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ responseId: string }> }
) {
  const { responseId } = await ctx.params;
  if (!responseId) {
    return NextResponse.json({ error: "缺少 responseId" }, { status: 400 });
  }

  const upstreamUrl = new URL(
    `${UPSTREAM_BASE}${encodeURIComponent(responseId)}`
  );
  upstreamUrl.search = req.nextUrl.search;

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl.toString(), {
      method: "GET",
      headers: forwardRequestHeaders(req),
      redirect: "manual",
    });
  } catch (e) {
    console.error("[download proxy] upstream fetch failed", e);
    return NextResponse.json(
      { error: "无法连接报告服务，请稍后重试" },
      { status: 502 }
    );
  }

  const body = await upstream.arrayBuffer();

  const resHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (HOP_BY_HOP_RES.has(k)) return;
    if (k === "content-length") return;
    if (k === "content-encoding") return;
    resHeaders.set(key, value);
  });

  return new NextResponse(body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: resHeaders,
  });
}
