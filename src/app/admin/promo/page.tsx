"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Percent,
  Plus,
  Search,
  Copy,
  Download,
  Ban,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ADMIN_PASSWORD_HEADER_KEY } from "@/lib/admin-auth";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const PAGE_SIZE = 10;
const STATUS_OPTIONS = [
  { value: "all", label: "全部状态" },
  { value: "UNUSED", label: "未使用" },
  { value: "USED", label: "已使用" },
  { value: "EXPIRED", label: "已过期" },
  { value: "DISABLED", label: "已禁用" },
];

const TYPE_OPTIONS = [
  { value: "FREE_UNLOCK", label: "免单" },
  { value: "FIXED_OFF", label: "固定减免（元）" },
  { value: "PERCENT_OFF", label: "折扣（折）" },
];

function authHeaders(password: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    [ADMIN_PASSWORD_HEADER_KEY]: password,
  };
}

type PromoCodeRow = {
  id: string;
  code: string;
  type: string;
  value: number;
  maxUses: number | null;
  usedCount: number;
  batchId: string | null;
  status: string;
  disabled?: boolean;
  createdAt: string;
  expiresAt: string | null;
  usagesCount: number;
  usages?: { resultId: string; orderId: string | null; usedAt: string }[];
};

type Stats = {
  total: number;
  unused: number;
  used: number;
  expired: number;
  disabled: number;
  totalUsages: number;
  batches: string[];
};

function statusStyle(status: string): { label: string; className: string } {
  switch (status) {
    case "UNUSED":
      return { label: "未使用", className: "bg-emerald-100 text-emerald-700" };
    case "USED":
      return { label: "已使用", className: "bg-slate-100 text-slate-600" };
    case "EXPIRED":
      return { label: "已过期", className: "bg-amber-100 text-amber-700" };
    case "DISABLED":
      return { label: "已禁用", className: "bg-red-100 text-red-600" };
    default:
      return { label: status, className: "bg-gray-100 text-gray-600" };
  }
}

function typeDisplay(type: string, value: number): string {
  switch (type) {
    case "FREE_UNLOCK":
      return "免单";
    case "FIXED_OFF":
      return `减 ¥${(value / 100).toFixed(2)}`;
    case "PERCENT_OFF":
      return `${value} 折`;
    default:
      return type;
  }
}

export default function AdminPromoPage() {
  const {
    password,
    passwordInput,
    setPasswordInput,
    authenticated,
    authError,
    handleLogin,
  } = useAdminAuth();
  const [showPassword, setShowPassword] = useState(false);

  const [stats, setStats] = useState<Stats | null>(null);
  const [list, setList] = useState<PromoCodeRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [view, setView] = useState<"list" | "generate">("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterBatch, setFilterBatch] = useState("all");
  const [filterType, setFilterType] = useState<"all" | "FREE_UNLOCK" | "FIXED_OFF" | "PERCENT_OFF">("all");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [selectedCode, setSelectedCode] = useState<PromoCodeRow | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState<PromoCodeRow | null>(null);

  const [genType, setGenType] = useState<"FREE_UNLOCK" | "FIXED_OFF" | "PERCENT_OFF">("FREE_UNLOCK");
  const [genValue, setGenValue] = useState(0);
  const [genCount, setGenCount] = useState(50);
  const [genBatch, setGenBatch] = useState("");
  const [genExpiry, setGenExpiry] = useState(90);
  const [genMaxUses, setGenMaxUses] = useState<number | "">("");
  const [generating, setGenerating] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<string[] | null>(null);

  const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchStats = useCallback(async () => {
    if (!password) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/promo/stats?t=${Date.now()}`, {
        headers: authHeaders(password),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.hint ? `${data.message}（${data.hint}）` : data.message ?? "获取统计失败";
        throw new Error(msg);
      }
      setStats(data);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "获取统计失败", "error");
    } finally {
      setLoading(false);
    }
  }, [password, showToast]);

  const fetchList = useCallback(async () => {
    if (!password) return;
    setListLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        pageSize: String(PAGE_SIZE),
        ...(search && { search }),
        ...(filterStatus !== "all" && { status: filterStatus }),
        ...(filterBatch !== "all" && filterBatch && { batch: filterBatch }),
        ...(filterType !== "all" && { type: filterType }),
      });
      const res = await fetch(`/api/v1/admin/promo/list?${params}&t=${Date.now()}`, {
        headers: authHeaders(password),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.hint ? `${data.message}（${data.hint}）` : data.message ?? "获取列表失败";
        throw new Error(msg);
      }
      setList(data.list);
      setTotal(data.total);
      setTotalPages(data.totalPages ?? Math.ceil(data.total / PAGE_SIZE));
    } catch (e) {
      showToast(e instanceof Error ? e.message : "获取列表失败", "error");
    } finally {
      setListLoading(false);
    }
  }, [password, currentPage, search, filterStatus, filterBatch, filterType, showToast]);

  useEffect(() => {
    if (authenticated && password) {
      fetchStats();
    }
  }, [authenticated, password, fetchStats]);

  useEffect(() => setCurrentPage(1), [search, filterStatus, filterBatch, filterType]);

  useEffect(() => {
    if (authenticated && password && view === "list") {
      fetchList();
    }
  }, [authenticated, password, view, fetchList]);

  const handleFetchDetail = useCallback(
    async (id: string) => {
      if (!password) return;
      setDetailLoading(true);
      setDetailData(null);
      try {
        const res = await fetch(`/api/v1/admin/promo/${id}?t=${Date.now()}`, {
          headers: authHeaders(password),
        });
        if (!res.ok) throw new Error("获取详情失败");
        const data = await res.json();
        setDetailData(data);
      } catch {
        showToast("获取详情失败", "error");
      } finally {
        setDetailLoading(false);
      }
    },
    [password, showToast],
  );

  const openDetail = (row: PromoCodeRow) => {
    setSelectedCode(row);
    handleFetchDetail(row.id);
  };

  const handleDisable = async (id: string) => {
    if (!password) return;
    try {
      const res = await fetch(`/api/v1/admin/promo/${id}`, {
        method: "PATCH",
        headers: authHeaders(password),
        body: JSON.stringify({ disabled: true }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? "操作失败");
      }
      showToast("已禁用");
      setList((prev) =>
        prev.map((row) =>
          row.id === id ? { ...row, status: "DISABLED", disabled: true } : row,
        ),
      );
      fetchList();
      fetchStats();
      if (selectedCode?.id === id) {
        setDetailData((d) => (d?.id === id ? { ...d, status: "DISABLED" } : d));
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : "操作失败", "error");
    }
  };

  const handleEnable = async (id: string) => {
    if (!password) return;
    try {
      const res = await fetch(`/api/v1/admin/promo/${id}`, {
        method: "PATCH",
        headers: authHeaders(password),
        body: JSON.stringify({ disabled: false }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? "操作失败");
      }
      showToast("已启用");
      setList((prev) =>
        prev.map((row) => {
          if (row.id !== id) return row;
          const isExpired = row.expiresAt && new Date(row.expiresAt) < new Date();
          const nextStatus = isExpired
            ? "EXPIRED"
            : (row.usedCount ?? 0) > 0
              ? "USED"
              : "UNUSED";
          return { ...row, status: nextStatus, disabled: false };
        }),
      );
      fetchList();
      fetchStats();
      if (selectedCode?.id === id) {
        setDetailData((d) =>
          d?.id === id
            ? {
                ...d,
                status:
                  (d.usedCount ?? 0) > 0
                    ? "USED"
                    : d.expiresAt && new Date(d.expiresAt) < new Date()
                      ? "EXPIRED"
                      : "UNUSED",
                disabled: false,
              }
            : d,
        );
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : "操作失败", "error");
    }
  };

  const handleCopyCode = useCallback(
    async (code: string) => {
      const text = String(code ?? "").trim();
      if (!text) {
        showToast("无内容可复制", "error");
        return;
      }
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
          showToast("已复制到剪贴板");
          return;
        }
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(textarea);
        if (ok) {
          showToast("已复制到剪贴板");
        } else {
          showToast("复制失败，请手动复制", "error");
        }
      } catch {
        showToast("复制失败，请手动复制", "error");
      }
    },
    [showToast],
  );

  const handleExport = useCallback(async () => {
    if (!password) return;
    try {
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.set("status", filterStatus);
      if (filterBatch !== "all" && filterBatch) params.set("batch", filterBatch);
      if (filterType !== "all") params.set("type", filterType);
      const res = await fetch(`/api/v1/admin/promo/export?${params}`, {
        headers: authHeaders(password),
      });
      if (!res.ok) throw new Error("导出失败");
      const text = await res.text();
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hepaima-promo-codes-${new Date().toISOString().slice(0, 10)}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`已导出 ${text.split("\n").filter(Boolean).length} 个优惠码`);
    } catch {
      showToast("导出失败", "error");
    }
  }, [password, filterStatus, filterBatch, filterType, showToast]);

  const handleGenerate = async () => {
    if (!password) return;
    let value = genValue;
    if (genType === "FREE_UNLOCK") value = 0;
    if (genType === "PERCENT_OFF" && (value < 1 || value > 99)) {
      showToast("折扣请填写 1～99", "error");
      return;
    }
    if (genType === "FIXED_OFF" && value < 0) {
      showToast("固定减免请填写金额（元），将转为分", "error");
      return;
    }
    if (genType === "FIXED_OFF") value = Math.round(value * 100);
    setGenerating(true);
    setGeneratedCodes(null);
    try {
      const res = await fetch("/api/v1/admin/promo/generate", {
        method: "POST",
        headers: authHeaders(password),
        body: JSON.stringify({
          type: genType,
          value: genType === "FREE_UNLOCK" ? 0 : value,
          count: genCount,
          batchId: genBatch.trim() || undefined,
          expiresInDays: genExpiry,
          maxUses: genMaxUses === "" ? undefined : Number(genMaxUses),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message ?? "生成失败");
      setGeneratedCodes(data.codes ?? []);
      showToast(`成功生成 ${data.codes?.length ?? 0} 个优惠码`);
      fetchStats();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "生成失败", "error");
    } finally {
      setGenerating(false);
    }
  };

  const batches = useMemo(
    () => stats?.batches ?? [],
    [stats?.batches],
  );

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm rounded-2xl bg-white border border-slate-200 shadow-lg p-8"
        >
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center">
              <Percent className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-center text-slate-800 mb-2">
            优惠码管理后台
          </h1>
          <p className="text-sm text-slate-500 text-center mb-6">
            用于深度报告解锁减免/免单，请输入管理密码
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="密码"
                className="w-full px-4 py-3 pr-10 rounded-xl border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? "隐藏密码" : "显示密码"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {authError && (
              <p className="text-sm text-red-500 text-center">{authError}</p>
            )}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white rounded-xl py-3"
            >
              登录
            </Button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[100] px-4 py-2 rounded-lg text-sm font-medium ${
            toast.type === "error" ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"
          }`}
        >
          {toast.msg}
        </div>
      )}
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-7">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center text-xs text-slate-400 hover:text-slate-700 hover:font-semibold mr-2"
            >
              <ChevronLeft className="w-3 h-3 mr-1" />
              返回总览
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center text-white">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-lg bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
                  优惠码管理
                </div>
                <div className="text-xs text-slate-400">深度报告减免/免单</div>
              </div>
            </div>
          </div>
          <Button
            onClick={() => {
              setView("generate");
              setGeneratedCodes(null);
            }}
            className="bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white rounded-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            生成优惠码
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-xl bg-white border border-slate-200 animate-pulse"
              />
            ))}
          </div>
        ) : stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {[
              { label: "总优惠码", value: stats.total, color: "text-violet-600" },
              { label: "未使用", value: stats.unused, color: "text-emerald-600" },
              { label: "已使用", value: stats.used, color: "text-slate-600" },
              { label: "已过期", value: stats.expired, color: "text-amber-600" },
              { label: "已禁用", value: stats.disabled, color: "text-red-600" },
              { label: "总使用次数", value: stats.totalUsages, color: "text-blue-600" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl bg-white border border-slate-200 p-4"
              >
                <div className="text-xs text-slate-400 font-medium mb-1">
                  {item.label}
                </div>
                <div className={`text-2xl font-bold ${item.color}`}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-1 p-1 bg-slate-200 rounded-lg w-fit mb-5">
          <button
            type="button"
            onClick={() => setView("list")}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
              view === "list"
                ? "bg-white text-slate-800 shadow"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            优惠码列表
          </button>
          <button
            type="button"
            onClick={() => {
              setView("generate");
              setGeneratedCodes(null);
            }}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
              view === "generate"
                ? "bg-white text-slate-800 shadow"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            生成优惠码
          </button>
        </div>

        {view === "list" && (
          <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative max-w-[260px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="搜索优惠码 / 批次号..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && setCurrentPage(1)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-violet-300"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value as typeof filterType);
                    setCurrentPage(1);
                  }}
                  className="py-2 px-3 rounded-lg border border-slate-200 text-sm bg-white"
                >
                  <option value="all">全部类型</option>
                  {TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="py-2 px-3 rounded-lg border border-slate-200 text-sm bg-white"
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <select
                  value={filterBatch}
                  onChange={(e) => {
                    setFilterBatch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="py-2 px-3 rounded-lg border border-slate-200 text-sm bg-white"
                >
                  <option value="all">全部批次</option>
                  {batches.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="rounded-lg"
              >
                <Download className="w-4 h-4 mr-1.5" />
                导出
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 px-4 font-semibold text-slate-400 uppercase tracking-wide">
                      优惠码
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-400 uppercase tracking-wide">
                      类型
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-400 uppercase tracking-wide">
                      已用/上限
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-400 uppercase tracking-wide">
                      批次
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-400 uppercase tracking-wide">
                      状态
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-400 uppercase tracking-wide">
                      过期时间
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-400 uppercase tracking-wide">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {listLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        加载中...
                      </td>
                    </tr>
                  ) : list.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        没有符合条件的优惠码
                      </td>
                    </tr>
                  ) : (
                    list.map((c) => {
                      const st = statusStyle(c.status);
                      return (
                        <tr
                          key={c.id}
                          className="border-b border-slate-50 hover:bg-slate-50/80 cursor-pointer transition"
                          onClick={() => openDetail(c)}
                        >
                          <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                            {c.code}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {typeDisplay(c.type, c.value)}
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {c.usedCount}
                            {c.maxUses != null ? ` / ${c.maxUses}` : " / —"}
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {c.batchId ?? "—"}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${st.className}`}
                            >
                              {st.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {c.expiresAt
                              ? new Date(c.expiresAt).toLocaleDateString("zh-CN")
                              : "—"}
                          </td>
                          <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleCopyCode(c.code)}
                                title="复制"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </Button>
                              {c.status === "DISABLED" ? (
                                <Button
                                  size="icon"
                                  className="h-8 w-8 bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                  onClick={() => handleEnable(c.id)}
                                  title="启用"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </Button>
                              ) : (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-red-600 hover:bg-red-50"
                                  onClick={() => handleDisable(c.id)}
                                  title="禁用"
                                  disabled={c.status === "USED"}
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-sm text-slate-500">
              <span>共 {total} 条</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="rounded-md"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="font-medium text-slate-700 px-2">
                  {currentPage} / {totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="rounded-md"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {view === "generate" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 font-semibold">
                生成优惠码
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">
                    类型
                  </label>
                  <select
                    value={genType}
                    onChange={(e) =>
                      setGenType(e.target.value as "FREE_UNLOCK" | "FIXED_OFF" | "PERCENT_OFF")
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    {TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                {genType !== "FREE_UNLOCK" && (
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      {genType === "FIXED_OFF" ? "减免金额（元）" : "折扣（1～99 折）"}
                    </label>
                    <input
                      type="number"
                      min={genType === "PERCENT_OFF" ? 1 : 0}
                      max={genType === "PERCENT_OFF" ? 99 : undefined}
                      step={genType === "FIXED_OFF" ? 0.01 : 1}
                      value={genValue}
                      onChange={(e) => setGenValue(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">
                    生成数量
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={genCount}
                    onChange={(e) =>
                      setGenCount(
                        Math.min(500, Math.max(1, Number(e.target.value) || 0)),
                      )
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                  <p className="text-xs text-slate-400 mt-1">单次最多 500 个</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">
                    批次号（选填）
                  </label>
                  <input
                    type="text"
                    placeholder="如 PROMO-001"
                    value={genBatch}
                    onChange={(e) => setGenBatch(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">
                    有效期（天）
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={genExpiry}
                    onChange={(e) => setGenExpiry(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">
                    单码使用上限（选填，留空不限制）
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={genMaxUses}
                    onChange={(e) => {
                      const v = e.target.value;
                      setGenMaxUses(v === "" ? "" : Math.max(1, Number(v) || 0));
                    }}
                    placeholder="不限制"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                  将生成 <strong>{genCount}</strong> 个优惠码（
                  {typeDisplay(genType, genType === "FIXED_OFF" ? genValue * 100 : genType === "PERCENT_OFF" ? genValue : 0)}
                  ），有效期 <strong>{genExpiry}</strong> 天。
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white rounded-xl py-3"
                  onClick={handleGenerate}
                  disabled={generating}
                >
                  {generating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      生成 {genCount} 个优惠码
                    </>
                  )}
                </Button>
              </div>
            </div>

            {generatedCodes && generatedCodes.length > 0 && (
              <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-semibold">
                    已生成 {generatedCodes.length} 个码
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const text = generatedCodes.join("\n");
                      const blob = new Blob([text], {
                        type: "text/plain;charset=utf-8",
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `hepaima-promo-codes-${new Date().toISOString().slice(0, 10)}.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                      showToast("已导出");
                    }}
                    className="rounded-lg"
                  >
                    <Download className="w-4 h-4 mr-1.5" />
                    导出 TXT
                  </Button>
                </div>
                <div className="p-4 max-h-[400px] overflow-auto font-mono text-xs text-slate-600 space-y-1">
                  {generatedCodes.slice(0, 50).map((code, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-1"
                    >
                      <span>{code}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => handleCopyCode(code)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  {generatedCodes.length > 50 && (
                    <p className="text-slate-400 text-center py-2 text-[11px]">
                      仅显示前 50 个，导出获取全部
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedCode && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCode(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[85vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold">优惠码详情</span>
              <button
                type="button"
                onClick={() => setSelectedCode(null)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              {detailLoading ? (
                <div className="py-8 text-center text-slate-400">
                  加载中...
                </div>
              ) : detailData ? (
                <>
                  <div className="text-center mb-5">
                    <div className="font-mono text-xl font-bold tracking-wider text-slate-800 py-3">
                      {detailData.code}
                    </div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusStyle(detailData.status).className}`}
                    >
                      {statusStyle(detailData.status).label}
                    </span>
                    <p className="text-sm text-slate-500 mt-2">
                      {typeDisplay(detailData.type, detailData.value)} · 已用 {detailData.usedCount}
                      {detailData.maxUses != null ? ` / ${detailData.maxUses}` : ""} 次
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="rounded-lg bg-slate-50 p-3">
                      <div className="text-xs text-slate-400">批次号</div>
                      <div className="font-semibold text-slate-800">
                        {detailData.batchId ?? "—"}
                      </div>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3">
                      <div className="text-xs text-slate-400">创建时间</div>
                      <div className="font-semibold text-slate-800 text-xs">
                        {new Date(detailData.createdAt).toLocaleString("zh-CN")}
                      </div>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3">
                      <div className="text-xs text-slate-400">过期时间</div>
                      <div className="font-semibold text-slate-800 text-xs">
                        {detailData.expiresAt
                          ? new Date(detailData.expiresAt).toLocaleDateString("zh-CN")
                          : "永不"}
                      </div>
                    </div>
                  </div>
                  {"usages" in detailData && Array.isArray(detailData.usages) && detailData.usages.length > 0 && (
                    <div className="mb-4">
                      <div className="text-xs text-slate-400 font-medium mb-2">使用记录</div>
                      <div className="space-y-2 max-h-32 overflow-auto">
                        {detailData.usages.map((u: { resultId: string; orderId: string | null; usedAt: string }, i: number) => (
                          <div
                            key={i}
                            className="text-xs text-slate-600 bg-slate-50 rounded px-2 py-1.5"
                          >
                            {new Date(u.usedAt).toLocaleString("zh-CN")} · resultId 后四位 {u.resultId.slice(-4)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl"
                      onClick={() => handleCopyCode(detailData.code)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      复制
                    </Button>
                    {detailData.status === "DISABLED" ? (
                      <Button
                        className="flex-1 rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        onClick={() => handleEnable(detailData.id)}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        启用
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="flex-1 rounded-xl text-red-600 border-red-200"
                        onClick={() => handleDisable(detailData.id)}
                        disabled={detailData.status === "USED"}
                      >
                        <Ban className="w-4 h-4 mr-2" />
                        禁用
                      </Button>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
