/**
 * 微信公众号 OAuth2 网页授权
 * 用于在微信浏览器内获取用户 openid（静默授权 snsapi_base）
 */

const APP_ID = () => process.env.WECHAT_PAY_APP_ID || "";
const APP_SECRET = () => process.env.WECHAT_APP_SECRET || "";
const BASE_URL = () =>
  process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "https://hepaima.kyx123.com";

/** 构造微信 OAuth2 授权跳转 URL（静默授权） */
export function buildOAuthRedirectUrl(returnPath: string): string {
  const callbackUrl = `${BASE_URL()}/api/v1/wechat/oauth/callback`;
  const state = encodeURIComponent(returnPath);
  return (
    `https://open.weixin.qq.com/connect/oauth2/authorize` +
    `?appid=${APP_ID()}` +
    `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
    `&response_type=code` +
    `&scope=snsapi_base` +
    `&state=${state}` +
    `#wechat_redirect`
  );
}

/** 用 OAuth code 换取 openid */
export async function getOpenIdByCode(code: string): Promise<string> {
  const url =
    `https://api.weixin.qq.com/sns/oauth2/access_token` +
    `?appid=${APP_ID()}` +
    `&secret=${APP_SECRET()}` +
    `&code=${code}` +
    `&grant_type=authorization_code`;

  const res = await fetch(url);
  const data = (await res.json()) as {
    openid?: string;
    errcode?: number;
    errmsg?: string;
  };

  if (!data.openid) {
    console.error("[wechat oauth] 获取 openid 失败:", data);
    throw new Error(data.errmsg || "获取 openid 失败");
  }

  return data.openid;
}
