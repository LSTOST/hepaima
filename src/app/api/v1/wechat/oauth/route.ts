/**
 * GET /api/v1/wechat/oauth?redirect=/result/xxx
 * 发起微信 OAuth2 静默授权，重定向到微信授权页
 */
import { NextRequest, NextResponse } from "next/server";
import { buildOAuthRedirectUrl } from "@/lib/wechat-oauth";

export async function GET(req: NextRequest) {
  const redirect = req.nextUrl.searchParams.get("redirect") || "/";
  const oauthUrl = buildOAuthRedirectUrl(redirect);
  return NextResponse.redirect(oauthUrl);
}
