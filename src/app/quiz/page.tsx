"use client";

import React, { useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Heart, Sparkles, Loader2, Clock, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getDeviceId } from "@/lib/device";
import RedeemCodeInput from "@/components/RedeemCodeInput";

const STAGE_CONFIG: Record<
  string,
  { label: string; totalQuestions: number; minutes: number }
> = {
  UNIVERSAL: { label: "通用版", totalQuestions: 38, minutes: 8 },
  AMBIGUOUS: { label: "暧昧期", totalQuestions: 28, minutes: 5 },
  ROMANCE: { label: "热恋期", totalQuestions: 36, minutes: 8 },
  STABLE: { label: "稳定期", totalQuestions: 40, minutes: 10 },
};

const VALID_MODES = ["UNIVERSAL", "STAGED"] as const;
const VALID_STAGES = ["AMBIGUOUS", "ROMANCE", "STABLE"] as const;
type ModeValue = (typeof VALID_MODES)[number];
type StageValue = (typeof VALID_STAGES)[number];

const STEP_ORDER = ["select-mode", "redeem", "nickname"] as const;
type StepValue = (typeof STEP_ORDER)[number];

function stepIndex(step: StepValue): number {
  return STEP_ORDER.indexOf(step);
}

function QuizStartContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const modeFromUrl = (searchParams.get("mode") ?? "STAGED") as string;
  const initialMode = VALID_MODES.includes(modeFromUrl as ModeValue)
    ? modeFromUrl
    : "STAGED";
  const stageFromUrl = (searchParams.get("stage") ?? "ROMANCE") as string;
  const initialStage =
    modeFromUrl === "UNIVERSAL"
      ? "UNIVERSAL"
      : VALID_STAGES.includes(stageFromUrl as StageValue)
        ? stageFromUrl
        : "ROMANCE";

  const [step, setStep] = useState<StepValue>("select-mode");
  const [mode, setMode] = useState<ModeValue>(initialMode as ModeValue);
  const [stage, setStage] = useState<StageValue>(
    (initialStage as StageValue) || "ROMANCE",
  );
  const [redeemCodeId, setRedeemCodeId] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prevStepRef = useRef<StepValue>("select-mode");

  const direction = stepIndex(step) >= stepIndex(prevStepRef.current) ? 1 : -1;
  prevStepRef.current = step;

  const stageLabel =
    mode === "UNIVERSAL"
      ? STAGE_CONFIG.UNIVERSAL.label
      : STAGE_CONFIG[stage]?.label ?? "热恋期";

  const handleSubmitNickname = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const name = nickname.trim();
    if (!name) {
      setError("请输入昵称");
      return;
    }
    setLoading(true);
    try {
      const deviceId = getDeviceId();
      const res = await fetch("/api/v1/quiz/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId,
          mode,
          stage: mode === "UNIVERSAL" ? "UNIVERSAL" : stage,
          nickname: name,
          ...(redeemCodeId ? { redeemCodeId } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "创建失败，请重试");
        return;
      }
      router.push(`/quiz/${data.sessionId}?mode=${mode}&stage=${stage}`);
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step === "select-mode") return;
    if (step === "redeem") setStep("select-mode");
    if (step === "nickname") setStep("redeem");
  };

  const slideVariants = {
    enter: (d: number) => ({ opacity: 0, x: d * 24 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d * -24 }),
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-pink-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-violet-100/40 rounded-full blur-3xl" />
      </div>

      {/* 顶部：首页（仅 step1）或上一步；step 2 时由 RedeemCodeInput 自带头部 */}
      {step !== "redeem" && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 p-4 sm:p-6"
        >
          {step === "select-mode" ? (
            <Link href="/">
              <Button
                variant="ghost"
                className="text-gray-500 hover:text-gray-800 hover:bg-white/60 rounded-full px-3"
              >
                <ArrowLeft className="w-5 h-5 mr-1.5" />
                首页
              </Button>
            </Link>
          ) : (
            <Button
              type="button"
              variant="ghost"
              onClick={goBack}
              className="text-gray-500 hover:text-gray-800 hover:bg-white/60 rounded-full px-3"
            >
              <ArrowLeft className="w-5 h-5 mr-1.5" />
              上一步
            </Button>
          )}
        </motion.div>
      )}

      {/* Step 2 使用独立全屏组件 */}
      {step === "redeem" && (
        <RedeemCodeInput
          onSuccess={(codeId) => {
            setRedeemCodeId(codeId);
            setStep("nickname");
          }}
          onBack={() => setStep("select-mode")}
        />
      )}

      {/* Step 1 与 Step 3 共用布局，用 AnimatePresence 切换 */}
      {(step === "select-mode" || step === "nickname") && (
        <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 pb-20">
          <div className="w-full max-w-md">
            <AnimatePresence mode="wait" custom={direction}>
              {step === "select-mode" && (
                <motion.div
                  key="select-mode"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="space-y-6"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-center mb-2"
                  >
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 text-balance">
                      选择测试方式
                    </h1>
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.05 }}
                    className="text-center text-gray-500 mb-8 text-balance"
                  >
                    每段关系都有独特的旅程
                  </motion.p>

                  {/* 通用版 */}
                  <motion.button
                    type="button"
                    onClick={() => {
                      setMode("UNIVERSAL");
                      setStage("ROMANCE");
                    }}
                    className={`w-full text-left rounded-2xl p-5 border-2 transition-all ${
                      mode === "UNIVERSAL"
                        ? "border-pink-400 bg-pink-50/80 shadow-md shadow-pink-200/40"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-pink-500 flex-shrink-0" />
                      <span className="font-bold text-gray-800">通用版</span>
                      <span className="text-sm text-pink-500">（推荐新用户）</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      38题全面测试，适合任何阶段 · 约8分钟
                    </p>
                  </motion.button>

                  {/* 阶段版：三选一 */}
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500 text-center">
                      或按阶段选择
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {(
                        [
                          ["AMBIGUOUS", "暧昧期", "28题·5分钟"],
                          ["ROMANCE", "热恋期", "36题·8分钟"],
                          ["STABLE", "稳定期", "40题·10分钟"],
                        ] as const
                      ).map(([s, label, badge]) => (
                        <motion.button
                          key={s}
                          type="button"
                          onClick={() => {
                            setMode("STAGED");
                            setStage(s);
                          }}
                          className={`rounded-xl py-4 px-3 border-2 transition-all ${
                            mode === "STAGED" && stage === s
                              ? "border-violet-400 bg-violet-50/80 shadow-md shadow-violet-200/40"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className="block font-semibold text-gray-800 text-sm">
                            {label}
                          </span>
                          <span className="block text-xs text-gray-500 mt-0.5">
                            {badge}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                    className="pt-4"
                  >
                    <Button
                      type="button"
                      onClick={() => setStep("redeem")}
                      className="w-full bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] hover:from-[#DB2777] hover:to-[#7C3AED] text-white rounded-2xl py-6 text-lg font-semibold shadow-lg shadow-[#EC4899]/20"
                    >
                      下一步
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </motion.div>
                </motion.div>
              )}

              {step === "nickname" && (
                <motion.div
                  key="nickname"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex justify-center mb-6"
                  >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 rounded-full">
                      <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                      <span className="text-pink-600 font-medium">
                        {stageLabel}
                      </span>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.05 }}
                    className="text-center mb-2"
                  >
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 text-balance">
                      开始之前
                    </h1>
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="text-center text-gray-500 mb-10 text-balance"
                  >
                    告诉我们你的昵称，它会出现在报告中哦
                  </motion.p>

                  <motion.form
                    onSubmit={handleSubmitNickname}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                    className="space-y-4"
                  >
                    <div>
                      <div className="shadow-md shadow-gray-200/40 rounded-2xl">
                        <input
                          type="text"
                          value={nickname}
                          onChange={(e) => {
                            setNickname(e.target.value);
                            if (error) setError(null);
                          }}
                          placeholder="输入你的昵称"
                          maxLength={20}
                          disabled={loading}
                          className="w-full px-5 py-4 bg-white rounded-2xl border-2 border-gray-100 hover:border-gray-200 text-gray-800 placeholder:text-gray-300 text-center text-lg font-medium outline-none transition-colors duration-200 focus:border-[#8B5CF6] focus:shadow-lg focus:shadow-violet-200/40"
                        />
                      </div>
                    </div>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center text-sm text-red-500 font-medium"
                      >
                        {error}
                      </motion.p>
                    )}
                    <motion.div
                      className="pt-2"
                      whileHover={
                        nickname.trim() ? { scale: 1.02 } : undefined
                      }
                      whileTap={
                        nickname.trim() ? { scale: 0.98 } : undefined
                      }
                    >
                      <Button
                        type="submit"
                        disabled={!nickname.trim() || loading}
                        className="w-full bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] hover:from-[#DB2777] hover:to-[#7C3AED] disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 text-white rounded-2xl py-6 text-lg font-semibold shadow-lg shadow-[#EC4899]/20 disabled:shadow-none transition-all duration-300"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            创建中...
                          </>
                        ) : (
                          <>
                            开始答题
                            <Sparkles className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </motion.form>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.25 }}
                    className="flex items-center justify-center gap-2 mt-10 text-gray-500 text-sm"
                  >
                    <Clock className="w-4 h-4" />
                    <span>
                      答题约需{" "}
                      {(mode === "UNIVERSAL"
                        ? STAGE_CONFIG.UNIVERSAL
                        : STAGE_CONFIG[stage]
                      )?.minutes ?? 7}{" "}
                      分钟，共{" "}
                      {(mode === "UNIVERSAL"
                        ? STAGE_CONFIG.UNIVERSAL
                        : STAGE_CONFIG[stage]
                      )?.totalQuestions ?? 32}{" "}
                      题
                    </span>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuizStartPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-pink-300 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <QuizStartContent />
    </Suspense>
  );
}
