import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UPSTREAM = "http://127.0.0.1:8001/wechat/callback";

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

function buildUpstreamUrl(req: NextRequest): string {
  const u = new URL(UPSTREAM);
  u.search = req.nextUrl.search;
  return u.toString();
}

async function proxy(req: NextRequest, method: string): Promise<NextResponse> {
  const url = buildUpstreamUrl(req);
  const headers = forwardRequestHeaders(req);
  headers.delete("content-length");
  headers.delete("transfer-encoding");

  const init: RequestInit = {
    method,
    headers,
    redirect: "manual",
  };

  if (method !== "GET" && method !== "HEAD") {
    const buf = await req.arrayBuffer();
    if (buf.byteLength > 0) {
      init.body = buf;
    }
  }

  const upstream = await fetch(url, init);
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

export async function GET(req: NextRequest) {
  return proxy(req, "GET");
}

export async function POST(req: NextRequest) {
  return proxy(req, "POST");
}
