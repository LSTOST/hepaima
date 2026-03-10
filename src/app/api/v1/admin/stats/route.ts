import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const err = requireAdmin(req);
  if (err) return err;

  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [
      sessionsTotal,
      sessionsCompleted,
      resultsTotal,
      ordersPaid,
      redeemTotal,
      redeemUsed,
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
    ]);

    const revenueCents = ordersPaid.reduce((sum, o) => sum + o.amount, 0);

    const dayMap = new Map<string, { sessions: number; completed: number; paidOrders: number; revenue: number }>();
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      d.setHours(0, 0, 0, 0);
      dayMap.set(d.toISOString().slice(0, 10), { sessions: 0, completed: 0, paidOrders: 0, revenue: 0 });
    }

    const sessionsInPeriod = await prisma.session.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true, status: true },
    });
    for (const s of sessionsInPeriod) {
      const key = s.createdAt.toISOString().slice(0, 10);
      const row = dayMap.get(key);
      if (row) {
        row.sessions += 1;
        if (s.status === "COMPLETED") row.completed += 1;
      }
    }

    for (const o of ordersPaid) {
      const at = o.paidAt ?? o.createdAt;
      if (at >= sevenDaysAgo) {
        const key = at.toISOString().slice(0, 10);
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
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
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
        d.setHours(0, 0, 0, 0);
        trafficByDay.set(d.toISOString().slice(0, 10), { pv: 0, uv: 0 });
      }
      for (const e of eventsLast7d) {
        const key = e.createdAt.toISOString().slice(0, 10);
        const row = trafficByDay.get(key);
        if (row) row.pv += 1;
      }
      const uvByDay = new Map<string, Set<string>>();
      for (const e of eventsLast7d) {
        if (!e.visitorId) continue;
        const key = e.createdAt.toISOString().slice(0, 10);
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
      daily,
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
