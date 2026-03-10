import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** 前端注入 GA4/Umami/Clarity 脚本用，无需鉴权 */
export async function GET() {
  try {
    const settings = await prisma.siteSettings.findFirst();
    if (!settings) {
      return NextResponse.json({
        enableGa4: false,
        ga4MeasurementId: null,
        enableUmami: false,
        umamiScriptUrl: null,
        umamiWebsiteId: null,
        enableClarity: false,
        clarityProjectId: null,
      });
    }
    return NextResponse.json({
      enableGa4: settings.enableGa4,
      ga4MeasurementId: settings.ga4MeasurementId ?? null,
      enableUmami: settings.enableUmami,
      umamiScriptUrl: settings.umamiScriptUrl ?? null,
      umamiWebsiteId: settings.umamiWebsiteId ?? null,
      enableClarity: settings.enableClarity,
      clarityProjectId: settings.clarityProjectId ?? null,
    });
  } catch {
    return NextResponse.json({
      enableGa4: false,
      ga4MeasurementId: null,
      enableUmami: false,
      umamiScriptUrl: null,
      umamiWebsiteId: null,
      enableClarity: false,
      clarityProjectId: null,
    });
  }
}
