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
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ADMIN_PASSWORD_HEADER_KEY } from "@/lib/admin-auth";
import { useAdminAuth } from "@/hooks/useAdminAuth";

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
  createdAt?: string;
};

const STAGE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "不分阶段" },
  { value: "UNIVERSAL", label: "通用版（30题量表）" },
  { value: "AMBIGUOUS", label: "了解期" },
  { value: "ROMANCE", label: "热恋期" },
  { value: "STABLE", label: "稳定期" },
];

/** 问卷 stage 展示用中文，避免「了解期(AMBIGUOUS)」与「通用版(UNIVERSAL)」混淆 */
function stageDisplayLabel(stage: string | null): string {
  if (stage == null || stage === "") return "不分阶段";
  const opt = STAGE_OPTIONS.find((o) => o.value === stage);
  return opt?.label ?? stage;
}

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

  const [showNewQuestionnaire, setShowNewQuestionnaire] = useState(false);
  const [newQuestionnaireTitle, setNewQuestionnaireTitle] = useState("");
  const [newQuestionnaireStage, setNewQuestionnaireStage] = useState("");
  const [creatingQuestionnaire, setCreatingQuestionnaire] = useState(false);

  const [editingQuestionnaireId, setEditingQuestionnaireId] = useState<string | null>(null);
  const [editQuestionnaireTitle, setEditQuestionnaireTitle] = useState("");
  const [editQuestionnaireStage, setEditQuestionnaireStage] = useState("");
  const [editQuestionnaireActive, setEditQuestionnaireActive] = useState(true);
  const [savingQuestionnaire, setSavingQuestionnaire] = useState(false);

  const [showNewQuestion, setShowNewQuestion] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionType, setNewQuestionType] = useState("SINGLE_CHOICE");
  const [newQuestionOptions, setNewQuestionOptions] = useState<{ key: string; text: string }[]>([
    { key: "A", text: "" },
    { key: "B", text: "" },
  ]);
  const [creatingQuestion, setCreatingQuestion] = useState(false);

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

  const handleDeleteTrait = async (id: string) => {
    if (id.startsWith("tmp-")) {
      setTraits((prev) => prev.filter((t) => t.id !== id));
      return;
    }
    if (!password) return;
    try {
      const res = await fetch(`/api/v1/admin/traits/${id}`, {
        method: "DELETE",
        headers: ADMIN_HEADER(password),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message ?? "删除维度失败");
      setTraits((prev) => prev.filter((t) => t.id !== id));
      showToast("已删除维度");
    } catch (e) {
      console.error(e);
      showToast(e instanceof Error ? e.message : "删除失败", "error");
    }
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

  const handleCreateQuestionnaire = async () => {
    if (!password || !currentProduct || !newQuestionnaireTitle.trim()) return;
    setCreatingQuestionnaire(true);
    try {
      const res = await fetch("/api/v1/admin/questionnaires", {
        method: "POST",
        headers: ADMIN_HEADER(password),
        body: JSON.stringify({
          productId: currentProduct.id,
          title: newQuestionnaireTitle.trim(),
          stage: newQuestionnaireStage || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message ?? "创建问卷失败");
      setQuestionnaires((prev) => [...prev, data]);
      setSelectedQuestionnaireId(data.id);
      setShowNewQuestionnaire(false);
      setNewQuestionnaireTitle("");
      setNewQuestionnaireStage("");
      showToast("问卷已创建");
    } catch (e) {
      console.error(e);
      showToast(e instanceof Error ? e.message : "创建问卷失败", "error");
    } finally {
      setCreatingQuestionnaire(false);
    }
  };

  const handleStartEditQuestionnaire = (q: Questionnaire) => {
    setEditingQuestionnaireId(q.id);
    setEditQuestionnaireTitle(q.title);
    setEditQuestionnaireStage(q.stage ?? "");
    setEditQuestionnaireActive(q.isActive);
  };

  const handleSaveQuestionnaire = async () => {
    if (!password || !editingQuestionnaireId) return;
    setSavingQuestionnaire(true);
    try {
      const res = await fetch(`/api/v1/admin/questionnaires/${editingQuestionnaireId}`, {
        method: "PUT",
        headers: ADMIN_HEADER(password),
        body: JSON.stringify({
          title: editQuestionnaireTitle.trim(),
          stage: editQuestionnaireStage || null,
          isActive: editQuestionnaireActive,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message ?? "更新问卷失败");
      setQuestionnaires((prev) =>
        prev.map((p) => (p.id === editingQuestionnaireId ? { ...p, ...data } : p)),
      );
      setEditingQuestionnaireId(null);
      showToast("问卷已更新");
    } catch (e) {
      console.error(e);
      showToast(e instanceof Error ? e.message : "更新问卷失败", "error");
    } finally {
      setSavingQuestionnaire(false);
    }
  };

  const handleDeleteQuestionnaire = async (id: string) => {
    if (!password || !window.confirm("确定删除该问卷？其下所有题目将一并删除。")) return;
    try {
      const res = await fetch(`/api/v1/admin/questionnaires/${id}`, {
        method: "DELETE",
        headers: ADMIN_HEADER(password),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message ?? "删除问卷失败");
      setQuestionnaires((prev) => prev.filter((q) => q.id !== id));
      if (selectedQuestionnaireId === id) {
        const next = questionnaires.find((q) => q.id !== id);
        setSelectedQuestionnaireId(next?.id ?? null);
        setQuestions([]);
      }
      showToast("问卷已删除");
    } catch (e) {
      console.error(e);
      showToast(e instanceof Error ? e.message : "删除问卷失败", "error");
    }
  };

  const handleCreateQuestion = async () => {
    if (!password || !selectedQuestionnaireId || !newQuestionText.trim()) return;
    setCreatingQuestion(true);
    try {
      const options = newQuestionOptions
        .filter((o) => o.text.trim())
        .map((o, i) => ({ key: o.key || String(i + 1), text: o.text.trim(), order: i + 1 }));
      const res = await fetch("/api/v1/admin/questions", {
        method: "POST",
        headers: ADMIN_HEADER(password),
        body: JSON.stringify({
          questionnaireId: selectedQuestionnaireId,
          text: newQuestionText.trim(),
          type: newQuestionType,
          order: questions.length + 1,
          options: options.length ? options : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message ?? "创建题目失败");
      setQuestions((prev) => [...prev, data].sort((a, b) => a.order - b.order));
      setShowNewQuestion(false);
      setNewQuestionText("");
      setNewQuestionOptions([{ key: "A", text: "" }, { key: "B", text: "" }]);
      showToast("题目已添加");
    } catch (e) {
      console.error(e);
      showToast(e instanceof Error ? e.message : "创建题目失败", "error");
    } finally {
      setCreatingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!password || !window.confirm("确定删除该题目？")) return;
    try {
      const res = await fetch(`/api/v1/admin/questions/${id}`, {
        method: "DELETE",
        headers: ADMIN_HEADER(password),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message ?? "删除题目失败");
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      showToast("题目已删除");
    } catch (e) {
      console.error(e);
      showToast(e instanceof Error ? e.message : "删除题目失败", "error");
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
            <Link
              href="/admin"
              className="inline-flex items-center text-xs text-slate-400 hover:text-slate-700 hover:font-semibold"
            >
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
                                onClick={() => handleDeleteTrait(t.id)}
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
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 text-white text-xs"
                      onClick={handleSaveQuestions}
                      disabled={savingQuestions || questions.length === 0}
                    >
                      {savingQuestions ? "保存中..." : "保存题目"}
                    </Button>
                    {!showNewQuestion && currentQuestionnaire && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg text-xs"
                        onClick={() => setShowNewQuestion(true)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        新增题目
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
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
                              {q.stage != null && q.stage !== ""
                                ? `（${stageDisplayLabel(q.stage)}）`
                                : "（不分阶段）"}
                            </option>
                          ))}
                        </select>
                        <span>共 {currentQuestionnaire.questionCount} 题</span>
                        {editingQuestionnaireId !== currentQuestionnaire.id ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStartEditQuestionnaire(currentQuestionnaire)}
                              className="text-violet-600 hover:text-violet-700 text-[11px]"
                            >
                              编辑问卷
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteQuestionnaire(currentQuestionnaire.id)}
                              className="text-red-500 hover:text-red-600 text-[11px]"
                            >
                              删除问卷
                            </button>
                          </>
                        ) : null}
                      </>
                    ) : (
                      <span className="text-slate-400">
                        暂无问卷，请点击「新增问卷」创建。
                      </span>
                    )}
                    {!showNewQuestionnaire && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg text-xs h-7"
                        onClick={() => setShowNewQuestionnaire(true)}
                        disabled={!currentProduct}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        新增问卷
                      </Button>
                    )}
                  </div>

                  {editingQuestionnaireId && currentQuestionnaire?.id === editingQuestionnaireId && (
                    <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-violet-50 border border-violet-100 text-xs">
                      <input
                        type="text"
                        value={editQuestionnaireTitle}
                        onChange={(e) => setEditQuestionnaireTitle(e.target.value)}
                        placeholder="问卷标题"
                        className="px-2 py-1.5 rounded-md border border-slate-200 w-40"
                      />
                      <select
                        value={editQuestionnaireStage}
                        onChange={(e) => setEditQuestionnaireStage(e.target.value)}
                        className="px-2 py-1.5 rounded-md border border-slate-200 bg-white"
                      >
                        {STAGE_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={editQuestionnaireActive}
                          onChange={(e) => setEditQuestionnaireActive(e.target.checked)}
                          className="rounded border-slate-300"
                        />
                        启用
                      </label>
                      <Button size="sm" className="rounded-lg h-7" onClick={handleSaveQuestionnaire} disabled={savingQuestionnaire}>
                        {savingQuestionnaire ? "保存中..." : "保存"}
                      </Button>
                      <button type="button" onClick={() => setEditingQuestionnaireId(null)} className="text-slate-500 hover:text-slate-700">
                        取消
                      </button>
                    </div>
                  )}

                  {showNewQuestionnaire && (
                    <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                      <input
                        type="text"
                        value={newQuestionnaireTitle}
                        onChange={(e) => setNewQuestionnaireTitle(e.target.value)}
                        placeholder="问卷标题（必填）"
                        className="px-2 py-1.5 rounded-md border border-slate-200 w-48"
                      />
                      <select
                        value={newQuestionnaireStage}
                        onChange={(e) => setNewQuestionnaireStage(e.target.value)}
                        className="px-2 py-1.5 rounded-md border border-slate-200 bg-white"
                      >
                        {STAGE_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      <span className="text-slate-500">
                        一般直接选「不分阶段」即可；「通用版（30题量表）」由系统自动生成/维护，不建议手动新建。
                      </span>
                      <Button size="sm" className="rounded-lg h-7" onClick={handleCreateQuestionnaire} disabled={creatingQuestionnaire || !newQuestionnaireTitle.trim()}>
                        {creatingQuestionnaire ? "创建中..." : "创建问卷"}
                      </Button>
                      <button type="button" onClick={() => { setShowNewQuestionnaire(false); setNewQuestionnaireTitle(""); setNewQuestionnaireStage(""); }} className="text-slate-500 hover:text-slate-700">
                        取消
                      </button>
                    </div>
                  )}
                </div>

                <div className="rounded-xl bg-white border border-slate-200 p-4">
                  {loadingQuestions ? (
                    <div className="h-32 rounded-lg bg-slate-100 animate-pulse" />
                  ) : questions.length === 0 && !showNewQuestion ? (
                    <p className="text-sm text-slate-400">
                      当前问卷下暂无题目，可点击「新增题目」添加。
                    </p>
                  ) : (
                    <div className="space-y-3 text-xs sm:text-sm max-h-[520px] overflow-auto pr-1">
                      {showNewQuestion && (
                        <div className="border border-dashed border-violet-200 rounded-lg p-4 space-y-3 bg-violet-50/50">
                          <div>
                            <label className="block text-[11px] text-slate-500 mb-1">题干（必填）</label>
                            <textarea
                              value={newQuestionText}
                              onChange={(e) => setNewQuestionText(e.target.value)}
                              placeholder="输入题目内容"
                              className="w-full px-2 py-1.5 rounded-md border border-slate-200 min-h-[60px]"
                            />
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <div>
                              <label className="block text-[11px] text-slate-500 mb-1">题型</label>
                              <select
                                value={newQuestionType}
                                onChange={(e) => setNewQuestionType(e.target.value)}
                                className="px-2 py-1.5 rounded-md border border-slate-200 bg-white"
                              >
                                <option value="SINGLE_CHOICE">单选</option>
                                <option value="MULTI_CHOICE">多选</option>
                                <option value="SCALE">量表</option>
                              </select>
                            </div>
                          </div>
                          {(newQuestionType === "SINGLE_CHOICE" || newQuestionType === "MULTI_CHOICE") && (
                            <div>
                              <label className="block text-[11px] text-slate-500 mb-1">选项（key / 文案）</label>
                              <div className="space-y-1.5">
                                {newQuestionOptions.map((opt, i) => (
                                  <div key={i} className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={opt.key}
                                      onChange={(e) =>
                                        setNewQuestionOptions((prev) =>
                                          prev.map((p, j) => (j === i ? { ...p, key: e.target.value } : p))
                                        )
                                      }
                                      placeholder="A"
                                      className="w-12 px-2 py-1 rounded-md border border-slate-200"
                                    />
                                    <input
                                      type="text"
                                      value={opt.text}
                                      onChange={(e) =>
                                        setNewQuestionOptions((prev) =>
                                          prev.map((p, j) => (j === i ? { ...p, text: e.target.value } : p))
                                        )
                                      }
                                      placeholder="选项文案"
                                      className="flex-1 px-2 py-1 rounded-md border border-slate-200"
                                    />
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => setNewQuestionOptions((prev) => [...prev, { key: String(prev.length + 1), text: "" }])}
                                  className="text-[11px] text-violet-600 hover:text-violet-700"
                                >
                                  + 添加选项
                                </button>
                              </div>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Button size="sm" className="rounded-lg h-7" onClick={handleCreateQuestion} disabled={creatingQuestion || !newQuestionText.trim()}>
                              {creatingQuestion ? "添加中..." : "添加题目"}
                            </Button>
                            <button type="button" onClick={() => { setShowNewQuestion(false); setNewQuestionText(""); setNewQuestionOptions([{ key: "A", text: "" }, { key: "B", text: "" }]); }} className="text-slate-500 hover:text-slate-700 text-xs">
                              取消
                            </button>
                          </div>
                        </div>
                      )}
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
                              <button
                                type="button"
                                onClick={() => handleDeleteQuestion(q.id)}
                                className="text-red-500 hover:text-red-600"
                              >
                                删除
                              </button>
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

