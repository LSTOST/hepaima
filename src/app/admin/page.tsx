"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Settings2, LayoutDashboard, BookOpen, Palette, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ADMIN_PASSWORD_HEADER_KEY } from "@/lib/admin-auth";

type SiteSettings = {
  id: string;
  siteName: string;
  siteSubtitle: string | null;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  ogImageUrl: string | null;
  icpRecord: string | null;
  footerHtml: string | null;
};

type Product = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  coverImageUrl: string | null;
  icon: string | null;
  isActive: boolean;
  priceCents: number;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  allowRedeemCode: boolean;
};

const ADMIN_HEADER = (password: string): HeadersInit => ({
  "Content-Type": "application/json",
  [ADMIN_PASSWORD_HEADER_KEY]: password,
});

type TabKey = "overview" | "site" | "products";

export default function AdminDashboardPage() {
  const [passwordInput, setPasswordInput] = useState("");
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");

  const [tab, setTab] = useState<TabKey>("overview");

  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );

  const [loadingSite, setLoadingSite] = useState(false);
  const [savingSite, setSavingSite] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [creatingProduct, setCreatingProduct] = useState(false);

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

  const fetchSiteSettings = async (pwd: string) => {
    setLoadingSite(true);
    try {
      const res = await fetch("/api/v1/admin/site-settings", {
        headers: ADMIN_HEADER(pwd),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message ?? "获取站点设置失败");
      }
      setSiteSettings(data);
    } catch (e) {
      console.error(e);
      showToast(
        e instanceof Error ? e.message : "获取站点设置失败",
        "error",
      );
    } finally {
      setLoadingSite(false);
    }
  };

  const fetchProducts = async (pwd: string) => {
    setLoadingProducts(true);
    try {
      const res = await fetch("/api/v1/admin/products", {
        headers: ADMIN_HEADER(pwd),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message ?? "获取产品失败");
      }
      setProducts(data);
      if (!selectedProductId && data.length > 0) {
        setSelectedProductId(data[0].id);
      }
    } catch (e) {
      console.error(e);
      showToast(e instanceof Error ? e.message : "获取产品失败", "error");
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (authenticated && password) {
      fetchSiteSettings(password);
      fetchProducts(password);
    }
  }, [authenticated, password]);

  const handleSaveSite = async () => {
    if (!password || !siteSettings) return;
    setSavingSite(true);
    try {
      const res = await fetch("/api/v1/admin/site-settings", {
        method: "PUT",
        headers: ADMIN_HEADER(password),
        body: JSON.stringify(siteSettings),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message ?? "保存失败");
      }
      setSiteSettings(data);
      showToast("站点设置已保存");
    } catch (e) {
      console.error(e);
      showToast(e instanceof Error ? e.message : "保存失败", "error");
    } finally {
      setSavingSite(false);
    }
  };

  const currentProduct =
    products.find((p) => p.id === selectedProductId) ?? products[0] ?? null;

  const handleUpdateCurrentProduct = (patch: Partial<Product>) => {
    if (!currentProduct) return;
    setProducts((prev) =>
      prev.map((p) =>
        p.id === currentProduct.id
          ? {
              ...p,
              ...patch,
            }
          : p,
      ),
    );
  };

  const handleSaveCurrentProduct = async () => {
    if (!password || !currentProduct) return;
    setSavingProduct(true);
    try {
      const res = await fetch(`/api/v1/admin/products/${currentProduct.id}`, {
        method: "PUT",
        headers: ADMIN_HEADER(password),
        body: JSON.stringify(currentProduct),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message ?? "保存失败");
      }
      setProducts((prev) =>
        prev.map((p) => (p.id === data.id ? data : p)),
      );
      showToast("产品配置已保存");
    } catch (e) {
      console.error(e);
      showToast(e instanceof Error ? e.message : "保存失败", "error");
    } finally {
      setSavingProduct(false);
    }
  };

  const handleCreateProduct = async () => {
    if (!password) return;
    const slug = prompt("请输入新产品的英文标识（slug），例如 couple-compatibility");
    const name = slug ? prompt("请输入产品名称（展示给用户），例如 情侣契合度测试") : null;
    if (!slug || !name) return;
    setCreatingProduct(true);
    try {
      const res = await fetch("/api/v1/admin/products", {
        method: "POST",
        headers: ADMIN_HEADER(password),
        body: JSON.stringify({
          slug,
          name,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message ?? "创建失败");
      }
      setProducts((prev) => [data, ...prev]);
      setSelectedProductId(data.id);
      showToast("已创建新产品");
    } catch (e) {
      console.error(e);
      showToast(e instanceof Error ? e.message : "创建失败", "error");
    } finally {
      setCreatingProduct(false);
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
              <Settings2 className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-center text-slate-800 mb-2">
            合拍吗配置后台
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-6">
        <header className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center text-white">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-lg bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
                配置后台
              </div>
              <div className="text-xs text-slate-400">
                品牌、测评、AI、支付、兑换码一站管理
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/admin/quiz">
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg text-xs text-slate-500 border-slate-200"
              >
                题目与维度
              </Button>
            </Link>
            <Link href="/admin/ai">
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg text-xs text-slate-500 border-slate-200"
              >
                AI 报告
              </Button>
            </Link>
            <Link href="/admin/payment">
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg text-xs text-slate-500 border-slate-200"
              >
                支付配置
              </Button>
            </Link>
            <Link href="/admin/redeem">
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg text-xs text-slate-500 border-slate-200 flex items-center gap-1"
              >
                <Ticket className="w-3.5 h-3.5" />
                兑换码
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg text-xs text-slate-500 border-slate-200"
            >
              使用中账号：管理员
            </Button>
          </div>
        </header>

        <nav className="flex gap-2 mb-5 overflow-x-auto">
          {[
            { key: "overview", label: "总览", icon: LayoutDashboard },
            { key: "site", label: "站点设置", icon: Settings2 },
            { key: "products", label: "测评产品", icon: BookOpen },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key as TabKey)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                  tab === item.key
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/80"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {tab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-xl bg-white border border-slate-200 p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                <Settings2 className="w-4 h-4 text-violet-500" />
                站点信息
              </h2>
              {loadingSite ? (
                <div className="h-24 rounded-lg bg-slate-100 animate-pulse" />
              ) : siteSettings ? (
                <div className="space-y-1 text-sm text-slate-600">
                  <p>
                    网站名称：<span className="font-semibold">{siteSettings.siteName}</span>
                  </p>
                  {siteSettings.siteSubtitle && (
                    <p>副标题：{siteSettings.siteSubtitle}</p>
                  )}
                  {siteSettings.seoTitle && (
                    <p className="text-xs text-slate-400">
                      默认 SEO 标题：{siteSettings.seoTitle}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  暂无数据，请切换到「站点设置」进行初始化。
                </p>
              )}
            </div>

            <div className="rounded-xl bg-white border border-slate-200 p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                <BookOpen className="w-4 h-4 text-pink-500" />
                测评产品
              </h2>
              {loadingProducts ? (
                <div className="h-24 rounded-lg bg-slate-100 animate-pulse" />
              ) : products.length === 0 ? (
                <div className="flex flex-col items-start gap-3 text-sm text-slate-500">
                  <p>当前还没有配置任何测评产品。</p>
                  <Button
                    size="sm"
                    className="rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 text-white"
                    onClick={handleCreateProduct}
                    disabled={creatingProduct}
                  >
                    创建第一个测评产品
                  </Button>
                </div>
              ) : (
                <ul className="space-y-2 text-sm text-slate-600">
                  {products.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="truncate">
                        {p.name}{" "}
                        <span className="text-xs text-slate-400">
                          ({p.slug})
                        </span>
                      </span>
                      <span className="text-xs text-slate-400">
                        {p.isActive ? "已上架" : "未上架"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {tab === "site" && (
          <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-sm font-semibold text-slate-800 mb-1">
                  站点与品牌设置
                </h2>
                <p className="text-xs text-slate-400">
                  修改名称、Logo、主色、全局 SEO 等。
                </p>
              </div>
              <Button
                onClick={handleSaveSite}
                disabled={savingSite || !siteSettings}
                className="rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 text-white"
              >
                {savingSite ? "保存中..." : "保存"}
              </Button>
            </div>

            {loadingSite || !siteSettings ? (
              <div className="h-40 rounded-lg bg-slate-100 animate-pulse" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      网站名称
                    </label>
                    <input
                      type="text"
                      value={siteSettings.siteName}
                      onChange={(e) =>
                        setSiteSettings({
                          ...siteSettings,
                          siteName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      副标题
                    </label>
                    <input
                      type="text"
                      value={siteSettings.siteSubtitle ?? ""}
                      onChange={(e) =>
                        setSiteSettings({
                          ...siteSettings,
                          siteSubtitle: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200"
                      placeholder="例如：基于心理学的情侣测评工具"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        主色
                      </label>
                      <input
                        type="text"
                        value={siteSettings.primaryColor}
                        onChange={(e) =>
                          setSiteSettings({
                            ...siteSettings,
                            primaryColor: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-200"
                        placeholder="#EC4899"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        渐变副色
                      </label>
                      <input
                        type="text"
                        value={siteSettings.secondaryColor}
                        onChange={(e) =>
                          setSiteSettings({
                            ...siteSettings,
                            secondaryColor: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-200"
                        placeholder="#8B5CF6"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Logo URL
                    </label>
                    <input
                      type="text"
                      value={siteSettings.logoUrl ?? ""}
                      onChange={(e) =>
                        setSiteSettings({
                          ...siteSettings,
                          logoUrl: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200"
                      placeholder="/logo.png 或完整 URL"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Favicon URL
                    </label>
                    <input
                      type="text"
                      value={siteSettings.faviconUrl ?? ""}
                      onChange={(e) =>
                        setSiteSettings({
                          ...siteSettings,
                          faviconUrl: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200"
                      placeholder="/favicon.png"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      备案号（选填）
                    </label>
                    <input
                      type="text"
                      value={siteSettings.icpRecord ?? ""}
                      onChange={(e) =>
                        setSiteSettings({
                          ...siteSettings,
                          icpRecord: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200"
                      placeholder="如：粤ICP备XXXX号"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      默认 SEO 标题
                    </label>
                    <input
                      type="text"
                      value={siteSettings.seoTitle ?? ""}
                      onChange={(e) =>
                        setSiteSettings({
                          ...siteSettings,
                          seoTitle: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200"
                      placeholder="不填则使用页面默认标题"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      默认 SEO 描述
                    </label>
                    <textarea
                      value={siteSettings.seoDescription ?? ""}
                      onChange={(e) =>
                        setSiteSettings({
                          ...siteSettings,
                          seoDescription: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 min-h-[72px]"
                      placeholder="用于搜索结果摘要和分享描述"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      默认关键词（用逗号分隔）
                    </label>
                    <input
                      type="text"
                      value={siteSettings.seoKeywords ?? ""}
                      onChange={(e) =>
                        setSiteSettings({
                          ...siteSettings,
                          seoKeywords: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200"
                      placeholder="情侣测试,关系测评,心理学"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      默认分享图（OG Image）
                    </label>
                    <input
                      type="text"
                      value={siteSettings.ogImageUrl ?? ""}
                      onChange={(e) =>
                        setSiteSettings({
                          ...siteSettings,
                          ogImageUrl: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200"
                      placeholder="/share.png 或完整 URL"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      页脚内容（可填简单 HTML）
                    </label>
                    <textarea
                      value={siteSettings.footerHtml ?? ""}
                      onChange={(e) =>
                        setSiteSettings({
                          ...siteSettings,
                          footerHtml: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 min-h-[72px]"
                      placeholder="例如：© {year} 合拍吗 · 仅供娱乐参考，不构成专业诊断"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "products" && (
          <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-sm font-semibold text-slate-800 mb-1">
                  测评产品配置
                </h2>
                <p className="text-xs text-slate-400">
                  为不同测评设置名称、价格、SEO、上架状态。
                </p>
              </div>
              <Button
                size="sm"
                className="rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 text-white"
                onClick={handleCreateProduct}
                disabled={creatingProduct}
              >
                {creatingProduct ? "创建中..." : "新建测评产品"}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1 space-y-2 border-r md:pr-4 border-slate-100">
                {loadingProducts ? (
                  <div className="h-32 rounded-lg bg-slate-100 animate-pulse" />
                ) : products.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    暂无产品，请先创建。
                  </p>
                ) : (
                  <ul className="space-y-1 text-sm">
                    {products.map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedProductId(p.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between gap-2 ${
                            (selectedProductId ?? products[0]?.id) === p.id
                              ? "bg-violet-50 text-violet-700"
                              : "hover:bg-slate-50 text-slate-600"
                          }`}
                        >
                          <span className="truncate">{p.name}</span>
                          {!p.isActive && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                              未上架
                            </span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="md:col-span-3">
                {loadingProducts || !currentProduct ? (
                  <div className="h-40 rounded-lg bg-slate-100 animate-pulse" />
                ) : (
                  <div className="space-y-4 text-sm">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4 text-pink-500" />
                        <div>
                          <div className="font-semibold text-slate-800">
                            {currentProduct.name}
                          </div>
                          <div className="text-xs text-slate-400">
                            slug: {currentProduct.slug}
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={handleSaveCurrentProduct}
                        disabled={savingProduct}
                        className="rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 text-white"
                      >
                        {savingProduct ? "保存中..." : "保存产品配置"}
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">
                            产品名称
                          </label>
                          <input
                            type="text"
                            value={currentProduct.name}
                            onChange={(e) =>
                              handleUpdateCurrentProduct({
                                name: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-slate-200"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">
                            英文标识（slug）
                          </label>
                          <input
                            type="text"
                            value={currentProduct.slug}
                            onChange={(e) =>
                              handleUpdateCurrentProduct({
                                slug: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-slate-200"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">
                            简短介绍
                          </label>
                          <textarea
                            value={currentProduct.shortDescription ?? ""}
                            onChange={(e) =>
                              handleUpdateCurrentProduct({
                                shortDescription: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 min-h-[60px]"
                            placeholder="例如：基于依恋理论和爱情风格的情侣契合度测评"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">
                              价格（元）
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={currentProduct.priceCents / 100}
                              onChange={(e) =>
                                handleUpdateCurrentProduct({
                                  priceCents:
                                    Math.max(0, Number(e.target.value) || 0) *
                                    100,
                                })
                              }
                              className="w-full px-3 py-2 rounded-lg border border-slate-200"
                            />
                          </div>
                          <div className="flex items-center gap-2 mt-5">
                            <input
                              id="allowRedeem"
                              type="checkbox"
                              checked={currentProduct.allowRedeemCode}
                              onChange={(e) =>
                                handleUpdateCurrentProduct({
                                  allowRedeemCode: e.target.checked,
                                })
                              }
                              className="w-4 h-4 rounded border-slate-300"
                            />
                            <label
                              htmlFor="allowRedeem"
                              className="text-xs text-slate-600"
                            >
                              支持通过兑换码解锁
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">
                            封面图 URL
                          </label>
                          <input
                            type="text"
                            value={currentProduct.coverImageUrl ?? ""}
                            onChange={(e) =>
                              handleUpdateCurrentProduct({
                                coverImageUrl: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-slate-200"
                            placeholder="/images/couple-cover.png"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">
                            图标（可填 icon 名称或 URL）
                          </label>
                          <input
                            type="text"
                            value={currentProduct.icon ?? ""}
                            onChange={(e) =>
                              handleUpdateCurrentProduct({
                                icon: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-slate-200"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">
                            SEO 标题
                          </label>
                          <input
                            type="text"
                            value={currentProduct.seoTitle ?? ""}
                            onChange={(e) =>
                              handleUpdateCurrentProduct({
                                seoTitle: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-slate-200"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">
                            SEO 描述
                          </label>
                          <textarea
                            value={currentProduct.seoDescription ?? ""}
                            onChange={(e) =>
                              handleUpdateCurrentProduct({
                                seoDescription: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 min-h-[60px]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">
                            SEO 关键词（逗号分隔）
                          </label>
                          <input
                            type="text"
                            value={currentProduct.seoKeywords ?? ""}
                            onChange={(e) =>
                              handleUpdateCurrentProduct({
                                seoKeywords: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-slate-200"
                            placeholder="情侣测试,关系测评"
                          />
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            id="isActive"
                            type="checkbox"
                            checked={currentProduct.isActive}
                            onChange={(e) =>
                              handleUpdateCurrentProduct({
                                isActive: e.target.checked,
                              })
                            }
                            className="w-4 h-4 rounded border-slate-300"
                          />
                          <label
                            htmlFor="isActive"
                            className="text-xs text-slate-600"
                          >
                            上架（在前台可被用户访问）
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
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

