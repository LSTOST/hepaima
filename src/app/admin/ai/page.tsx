"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft, Cpu, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ADMIN_PASSWORD_HEADER_KEY } from "@/lib/admin-auth";
import { useAdminAuth } from "@/hooks/useAdminAuth";

type Product = {
  id: string;
  name: string;
  slug: string;
};

type AiTemplate = {
  id: string;
  productId: string;
  modelName: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  userPromptTemplate: string;
  sectionsJson: unknown | null;
};

const ADMIN_HEADER = (password: string): HeadersInit => ({
  "Content-Type": "application/json",
  [ADMIN_PASSWORD_HEADER_KEY]: password,
});

export default function AdminAiPage() {
  const {
    password,
    passwordInput,
    setPasswordInput,
    authenticated,
    authError,
    handleLogin,
  } = useAdminAuth();
  const [showPassword, setShowPassword] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );

  const [template, setTemplate] = useState<AiTemplate | null>(null);
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

  useEffect(() => {
    if (!authenticated || !password) return;
    const loadProducts = async () => {
      try {
        const res = await fetch("/api/v1/admin/products", {
          headers: ADMIN_HEADER(password),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message ?? "获取产品失败");
        setProducts(data);
        if (!selectedProductId && data.length > 0) {
          setSelectedProductId(data[0].id);
        }
      } catch (e) {
        console.error(e);
        showToast(e instanceof Error ? e.message : "获取产品失败", "error");
      }
    };
    loadProducts();
  }, [authenticated, password, selectedProductId]);

  useEffect(() => {
    if (!authenticated || !password || !selectedProductId) return;
    const loadTemplate = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/v1/admin/ai-templates/${selectedProductId}`,
          {
            headers: ADMIN_HEADER(password),
          },
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message ?? "获取 AI 模板失败");
        setTemplate(data);
      } catch (e) {
        console.error(e);
        showToast(e instanceof Error ? e.message : "获取 AI 模板失败", "error");
      } finally {
        setLoading(false);
      }
    };
    loadTemplate();
  }, [authenticated, password, selectedProductId]);

  const currentProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) ?? products[0] ?? null,
    [products, selectedProductId],
  );

  const handleSave = async () => {
    if (!password || !currentProduct || !template) return;
    setSaving(true);
    try {
      const res = await fetch(
        `/api/v1/admin/ai-templates/${currentProduct.id}`,
        {
          method: "PUT",
          headers: ADMIN_HEADER(password),
          body: JSON.stringify({
            modelName: template.modelName,
            temperature: template.temperature,
            maxTokens: template.maxTokens,
            systemPrompt: template.systemPrompt,
            userPromptTemplate: template.userPromptTemplate,
            sectionsJson: template.sectionsJson,
          }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message ?? "保存失败");
      setTemplate(data);
      showToast("AI 模板已保存");
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
              <Cpu className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-center text-slate-800 mb-2">
            AI 报告配置
          </h1>
          <p className="text-sm text-slate-500 text-center mb-6">
            请输入管理密码
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
            <Sparkles className="w-4 h-4 text-violet-500" />
            <span className="text-sm font-semibold">AI 报告与 Prompt 配置</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 space-y-2 border-r md:pr-4 border-slate-100">
            <h2 className="text-xs font-semibold text-slate-500 mb-2">
              测评产品
            </h2>
            {products.length === 0 ? (
              <p className="text-xs text-slate-400">
                暂无产品，请先在主后台中创建。
              </p>
            ) : (
              <ul className="space-y-1 text-sm">
                {products.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedProductId(p.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg ${
                        (selectedProductId ?? products[0].id) === p.id
                          ? "bg-violet-50 text-violet-700"
                          : "hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      <div className="truncate">{p.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {p.slug}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="md:col-span-3">
            <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h2 className="text-sm font-semibold text-slate-800 mb-1">
                    AI 报告模板
                  </h2>
                  <p className="text-xs text-slate-400">
                    为当前测评产品配置使用的模型、系统提示词和用户 Prompt 模板。
                  </p>
                </div>
                <Button
                  size="sm"
                  className="rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 text-white text-xs"
                  onClick={handleSave}
                  disabled={saving || !template}
                >
                  {saving ? "保存中..." : "保存 AI 配置"}
                </Button>
              </div>

              {loading || !template ? (
                <div className="h-40 rounded-lg bg-slate-100 animate-pulse" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">
                        模型名称
                      </label>
                      <input
                        type="text"
                        value={template.modelName}
                        onChange={(e) =>
                          setTemplate({
                            ...template,
                            modelName: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-200"
                        placeholder="如 deepseek-chat"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                          温度（0-1）
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={1}
                          step={0.1}
                          value={template.temperature}
                          onChange={(e) =>
                            setTemplate({
                              ...template,
                              temperature: Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                          最多 tokens
                        </label>
                        <input
                          type="number"
                          min={512}
                          max={8192}
                          step={256}
                          value={template.maxTokens}
                          onChange={(e) =>
                            setTemplate({
                              ...template,
                              maxTokens: Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-slate-200"
                        />
                      </div>
                    </div>
                    <div className="rounded-lg bg-violet-50 border border-violet-100 p-3 text-[11px] text-violet-800">
                      建议：
                      <br />
                      - 温度偏低（0.4-0.7）报告更稳定、专业
                      <br />
                      - 系统 Prompt 用来限定角色和语气
                      <br />- 用户 Prompt 模板中可以插入{" "}
                      {"{{payload}}"} 占位符，用于注入测评结果 JSON
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">
                        系统提示词（System Prompt）
                      </label>
                      <textarea
                        value={template.systemPrompt}
                        onChange={(e) =>
                          setTemplate({
                            ...template,
                            systemPrompt: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 min-h-[80px]"
                        placeholder="例如：你是一名专业的亲密关系咨询师..."
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">
                        用户 Prompt 模板
                      </label>
                      <textarea
                        value={template.userPromptTemplate}
                        onChange={(e) =>
                          setTemplate({
                            ...template,
                            userPromptTemplate: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 min-h-[100px]"
                        placeholder='例如：以下是情侣双方的测评结果，请用通俗易懂的中文生成报告...\n{{payload}}'
                      />
                    </div>
                  </div>
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

