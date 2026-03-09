"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CreditCard, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ADMIN_PASSWORD_HEADER_KEY } from "@/lib/admin-auth";
import type { PaymentProviderType } from "@prisma/client";

type ProviderConfig = {
  id: string;
  type: PaymentProviderType;
  appId: string | null;
  mchId: string | null;
  apiKey: string | null;
  privateKey: string | null;
  publicKey: string | null;
  notifyUrl: string | null;
  isEnabled: boolean;
  isSandbox: boolean;
};

const ADMIN_HEADER = (password: string): HeadersInit => ({
  "Content-Type": "application/json",
  [ADMIN_PASSWORD_HEADER_KEY]: password,
});

export default function AdminPaymentPage() {
  const [passwordInput, setPasswordInput] = useState("");
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");

  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2600);
  };

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

  useEffect(() => {
    if (!authenticated || !password) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/v1/admin/payment-providers", {
          headers: ADMIN_HEADER(password),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message ?? "获取支付配置失败");
        setProviders(data);
      } catch (e) {
        console.error(e);
        showToast(e instanceof Error ? e.message : "获取支付配置失败", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [authenticated, password]);

  const upsertProviderLocal = (type: PaymentProviderType, patch: Partial<ProviderConfig>) => {
    setProviders((prev) => {
      const existing = prev.find((p) => p.type === type);
      if (!existing) {
        const base: ProviderConfig = {
          id: `tmp-${type}`,
          type,
          appId: null,
          mchId: null,
          apiKey: null,
          privateKey: null,
          publicKey: null,
          notifyUrl: null,
          isEnabled: false,
          isSandbox: false,
        };
        return [...prev, { ...base, ...patch }];
      }
      return prev.map((p) => (p.type === type ? { ...p, ...patch } : p));
    });
  };

  const handleSave = async () => {
    if (!password) return;
    setSaving(true);
    try {
      const payload = providers.map((p) => ({
        type: p.type,
        appId: p.appId ?? undefined,
        mchId: p.mchId ?? undefined,
        apiKey: p.apiKey ?? undefined,
        privateKey: p.privateKey ?? undefined,
        publicKey: p.publicKey ?? undefined,
        notifyUrl: p.notifyUrl ?? undefined,
        isEnabled: p.isEnabled,
        isSandbox: p.isSandbox,
      }));
      const res = await fetch("/api/v1/admin/payment-providers", {
        method: "PUT",
        headers: ADMIN_HEADER(password),
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message ?? "保存失败");
      setProviders(data);
      showToast("支付配置已保存");
    } catch (e) {
      console.error(e);
      showToast(e instanceof Error ? e.message : "保存失败", "error");
    } finally {
      setSaving(false);
    }
  };

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
              <CreditCard className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-center text-slate-800 mb-2">
            支付配置后台
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

  const wechat =
    providers.find((p) => p.type === "WECHAT") ??
    ({
      id: "tmp-wechat",
      type: "WECHAT",
      appId: null,
      mchId: null,
      apiKey: null,
      privateKey: null,
      publicKey: null,
      notifyUrl: null,
      isEnabled: false,
      isSandbox: false,
    } as ProviderConfig);

  const alipay =
    providers.find((p) => p.type === "ALIPAY") ??
    ({
      id: "tmp-alipay",
      type: "ALIPAY",
      appId: null,
      mchId: null,
      apiKey: null,
      privateKey: null,
      publicKey: null,
      notifyUrl: null,
      isEnabled: false,
      isSandbox: false,
    } as ProviderConfig);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-6">
        <header className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="inline-flex items-center text-xs text-slate-400 hover:text-slate-600">
              <ArrowLeft className="w-3 h-3 mr-1" />
              返回总览
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-semibold">支付参数配置</span>
          </div>
        </header>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-xs text-slate-500">
              此处仅存储支付参数与开关，具体签名逻辑仍由现有 `payment` 模块处理。请避免在此填写真实密钥到测试环境以外。
            </p>
            <Button
              size="sm"
              className="rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 text-white text-xs"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "保存中..." : "保存全部配置"}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl bg-white border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-sm font-semibold text-slate-800">
                  微信支付
                </h2>
                <label className="flex items-center gap-1 text-[11px] text-slate-500">
                  <input
                    type="checkbox"
                    checked={wechat.isEnabled}
                    onChange={(e) =>
                      upsertProviderLocal("WECHAT", { isEnabled: e.target.checked })
                    }
                    className="w-3.5 h-3.5 rounded border-slate-300"
                  />
                  启用
                </label>
              </div>
              {loading ? (
                <div className="h-24 rounded-lg bg-slate-100 animate-pulse" />
              ) : (
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      AppID / 小程序 ID
                    </label>
                    <input
                      type="text"
                      value={wechat.appId ?? ""}
                      onChange={(e) =>
                        upsertProviderLocal("WECHAT", { appId: e.target.value })
                      }
                      className="w-full px-2 py-1.5 rounded-md border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      商户号（MchId）
                    </label>
                    <input
                      type="text"
                      value={wechat.mchId ?? ""}
                      onChange={(e) =>
                        upsertProviderLocal("WECHAT", { mchId: e.target.value })
                      }
                      className="w-full px-2 py-1.5 rounded-md border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      API Key（v2/v3 视你的实现而定）
                    </label>
                    <input
                      type="password"
                      value={wechat.apiKey ?? ""}
                      onChange={(e) =>
                        upsertProviderLocal("WECHAT", { apiKey: e.target.value })
                      }
                      className="w-full px-2 py-1.5 rounded-md border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      通知回调地址（notifyUrl）
                    </label>
                    <input
                      type="text"
                      value={wechat.notifyUrl ?? ""}
                      onChange={(e) =>
                        upsertProviderLocal("WECHAT", { notifyUrl: e.target.value })
                      }
                      className="w-full px-2 py-1.5 rounded-md border border-slate-200"
                    />
                  </div>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                    <input
                      type="checkbox"
                      checked={wechat.isSandbox}
                      onChange={(e) =>
                        upsertProviderLocal("WECHAT", { isSandbox: e.target.checked })
                      }
                      className="w-3.5 h-3.5 rounded border-slate-300"
                    />
                    沙盒 / 测试环境
                  </label>
                </div>
              )}
            </div>

            <div className="rounded-xl bg-white border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-sm font-semibold text-slate-800">
                  支付宝
                </h2>
                <label className="flex items-center gap-1 text-[11px] text-slate-500">
                  <input
                    type="checkbox"
                    checked={alipay.isEnabled}
                    onChange={(e) =>
                      upsertProviderLocal("ALIPAY", { isEnabled: e.target.checked })
                    }
                    className="w-3.5 h-3.5 rounded border-slate-300"
                  />
                  启用
                </label>
              </div>
              {loading ? (
                <div className="h-24 rounded-lg bg-slate-100 animate-pulse" />
              ) : (
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      AppID
                    </label>
                    <input
                      type="text"
                      value={alipay.appId ?? ""}
                      onChange={(e) =>
                        upsertProviderLocal("ALIPAY", { appId: e.target.value })
                      }
                      className="w-full px-2 py-1.5 rounded-md border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      商户号 / PID（视实现而定）
                    </label>
                    <input
                      type="text"
                      value={alipay.mchId ?? ""}
                      onChange={(e) =>
                        upsertProviderLocal("ALIPAY", { mchId: e.target.value })
                      }
                      className="w-full px-2 py-1.5 rounded-md border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      私钥（privateKey）
                    </label>
                    <textarea
                      value={alipay.privateKey ?? ""}
                      onChange={(e) =>
                        upsertProviderLocal("ALIPAY", {
                          privateKey: e.target.value,
                        })
                      }
                      className="w-full px-2 py-1.5 rounded-md border border-slate-200 min-h-[60px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      公钥（publicKey）
                    </label>
                    <textarea
                      value={alipay.publicKey ?? ""}
                      onChange={(e) =>
                        upsertProviderLocal("ALIPAY", {
                          publicKey: e.target.value,
                        })
                      }
                      className="w-full px-2 py-1.5 rounded-md border border-slate-200 min-h-[60px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      通知回调地址（notifyUrl）
                    </label>
                    <input
                      type="text"
                      value={alipay.notifyUrl ?? ""}
                      onChange={(e) =>
                        upsertProviderLocal("ALIPAY", { notifyUrl: e.target.value })
                      }
                      className="w-full px-2 py-1.5 rounded-md border border-slate-200"
                    />
                  </div>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                    <input
                      type="checkbox"
                      checked={alipay.isSandbox}
                      onChange={(e) =>
                        upsertProviderLocal("ALIPAY", { isSandbox: e.target.checked })
                      }
                      className="w-3.5 h-3.5 rounded border-slate-300"
                    />
                    沙盒 / 测试环境
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
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

