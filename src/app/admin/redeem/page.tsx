"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { motion } from "framer-motion";
import {
  Ticket,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ADMIN_PASSWORD_HEADER_KEY } from "@/lib/admin-auth";

const PAGE_SIZE = 10;
const STATUS_OPTIONS = [
  { value: "all", label: "全部状态" },
  { value: "UNUSED", label: "未使用" },
  { value: "USED", label: "已使用" },
  { value: "EXPIRED", label: "已过期" },
  { value: "DISABLED", label: "已禁用" },
];

function authHeaders(password: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    [ADMIN_PASSWORD_HEADER_KEY]: password,
  };
}

type RedeemCodeRow = {
  id: string;
  code: string;
  batchId: string | null;
  status: string;
  disabled?: boolean;
  usedByDeviceId: string | null;
  usedAt: string | null;
  createdAt: string;
  expiresAt: string | null;
  usages?: { stage: string; usedAt: string }[];
  usagesCount?: number;
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

export default function AdminRedeemPage() {
  const [password, setPassword] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  const [stats, setStats] = useState<Stats | null>(null);
  const [list, setList] = useState<RedeemCodeRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [view, setView] = useState<"list" | "generate">("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterBatch, setFilterBatch] = useState("all");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [selectedCode, setSelectedCode] = useState<RedeemCodeRow | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState<RedeemCodeRow | null>(null);

  const [genCount, setGenCount] = useState(100);
  const [genBatch, setGenBatch] = useState("");
  const [genExpiry, setGenExpiry] = useState(90);
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
      const res = await fetch("/api/v1/admin/redeem/stats", {
        headers: authHeaders(password),
      });
      if (!res.ok) throw new Error("获取统计失败");
      const data = await res.json();
      setStats(data);
    } catch {
      showToast("获取统计失败", "error");
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
      });
      const res = await fetch(`/api/v1/admin/redeem/list?${params}`, {
        headers: authHeaders(password),
      });
      if (!res.ok) throw new Error("获取列表失败");
      const data = await res.json();
      setList(data.list);
      setTotal(data.total);
      setTotalPages(data.totalPages ?? Math.ceil(data.total / PAGE_SIZE));
    } catch {
      showToast("获取列表失败", "error");
    } finally {
      setListLoading(false);
    }
  }, [password, currentPage, search, filterStatus, filterBatch, showToast]);

  useEffect(() => {
    if (authenticated && password) {
      fetchStats();
    }
  }, [authenticated, password, fetchStats]);

  useEffect(() => setCurrentPage(1), [search, filterStatus, filterBatch]);

  useEffect(() => {
    if (authenticated && password && view === "list") {
      fetchList();
    }
  }, [authenticated, password, view, fetchList]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const pwd = passwordInput.trim();
    if (!pwd) {
      setAuthError("请输入密码");
      return;
    }
    try {
      const res = await fetch("/api/v1/admin/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd }),
      });
      if (!res.ok) {
        setAuthError("密码错误");
        return;
      }
      setPassword(pwd);
      setAuthenticated(true);
    } catch {
      setAuthError("验证失败，请重试");
    }
  };

  const handleFetchDetail = useCallback(
    async (id: string) => {
      if (!password) return;
      setDetailLoading(true);
      setDetailData(null);
      try {
        const res = await fetch(`/api/v1/admin/redeem/${id}`, {
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

  const openDetail = (row: RedeemCodeRow) => {
    setSelectedCode(row);
    handleFetchDetail(row.id);
  };

  const handleDisable = async (id: string) => {
    if (!password) return;
    try {
      const res = await fetch(`/api/v1/admin/redeem/${id}`, {
        method: "PATCH",
        headers: authHeaders(password),
        body: JSON.stringify({ disabled: true }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? "操作失败");
      }
      showToast("已禁用");
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
      const res = await fetch(`/api/v1/admin/redeem/${id}`, {
        method: "PATCH",
        headers: authHeaders(password),
        body: JSON.stringify({ disabled: false }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? "操作失败");
      }
      showToast("已启用");
      fetchList();
      fetchStats();
      if (selectedCode?.id === id) {
        setDetailData((d) => (d?.id === id ? { ...d, status: "UNUSED" } : d));
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
      const res = await fetch(`/api/v1/admin/redeem/export?${params}`, {
        headers: authHeaders(password),
      });
      if (!res.ok) throw new Error("导出失败");
      const text = await res.text();
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hepaima-codes-${new Date().toISOString().slice(0, 10)}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`已导出 ${text.split("\n").filter(Boolean).length} 个兑换码`);
    } catch {
      showToast("导出失败", "error");
    }
  }, [password, filterStatus, filterBatch, showToast]);

  const handleGenerate = async () => {
    if (!password) return;
    setGenerating(true);
    setGeneratedCodes(null);
    try {
      const res = await fetch("/api/v1/admin/generate-codes", {
        method: "POST",
        headers: authHeaders(password),
        body: JSON.stringify({
          count: genCount,
          batchId: genBatch.trim() || undefined,
          expiresInDays: genExpiry,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message ?? "生成失败");
      setGeneratedCodes(data.codes ?? []);
      showToast(`成功生成 ${data.codes?.length ?? 0} 个兑换码`);
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

  // -------- 密码门 --------
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
              <Ticket className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-center text-slate-800 mb-2">
            兑换码管理后台
          </h1>
          <p className="text-sm text-slate-500 text-center mb-6">
            请输入管理密码
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="密码"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition"
              autoFocus
            />
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

  // -------- 管理后台主体 --------
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-7">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center text-white">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-lg bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
                兑换码管理
              </div>
              <div className="text-xs text-slate-400">hepaima</div>
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
            生成兑换码
          </Button>
        </div>

        {/* 统计卡片 */}
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
              { label: "总兑换码", value: stats.total, color: "text-violet-600" },
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

        {/* Tab */}
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
            兑换码列表
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
            生成兑换码
          </button>
        </div>

        {/* 列表 */}
        {view === "list" && (
          <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative max-w-[260px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="搜索兑换码 / 批次号..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && setCurrentPage(1)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-violet-300"
                  />
                </div>
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
                      兑换码
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-400 uppercase tracking-wide">
                      批次
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-400 uppercase tracking-wide">
                      状态
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-400 uppercase tracking-wide">
                      使用时间
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-400 uppercase tracking-wide">
                      创建时间
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-400 uppercase tracking-wide">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {listLoading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        加载中...
                      </td>
                    </tr>
                  ) : list.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        没有符合条件的兑换码
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
                            {c.usedAt
                              ? new Date(c.usedAt).toLocaleString("zh-CN")
                              : "—"}
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {new Date(c.createdAt).toLocaleDateString("zh-CN")}
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

        {/* 生成 */}
        {view === "generate" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 font-semibold">
                生成兑换码
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">
                    生成数量
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={genCount}
                    onChange={(e) =>
                      setGenCount(
                        Math.min(1000, Math.max(1, Number(e.target.value) || 0)),
                      )
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                  <p className="text-xs text-slate-400 mt-1">单次最多 1000 个</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">
                    批次号（选填）
                  </label>
                  <input
                    type="text"
                    placeholder="如 XHS-001，留空自动生成"
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
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                  将生成 <strong>{genCount}</strong> 个兑换码，有效期{" "}
                  <strong>{genExpiry}</strong> 天。
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
                      生成 {genCount} 个兑换码
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
                      a.download = `hepaima-codes-${new Date().toISOString().slice(0, 10)}.txt`;
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

      {/* 详情弹窗 */}
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
              <span className="font-bold">兑换码详情</span>
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
                      <div className="font-semibold text-slate-800">
                        {new Date(detailData.createdAt).toLocaleString("zh-CN")}
                      </div>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3">
                      <div className="text-xs text-slate-400">过期时间</div>
                      <div className="font-semibold text-slate-800">
                        {detailData.expiresAt
                          ? new Date(detailData.expiresAt).toLocaleDateString(
                              "zh-CN",
                            )
                          : "永不"}
                      </div>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3">
                      <div className="text-xs text-slate-400">使用设备</div>
                      <div className="font-semibold text-slate-800 text-xs break-all">
                        {detailData.usedByDeviceId ?? "未使用"}
                      </div>
                    </div>
                  </div>
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
                        className="flex-1 rounded-xl text-red-600 border-red-200 hover:bg-red-50"
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

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg z-[200]"
          style={{
            background: toast.type === "success" ? "#10B981" : "#EF4444",
          }}
        >
          {toast.msg}
        </motion.div>
      )}
    </div>
  );
}
