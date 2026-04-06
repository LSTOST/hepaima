import { NextRequest, NextResponse } from "next/server";

/**
 * 代理转发至 Railway FastAPI：POST {ATTACHMENT_REPORT_API_BASE}/quiz/submit
 */
export async function POST(req: NextRequest) {
  console.log("attachment-test submit received");
  const base = process.env.ATTACHMENT_REPORT_API_BASE?.trim();
  if (!base) {
    return NextResponse.json(
      { error: "服务器未配置 ATTACHMENT_REPORT_API_BASE" },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求体不是合法 JSON" }, { status: 400 });
  }

  const url = `${base.replace(/\/$/, "")}/quiz/submit`;

  console.log(
    "[attachment-test submit] forwarding",
    "url=",
    url,
    "body=",
    JSON.stringify(body)
  );

  try {
    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await upstream.text();
    let data: unknown = text;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }

    return NextResponse.json(data as object, { status: upstream.status });
  } catch (e) {
    console.error("[attachment-test submit proxy]", e);
    return NextResponse.json({ error: "无法连接报告服务，请稍后重试" }, { status: 502 });
  }
}
