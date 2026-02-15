"use client";

import React, { useState, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Heart, Sparkles, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDeviceId } from "@/lib/device";
import RedeemCodeInput from "@/components/RedeemCodeInput";
import { StageSelector } from "@/components/StageSelector";

const STAGE_KEYS = ["UNIVERSAL", "AMBIGUOUS", "ROMANCE", "STABLE"] as const;
type StageKey = (typeof STAGE_KEYS)[number];

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

const STEP_ORDER = ["redeem", "select-stage", "nickname"] as const;
type StepValue = (typeof STEP_ORDER)[number];

function stepIndex(step: StepValue): number {
  return STEP_ORDER.indexOf(step);
}

function QuizStartContent() {
  const router = useRouter();
  const [step, setStep] = useState<StepValue>("redeem");
  const [redeemCode, setRedeemCode] = useState("");
  const [remainingStages, setRemainingStages] = useState<string[]>([]);
  const [usageId, setUsageId] = useState<string | null>(null);
  const [mode, setMode] = useState<ModeValue>("STAGED");
  const [stage, setStage] = useState<StageValue>("ROMANCE");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifyingStage, setVerifyingStage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const prevStepRef = useRef<StepValue>("redeem");

  const direction = stepIndex(step) >= stepIndex(prevStepRef.current) ? 1 : -1;
  prevStepRef.current = step;

  const usedStages = STAGE_KEYS.filter((k) => !remainingStages.includes(k));

  const stageLabel =
    stage === "UNIVERSAL" || mode === "UNIVERSAL"
      ? STAGE_CONFIG.UNIVERSAL.label
      : STAGE_CONFIG[stage]?.label ?? "热恋期";

  const handleStatusSuccess = (data: {
    code: string;
    remainingStages: string[];
  }) => {
    setRedeemCode(data.code);
    setRemainingStages(data.remainingStages);
    setStep("select-stage");
  };

  const handleSelectStage = async (stageKey: string) => {
    if (!remainingStages.includes(stageKey)) return;
    setVerifyingStage(stageKey);
    setError(null);
    try {
      const deviceId = getDeviceId();
      const res = await fetch("/api/v1/redeem/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: redeemCode,
          deviceId,
          stage: stageKey,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message ?? "验证失败，请重试");
        return;
      }
      if (data.valid && data.usageId) {
        setUsageId(data.usageId);
        setMode(stageKey === "UNIVERSAL" ? "UNIVERSAL" : "STAGED");
        setStage(
          stageKey === "UNIVERSAL" ? "ROMANCE" : (stageKey as StageValue),
        );
        setStep("nickname");
      } else {
        setError("验证失败，请重试");
      }
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setVerifyingStage(null);
    }
  };

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
          ...(usageId ? { usageId } : {}),
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
    if (step === "redeem") return;
    setError(null);
    if (step === "select-stage") setStep("redeem");
    if (step === "nickname") setStep("select-stage");
  };

  const fadeVariants = {
    enter: { opacity: 0 },
    center: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-pink-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-violet-100/40 rounded-full blur-3xl" />
      </div>

      {/* Step 1: 兑换码 */}
      {step === "redeem" && (
        <RedeemCodeInput
          onStatusSuccess={handleStatusSuccess}
          onBack={undefined}
        />
      )}

      {/* Step 2 & 3: 顶部返回 + 内容 */}
      {(step === "select-stage" || step === "nickname") && (
        <div className="relative z-10 flex-1 flex flex-col min-h-0">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 p-4 sm:p-6"
          >
            <Button
              type="button"
              variant="ghost"
              onClick={goBack}
              className="text-gray-500 hover:text-gray-800 hover:bg-white/60 rounded-full px-3"
            >
              <ArrowLeft className="w-5 h-5 mr-1.5" />
              上一步
            </Button>
          </motion.div>

          <AnimatePresence mode="wait">
            {step === "select-stage" && (
              <motion.div
                key="select-stage"
                variants={fadeVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="relative z-10 flex-1 flex flex-col"
              >
                {error && (
                  <p className="text-center text-sm text-red-500 font-medium px-4 py-2">
                    {error}
                  </p>
                )}
                <div className="relative flex-1 min-h-0">
                  <StageSelector
                    code={redeemCode}
                    usedStages={usedStages}
                    onSelect={handleSelectStage}
                    onBack={goBack}
                  />
                  {verifyingStage != null && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-20 rounded-xl">
                      <Loader2 className="w-10 h-10 animate-spin text-[#EC4899]" />
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {step === "nickname" && (
              <motion.div
                key="nickname"
                variants={fadeVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 pb-20"
              >
                <div className="w-full max-w-md">
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
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
