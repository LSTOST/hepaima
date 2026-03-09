"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Settings2,
  BookOpen,
  Tags,
  ArrowLeft,
  Plus,
  Save,
  ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ADMIN_PASSWORD_HEADER_KEY } from "@/lib/admin-auth";

type Product = {
  id: string;
  name: string;
  slug: string;
};

type Trait = {
  id: string;
  productId: string;
  key: string;
  name: string;
  description: string | null;
  category: string | null;
  icon: string | null;
  color: string | null;
};

const ADMIN_HEADER = (password: string): HeadersInit => ({
  "Content-Type": "application/json",
  [ADMIN_PASSWORD_HEADER_KEY]: password,
});

type Questionnaire = {
  id: string;
  title: string;
  stage: string | null;
  isActive: boolean;
  questionCount: number;
};

type Question = {
  id: string;
  externalId: number | null;
  order: number;
  text: string;
  category: string | null;
  type: string;
  helpText: string | null;
  required: boolean;
  options: { id: string; key: string; text: string; order: number }[];
};

export default function AdminQuizConfigPage() {
  const [passwordInput, setPasswordInput] = useState("");
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );

  const [traits, setTraits] = useState<Trait[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [tab, setTab] = useState<"traits" | "questions">("traits");

  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [selectedQuestionnaireId, setSelectedQuestionnaireId] = useState<
    string | null
  >(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [savingQuestions, setSavingQuestions] = useState(false);

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
    load();
  }, [authenticated, password, selectedProductId]);

  useEffect(() => {
    if (!authenticated || !password || !selectedProductId) return;
    const loadQuestionnaires = async () => {
      try {
        const params = new URLSearchParams({ productId: selectedProductId });
        const res = await fetch(`/api/v1/admin/questionnaires?${params}`, {
          headers: ADMIN_HEADER(password),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message ?? "获取问卷失败");
        setQuestionnaires(data);
        if (!selectedQuestionnaireId && data.length > 0) {
          setSelectedQuestionnaireId(data[0].id);
        }
      } catch (e) {
        console.error(e);
        showToast(e instanceof Error ? e.message : "获取问卷失败", "error");
      }
    };
    loadQuestionnaires();
  }, [authenticated, password, selectedProductId, selectedQuestionnaireId]);

  useEffect(() => {
    if (!authenticated || !password || !selectedQuestionnaireId) return;
    const loadQuestions = async () => {
      setLoadingQuestions(true);
      try {
        const params = new URLSearchParams({
          questionnaireId: selectedQuestionnaireId,
        });
        const res = await fetch(`/api/v1/admin/questions?${params}`, {
          headers: ADMIN_HEADER(password),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message ?? "获取题目失败");
        setQuestions(data);
      } catch (e) {
        console.error(e);
        showToast(e instanceof Error ? e.message : "获取题目失败", "error");
      } finally {
        setLoadingQuestions(false);
      }
    };
    loadQuestions();
  }, [authenticated, password, selectedQuestionnaireId]);

  useEffect(() => {
    if (!authenticated || !password || !selectedProductId) return;
    const loadTraits = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ productId: selectedProductId });
        const res = await fetch(`/api/v1/admin/traits?${params}`, {
          headers: ADMIN_HEADER(password),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message ?? "获取维度失败");
        setTraits(data);
      } catch (e) {
        console.error(e);
        showToast(e instanceof Error ? e.message : "获取维度失败", "error");
      } finally {
        setLoading(false);
      }
    };
    loadTraits();
  }, [authenticated, password, selectedProductId]);

  const currentProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) ?? products[0] ?? null,
    [products, selectedProductId],
  );

  const handleAddTrait = () => {
    if (!currentProduct) return;
    const tmpId = `tmp-${Date.now()}`;
    setTraits((prev) => [
      ...prev,
      {
        id: tmpId,
        productId: currentProduct.id,
        key: "",
        name: "",
        description: "",
        category: "",
        icon: "",
        color: "",
      },
    ]);
  };

  const handleChangeTrait = (id: string, patch: Partial<Trait>) => {
    setTraits((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    );
  };

  const handleDeleteTraitLocal = (id: string) => {
    setTraits((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSaveTraits = async () => {
    if (!password || !currentProduct) return;
    setSaving(true);
    try {
      // 先保存新建的（id 以 tmp- 开头）
      const newOnes = traits.filter((t) => t.id.startsWith("tmp-"));
      for (const t of newOnes) {
        if (!t.key || !t.name) continue;
        const res = await fetch("/api/v1/admin/traits", {
          method: "POST",
          headers: ADMIN_HEADER(password),
          body: JSON.stringify({
            productId: currentProduct.id,
            key: t.key,
            name: t.name,
            description: t.description,
            category: t.category,
            icon: t.icon,
            color: t.color,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message ?? "创建维度失败");
      }

      // 再更新已有的
      const existing = traits.filter((t) => !t.id.startsWith("tmp-"));
      for (const t of existing) {
        const res = await fetch(`/api/v1/admin/traits/${t.id}`, {
          method: "PUT",
          headers: ADMIN_HEADER(password),
          body: JSON.stringify({
            key: t.key,
            name: t.name,
            description: t.description,
            category: t.category,
            icon: t.icon,
            color: t.color,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message ?? "更新维度失败");
      }

      // 重新加载一遍
      const params = new URLSearchParams({ productId: currentProduct.id });
      const res = await fetch(`/api/v1/admin/traits?${params}`, {
        headers: ADMIN_HEADER(password),
      });
      const refreshed = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(refreshed.message ?? "刷新维度失败");
      setTraits(refreshed);

      showToast("维度已保存");
    } catch (e) {
      console.error(e);
      showToast(e instanceof Error ? e.message : "保存失败", "error");
    } finally {
      setSaving(false);
    }
  };

  const currentQuestionnaire = useMemo(
    () =>
      questionnaires.find((q) => q.id === selectedQuestionnaireId) ??
      questionnaires[0] ??
      null,
    [questionnaires, selectedQuestionnaireId],
  );

  const handleChangeQuestion = (id: string, patch: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...patch } : q)),
    );
  };

  const handleSaveQuestions = async () => {
    if (!password) return;
    setSavingQuestions(true);
    try {
      for (const q of questions) {
        const res = await fetch(`/api/v1/admin/questions/${q.id}`, {
          method: "PUT",
          headers: ADMIN_HEADER(password),
          body: JSON.stringify({
            text: q.text,
            category: q.category,
            order: q.order,
            helpText: q.helpText,
            required: q.required,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message ?? "保存题目失败");
      }
      showToast("题目已保存");
    } catch (e) {
      console.error(e);
      showToast(e instanceof Error ? e.message : "保存题目失败", "error");
    } finally {
      setSavingQuestions(false);
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
            测评配置后台
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
            <Link href="/admin" className="inline-flex items-center text-xs text-slate-400 hover:text-slate-600">
              <ArrowLeft className="w-3 h-3 mr-1" />
              返回总览
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-pink-500" />
            <span className="text-sm font-semibold">题目与维度配置</span>
          </div>
        </header>

        <div className="flex items-center gap-2 mb-4">
          <button
            type="button"
            onClick={() => setTab("traits")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
              tab === "traits"
                ? "bg-white text-slate-900 shadow border border-slate-200"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/80"
            }`}
          >
            维度配置
          </button>
          <button
            type="button"
            onClick={() => setTab("questions")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
              tab === "questions"
                ? "bg-white text-slate-900 shadow border border-slate-200"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/80"
            }`}
          >
            题目配置
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 space-y-2 border-r md:pr-4 border-slate-100">
            <h2 className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1">
              <Settings2 className="w-3.5 h-3.5" />
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

          <div className="md:col-span-3 space-y-4">
            {tab === "traits" && (
              <>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2">
                      <Tags className="w-4 h-4 text-pink-500" />
                      维度（Trait）配置
                    </h2>
                    <p className="text-xs text-slate-400">
                      这里管理测评使用到的各个维度（如安全型依恋、爱的语言等），可用于 AI 报告和结果展示。
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg text-xs"
                      onClick={handleAddTrait}
                      disabled={!currentProduct}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      新增维度
                    </Button>
                    <Button
                      size="sm"
                      className="rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 text-white text-xs"
                      onClick={handleSaveTraits}
                      disabled={saving || !currentProduct}
                    >
                      {saving ? (
                        <>
                          <Save className="w-3 h-3 mr-1" />
                          保存中...
                        </>
                      ) : (
                        <>
                          <Save className="w-3 h-3 mr-1" />
                          保存维度
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="rounded-xl bg-white border border-slate-200 p-4">
                  {loading ? (
                    <div className="h-32 rounded-lg bg-slate-100 animate-pulse" />
                  ) : traits.length === 0 ? (
                    <p className="text-sm text-slate-400">
                      当前产品还没有配置任何维度，可以点击右上角「新增维度」开始添加。
                    </p>
                  ) : (
                    <div className="space-y-3 text-xs sm:text-sm">
                      {traits.map((t) => (
                        <div
                          key={t.id}
                          className="grid grid-cols-1 sm:grid-cols-5 gap-2 border border-slate-100 rounded-lg p-3"
                        >
                          <div className="space-y-1">
                            <label className="block text-[11px] text-slate-400">
                              key（英文标识）
                            </label>
                            <input
                              type="text"
                              value={t.key}
                              onChange={(e) =>
                                handleChangeTrait(t.id, { key: e.target.value })
                              }
                              className="w-full px-2 py-1.5 rounded-md border border-slate-200 text-xs"
                              placeholder="如 attachment_secure"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[11px] text-slate-400">
                              名称
                            </label>
                            <input
                              type="text"
                              value={t.name}
                              onChange={(e) =>
                                handleChangeTrait(t.id, { name: e.target.value })
                              }
                              className="w-full px-2 py-1.5 rounded-md border border-slate-200 text-xs"
                              placeholder="如 安全型依恋"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[11px] text-slate-400">
                              所属类别
                            </label>
                            <input
                              type="text"
                              value={t.category ?? ""}
                              onChange={(e) =>
                                handleChangeTrait(t.id, {
                                  category: e.target.value,
                                })
                              }
                              className="w-full px-2 py-1.5 rounded-md border border-slate-200 text-xs"
                              placeholder="如 attachment / values"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[11px] text-slate-400">
                              颜色（选填）
                            </label>
                            <input
                              type="text"
                              value={t.color ?? ""}
                              onChange={(e) =>
                                handleChangeTrait(t.id, { color: e.target.value })
                              }
                              className="w-full px-2 py-1.5 rounded-md border border-slate-200 text-xs"
                              placeholder="#EC4899"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[11px] text-slate-400">
                              图标（选填）
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={t.icon ?? ""}
                                onChange={(e) =>
                                  handleChangeTrait(t.id, {
                                    icon: e.target.value,
                                  })
                                }
                                className="w-full px-2 py-1.5 rounded-md border border-slate-200 text-xs"
                                placeholder="如 heart 或自定义 URL"
                              />
                              <button
                                type="button"
                                onClick={() => handleDeleteTraitLocal(t.id)}
                                className="text-[11px] text-red-500 hover:text-red-600"
                              >
                                删除
                              </button>
                            </div>
                          </div>
                          <div className="sm:col-span-5 space-y-1">
                            <label className="block text-[11px] text-slate-400">
                              说明（选填）
                            </label>
                            <textarea
                              value={t.description ?? ""}
                              onChange={(e) =>
                                handleChangeTrait(t.id, {
                                  description: e.target.value,
                                })
                              }
                              className="w-full px-2 py-1.5 rounded-md border border-slate-200 text-xs min-h-[40px]"
                              placeholder="简要说明这个维度代表什么、高低分如何解读"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-xl bg-slate-50 border border-dashed border-slate-200 p-4 text-xs text-slate-500">
                  <p className="mb-1">
                    后续可以在这里继续扩展：
                  </p>
                  <ul className="list-disc pl-5 space-y-0.5">
                    <li>为每个问卷/阶段配置题目列表（支持从现有题库迁移）</li>
                    <li>为每个题目配置计分规则（scoringJson），与 AI 报告模板联动</li>
                    <li>按产品版本管理不同问卷（AB 实验 / 渐进优化）</li>
                  </ul>
                </div>
              </>
            )}

            {tab === "questions" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2">
                      <ListChecks className="w-4 h-4 text-violet-500" />
                      题目配置
                    </h2>
                    <p className="text-xs text-slate-400">
                      当前只支持修改题干文案、分类和排序，选项与计分规则后续再开放编辑。
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 text-white text-xs"
                    onClick={handleSaveQuestions}
                    disabled={savingQuestions || questions.length === 0}
                  >
                    {savingQuestions ? "保存中..." : "保存题目"}
                  </Button>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>当前问卷：</span>
                  {currentQuestionnaire ? (
                    <>
                      <select
                        value={currentQuestionnaire.id}
                        onChange={(e) =>
                          setSelectedQuestionnaireId(e.target.value || null)
                        }
                        className="px-2 py-1.5 rounded-md border border-slate-200 bg-white"
                      >
                        {questionnaires.map((q) => (
                          <option key={q.id} value={q.id}>
                            {q.title}
                            {q.stage ? `（${q.stage}）` : ""}
                          </option>
                        ))}
                      </select>
                      <span>
                        共 {currentQuestionnaire.questionCount} 题
                      </span>
                    </>
                  ) : (
                    <span className="text-slate-400">
                      暂无问卷，请先通过脚本或数据库创建。
                    </span>
                  )}
                </div>

                <div className="rounded-xl bg-white border border-slate-200 p-4">
                  {loadingQuestions ? (
                    <div className="h-32 rounded-lg bg-slate-100 animate-pulse" />
                  ) : questions.length === 0 ? (
                    <p className="text-sm text-slate-400">
                      当前问卷下暂无题目（或题目尚未从脚本迁移），暂不支持在此新建题目。
                    </p>
                  ) : (
                    <div className="space-y-3 text-xs sm:text-sm max-h-[520px] overflow-auto pr-1">
                      {questions.map((q) => (
                        <div
                          key={q.id}
                          className="border border-slate-100 rounded-lg p-3 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                                Q{q.order}
                              </span>
                              {q.externalId && (
                                <span>原始 ID: {q.externalId}</span>
                              )}
                              <span>类型: {q.type}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                              <span>排序</span>
                              <input
                                type="number"
                                value={q.order}
                                onChange={(e) =>
                                  handleChangeQuestion(q.id, {
                                    order:
                                      Number(e.target.value) || q.order,
                                  })
                                }
                                className="w-14 px-1.5 py-1 rounded border border-slate-200"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">
                              题干
                            </label>
                            <textarea
                              value={q.text}
                              onChange={(e) =>
                                handleChangeQuestion(q.id, {
                                  text: e.target.value,
                                })
                              }
                              className="w-full px-2 py-1.5 rounded-md border border-slate-200 text-xs min-h-[44px]"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1">
                                分类（category）
                              </label>
                              <input
                                type="text"
                                value={q.category ?? ""}
                                onChange={(e) =>
                                  handleChangeQuestion(q.id, {
                                    category: e.target.value,
                                  })
                                }
                                className="w-full px-2 py-1.5 rounded-md border border-slate-200 text-xs"
                                placeholder="如 attachment / values"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1">
                                帮助文案（选填）
                              </label>
                              <input
                                type="text"
                                value={q.helpText ?? ""}
                                onChange={(e) =>
                                  handleChangeQuestion(q.id, {
                                    helpText: e.target.value,
                                  })
                                }
                                className="w-full px-2 py-1.5 rounded-md border border-slate-200 text-xs"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">
                              选项（只读）
                            </label>
                            {q.options.length === 0 ? (
                              <p className="text-[11px] text-slate-400">
                                暂无选项（可能是量表题或配置缺失）。
                              </p>
                            ) : (
                              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-600">
                                {q.options.map((opt) => (
                                  <li
                                    key={opt.id}
                                    className="px-2 py-1 rounded bg-slate-50 border border-slate-100"
                                  >
                                    <span className="font-mono mr-1 text-slate-400">
                                      {opt.key}.
                                    </span>
                                    {opt.text}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
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

