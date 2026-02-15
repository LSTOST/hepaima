import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD_HEADER = "x-admin-password";

export function getAdminPasswordFromRequest(req: NextRequest): string | null {
  return req.headers.get(ADMIN_PASSWORD_HEADER) ?? null;
}

export function requireAdmin(
  req: NextRequest,
): NextResponse | null {
  const pwd = process.env.ADMIN_PASSWORD;
  const given = getAdminPasswordFromRequest(req);
  if (!pwd || !given || given !== pwd) {
    return NextResponse.json({ message: "无权限" }, { status: 401 });
  }
  return null;
}

export const ADMIN_PASSWORD_HEADER_KEY = ADMIN_PASSWORD_HEADER;
