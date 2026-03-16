import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const err = requireAdmin(req);
  if (err) return err;

  try {
    const { id } = await ctx.params;

    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        result: true,
      },
    });

    if (!session) {
      return NextResponse.json({ message: "会话不存在" }, { status: 404 });
    }

    const result = session.result;
    let payment: {
      hasPaid: boolean;
      amount: number | null;
      paymentMethod: string | null;
      paidAt: Date | null;
    } | null = null;

    if (result) {
      const paidOrder = await prisma.order.findFirst({
        where: { resultId: result.id, status: "PAID" },
        orderBy: { createdAt: "desc" },
      });
      payment = paidOrder
        ? {
            hasPaid: true,
            amount: paidOrder.amount,
            paymentMethod: paidOrder.paymentMethod ?? null,
            paidAt: paidOrder.paidAt ?? null,
          }
        : {
            hasPaid: false,
            amount: null,
            paymentMethod: null,
            paidAt: null,
          };
    }

    return NextResponse.json({
      session: {
        id: session.id,
        stage: session.stage,
        createdAt: session.createdAt,
        initiatorName: session.initiatorName,
        partnerName: session.partnerName,
        initiatorCompletedAt: session.initiatorCompletedAt,
        partnerCompletedAt: session.partnerCompletedAt,
      },
      result: result
        ? {
            id: result.id,
            overallScore: result.overallScore,
            dimensions: result.dimensions,
            purchasedTier: result.purchasedTier,
            initiatorAttachment: result.initiatorAttachment,
            partnerAttachment: result.partnerAttachment,
            initiatorLoveLanguage: result.initiatorLoveLanguage,
            partnerLoveLanguage: result.partnerLoveLanguage,
            reportBasic: result.reportBasic,
            reportStandard: result.reportStandard,
            reportPremium: result.reportPremium,
          }
        : null,
      payment,
    });
  } catch (e) {
    console.error("GET /api/v1/admin/session/[id] error:", e);
    return NextResponse.json({ message: "获取会话详情失败" }, { status: 500 });
  }
}

