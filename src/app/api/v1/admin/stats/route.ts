import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const err = requireAdmin(req);
  if (err) return err;

  try {
    const now = new Date();
    // 使用本地日期，避免时区导致的日期偏移；含今天在内共 7 天
    const sevenDaysAgo = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 6,
    );

    const toDateKey = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    const [
      sessionsTotal,
      sessionsCompleted,
      resultsTotal,
      ordersPaid,
      redeemTotal,
      redeemUsed,
      redeemUsedToday,
      promoTotal,
      promoUsed,
      recentOrders,
      redeemPreviewRaw,
      recentSessions,
      recentCompletedSessionsRaw,
      recentCompletedOrders,
    ] = await Promise.all([
      prisma.session.count(),
      prisma.session.count({ where: { status: "COMPLETED" } }),
      prisma.result.count(),
      prisma.order.findMany({
        where: { status: "PAID" },
        select: { amount: true, paidAt: true, createdAt: true },
      }),
      prisma.redeemCode.count(),
      prisma.redeemCode.count({ where: { firstUsedAt: { not: null } } }),
      (async () => {
        const todayStart = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );
        return prisma.redeemCodeUsage.count({
          where: { usedAt: { gte: todayStart } },
        });
      })(),
      prisma.promoCode.count(),
      prisma.promoCode.count({ where: { usedCount: { gt: 0 } } }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          resultId: true,
          tier: true,
          amount: true,
          status: true,
          paymentMethod: true,
          paymentId: true,
          paidAt: true,
          createdAt: true,
        },
      }),
      prisma.redeemCode.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          code: true,
          batchId: true,
          firstUsedAt: true,
          createdAt: true,
          expiresAt: true,
          disabled: true,
        },
      }),
      prisma.session.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          stage: true,
          createdAt: true,
          initiatorName: true,
          partnerName: true,
          status: true,
          initiatorCompletedAt: true,
          partnerCompletedAt: true,
        },
      }),
      prisma.session.findMany({
        where: { status: "COMPLETED" },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          createdAt: true,
          initiatorCompletedAt: true,
          partnerCompletedAt: true,
          stage: true,
          initiatorName: true,
          partnerName: true,
          result: {
            select: {
              id: true,
            },
          },
        },
      }),
      prisma.order.findMany({
        where: {
          status: "PAID",
        },
        orderBy: { createdAt: "desc" },
        take: 200,
        select: {
          id: true,
          resultId: true,
          amount: true,
          paymentMethod: true,
          paidAt: true,
        },
      }),
    ]);

    const revenueCents = ordersPaid.reduce((sum, o) => sum + o.amount, 0);

    // 近期测评场次列表
    const recentSessionsList = recentSessions.map((s) => ({
      id: s.id,
      stage: s.stage,
      createdAt: s.createdAt,
      initiatorName: s.initiatorName,
      partnerName: s.partnerName,
      status: s.status,
      initiatorCompletedAt: s.initiatorCompletedAt,
      partnerCompletedAt: s.partnerCompletedAt,
    }));

    // 近期完成测评 + 付费信息
    const paidOrderByResult = new Map<
      string,
      { amount: number; paymentMethod: string | null; paidAt: Date | null }
    >();
    for (const o of recentCompletedOrders) {
      if (!o.resultId) continue;
      if (!paidOrderByResult.has(o.resultId)) {
        paidOrderByResult.set(o.resultId, {
          amount: o.amount,
          paymentMethod: o.paymentMethod ?? null,
          paidAt: o.paidAt ?? null,
        });
      }
    }

    const recentCompletedSessions = recentCompletedSessionsRaw.map((s) => {
      const resultId = s.result?.id ?? null;
      const paid = resultId ? paidOrderByResult.get(resultId) : undefined;
      return {
        id: s.id,
        stage: s.stage,
        createdAt: s.createdAt,
        initiatorName: s.initiatorName,
        partnerName: s.partnerName,
        initiatorCompletedAt: s.initiatorCompletedAt,
        partnerCompletedAt: s.partnerCompletedAt,
        hasPaid: !!paid,
        paidAmount: paid?.amount ?? 0,
        paymentMethod: paid?.paymentMethod ?? null,
      };
    });

    const redeemPreview = redeemPreviewRaw.map((r) => {
      const nowTs = new Date();
      let status: "UNUSED" | "USED" | "EXPIRED" | "DISABLED" = "UNUSED";
      if (r.disabled) {
        status = "DISABLED";
      } else if (r.expiresAt && r.expiresAt < nowTs) {
        status = "EXPIRED";
      } else if (r.firstUsedAt) {
        status = "USED";
      }
      return {
        id: r.id,
        code: r.code,
        batchId: r.batchId,
        status,
        createdAt: r.createdAt,
        firstUsedAt: r.firstUsedAt,
        expiresAt: r.expiresAt,
      };
    });

    const dayMap = new Map<string, {
      sessions: number;
      completed: number;
      paidOrders: number;
      revenue: number;
    }>();
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const key = toDateKey(d);
      dayMap.set(key, {
        sessions: 0,
        completed: 0,
        paidOrders: 0,
        revenue: 0,
      });
    }

    const sessionsInPeriod = await prisma.session.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true, status: true },
    });
    for (const s of sessionsInPeriod) {
      const key = toDateKey(new Date(s.createdAt));
      const row = dayMap.get(key);
      if (row) {
        row.sessions += 1;
        if (s.status === "COMPLETED") row.completed += 1;
      }
    }

    for (const o of ordersPaid) {
      const at = o.paidAt ?? o.createdAt;
      if (at >= sevenDaysAgo) {
        const key = toDateKey(new Date(at));
        const row = dayMap.get(key);
        if (row) {
          row.paidOrders += 1;
          row.revenue += o.amount;
        }
      }
    }

    const daily = Array.from(dayMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, v]) => ({
        date,
        sessions: v.sessions,
        completed: v.completed,
        paidOrders: v.paidOrders,
        revenue: v.revenue,
      }));

    let traffic: {
      todayPv: number;
      todayUv: number;
      dailyTraffic: { date: string; pv: number; uv: number }[];
      eventCounts: Record<string, number>;
    } | null = null;
    try {
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
      const [todayPv, todayUvRows, eventsLast7d, eventCountsByType] = await Promise.all([
        prisma.analyticsEvent.count({ where: { createdAt: { gte: todayStart } } }),
        prisma.analyticsEvent.findMany({
          where: { createdAt: { gte: todayStart }, visitorId: { not: null } },
          select: { visitorId: true },
        }),
        prisma.analyticsEvent.findMany({
          where: { createdAt: { gte: sevenDaysAgo } },
          select: { eventType: true, visitorId: true, createdAt: true },
        }),
        prisma.analyticsEvent.groupBy({
          by: ["eventType"],
          where: { createdAt: { gte: sevenDaysAgo } },
          _count: true,
        }),
      ]);
      const todayUv = new Set(todayUvRows.map((r) => r.visitorId).filter(Boolean)).size;
      const trafficByDay = new Map<string, { pv: number; uv: number }>();
      for (let i = 0; i < 7; i++) {
        const d = new Date(sevenDaysAgo);
        d.setDate(d.getDate() + i);
        const key = toDateKey(d);
        trafficByDay.set(key, { pv: 0, uv: 0 });
      }
      for (const e of eventsLast7d) {
        const key = toDateKey(new Date(e.createdAt));
        const row = trafficByDay.get(key);
        if (row) row.pv += 1;
      }
      const uvByDay = new Map<string, Set<string>>();
      for (const e of eventsLast7d) {
        if (!e.visitorId) continue;
        const key = toDateKey(new Date(e.createdAt));
        if (!uvByDay.has(key)) uvByDay.set(key, new Set());
        uvByDay.get(key)!.add(e.visitorId);
      }
      const dailyTraffic = Array.from(trafficByDay.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, v]) => ({
          date,
          pv: v.pv,
          uv: uvByDay.get(date)?.size ?? 0,
        }));
      traffic = {
        todayPv,
        todayUv,
        dailyTraffic,
        eventCounts: Object.fromEntries(eventCountsByType.map((x) => [x.eventType, x._count])),
      };
    } catch (trafficErr) {
      console.warn("admin/stats: traffic (AnalyticsEvent) query failed, omitting traffic", trafficErr);
    }

    return NextResponse.json({
      sessionsTotal,
      sessionsCompleted,
      resultsTotal,
      ordersPaidCount: ordersPaid.length,
      revenueCents,
      redeemTotal,
      redeemUsed,
      redeemUsedToday,
      promoTotal,
      promoUsed,
      daily,
      recentOrders,
      redeemPreview,
      recentSessions: recentSessionsList,
      recentCompletedSessions,
      ...(traffic ? { traffic } : {}),
    });
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error("GET /api/v1/admin/stats error:", error);
    return NextResponse.json(
      { message: "获取统计数据失败" },
      { status: 500 },
    );
  }
}
