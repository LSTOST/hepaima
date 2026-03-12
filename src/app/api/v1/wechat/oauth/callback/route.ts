/**
 * GET /api/v1/wechat/oauth/callback?code=xxx&state=/result/xxx
 * 微信 OAuth2 回调：用 code 换 openid，写入 cookie，重定向回原页面
 */
import { NextRequest, NextResponse } from "next/server";
import { getOpenIdByCode } from "@/lib/wechat-oauth";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state") || "/";
  const returnPath = decodeURIComponent(state);

  if (!code) {
    console.error("[wechat oauth callback] 缺少 code");
    return NextResponse.redirect(new URL(returnPath, req.url));
  }

  try {
    const openid = await getOpenIdByCode(code);
    const baseUrl =
      process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
    const response = NextResponse.redirect(new URL(returnPath, baseUrl));
    response.cookies.set("wx_openid", openid, {
      httpOnly: false,
      secure: true,
      sameSite: "lax",
      maxAge: 7200,
      path: "/",
    });
    return response;
  } catch (e) {
    console.error("[wechat oauth callback] 获取 openid 失败:", e);
    return NextResponse.redirect(new URL(returnPath, req.url));
  }
}
