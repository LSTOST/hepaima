"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Ticket, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const DEVICE_ID_KEY = "deviceId";

function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

type Status = "idle" | "loading" | "error";

export interface RedeemCodeInputProps {
  onSuccess: (codeId: string) => void;
  xiaohongshuUrl?: string;
  /** 提供时显示「上一步」按钮，用于嵌入多步流程 */
  onBack?: () => void;
}

export default function RedeemCodeInput({
  onSuccess,
  xiaohongshuUrl = "https://www.xiaohongshu.com",
  onBack,
}: RedeemCodeInputProps) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const isValid = code.trim().length > 0;

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().slice(0, 12);
    setCode(val);
    if (status === "error") {
      setStatus("idle");
      setErrorMsg("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || status === "loading") return;

    setStatus("loading");
    setErrorMsg("");

    const deviceId = getDeviceId();
    const body = { code: code.replace(/\s/g, "").toUpperCase(), deviceId };

    try {
      const res = await fetch("/api/v1/redeem/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data?.message ?? "验证失败，请稍后再试");
        return;
      }

      if (data.valid && data.codeId) {
        onSuccess(data.codeId);
        return;
      }

      setStatus("error");
      setErrorMsg(data?.message ?? "验证失败，请稍后再试");
    } catch {
      setStatus("error");
      setErrorMsg("网络异常，请稍后再试");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-pink-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-violet-100/40 rounded-full blur-3xl" />
      </div>

      {/* 上一步（嵌入流程时） */}
      {onBack && (
        <div className="relative z-10 p-4 sm:p-6">
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="text-gray-500 hover:text-gray-800 hover:bg-white/60 rounded-full px-3"
          >
            <ArrowLeft className="w-5 h-5 mr-1.5" />
            上一步
          </Button>
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 pb-20">
        <div className="w-full max-w-md">
          {/* Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.1,
              type: "spring",
              stiffness: 200,
            }}
            className="flex justify-center mb-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-100 to-violet-100 flex items-center justify-center">
              <Ticket className="w-8 h-8 text-[#EC4899]" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center mb-10"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3 text-balance">
              输入兑换码
            </h1>
            <p className="text-gray-500 text-balance">
              在小红书店铺购买后获得兑换码
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-5"
          >
            {/* Code input */}
            <motion.div
              animate={{ scale: isFocused ? 1.01 : 1 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <input
                type="text"
                value={code}
                onChange={handleCodeChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="HP-XXXX-XXXX"
                maxLength={12}
                className={`w-full px-4 py-3 bg-white rounded-xl border text-gray-800 placeholder:text-gray-300 text-center text-sm font-mono font-semibold tracking-[0.2em] outline-none transition-all duration-200 ${
                  status === "error"
                    ? "border-red-300 shadow-sm shadow-red-100/40"
                    : isFocused
                      ? "border-pink-300 shadow-sm shadow-pink-100/40"
                      : "border-gray-200 hover:border-gray-300"
                }`}
              />
            </motion.div>

            {/* Error message */}
            <AnimatePresence>
              {status === "error" && errorMsg && (
                <motion.p
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm text-red-500 text-center"
                >
                  {errorMsg}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <motion.div
              whileHover={
                isValid && status !== "loading" ? { scale: 1.02 } : undefined
              }
              whileTap={
                isValid && status !== "loading" ? { scale: 0.98 } : undefined
              }
            >
              <Button
                type="submit"
                disabled={!isValid || status === "loading"}
                className="w-full bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] hover:from-[#DB2777] hover:to-[#7C3AED] disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 text-white rounded-xl py-5 text-base font-semibold shadow-md shadow-pink-500/15 disabled:shadow-none transition-all duration-300"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    验证中...
                  </>
                ) : (
                  "验证并开始"
                )}
              </Button>
            </motion.div>
          </motion.form>

          {/* Bottom link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-10 text-center"
          >
            <a
              href={xiaohongshuUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-[#EC4899] transition-colors duration-200"
            >
              还没有兑换码？去小红书店铺购买
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
