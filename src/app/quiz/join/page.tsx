"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { getDeviceId } from "@/lib/device";

function JoinContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const codeFromUrl = searchParams.get("code") ?? "";

  const [inviteCode, setInviteCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stageLabel, setStageLabel] = useState<string | null>(null);

  useEffect(() => {
    if (codeFromUrl) {
      setInviteCode(codeFromUrl.slice(0, 6).toUpperCase());
    }
  }, [codeFromUrl]);

  useEffect(() => {
    if (inviteCode.length !== 6) {
      setStageLabel(null);
      return;
    }
    const controller = new AbortController();
    fetch(`/api/v1/quiz/preview?code=${encodeURIComponent(inviteCode)}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.stageLabel) setStageLabel(data.stageLabel);
        else setStageLabel(null);
      })
      .catch(() => setStageLabel(null));
    return () => controller.abort();
  }, [inviteCode]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase();
    setInviteCode(raw);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const code = inviteCode.trim();
    const name = nickname.trim();

    if (!code) {
      setError("请输入邀请码");
      return;
    }
    if (code.length !== 6) {
      setError("邀请码为 6 位");
      return;
    }
    if (!name) {
      setError("请输入昵称");
      return;
    }

    setLoading(true);

    try {
      const deviceId = getDeviceId();
      const res = await fetch("/api/v1/quiz/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId,
          inviteCode: code,
          nickname: name,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 404) {
          setError("邀请码无效，请检查后重试");
        } else if (res.status === 400) {
          const msg = data.message ?? "";
          if (msg.includes("过期")) setError("邀请码已过期");
          else if (msg.includes("已有人") || msg.includes("已有人加入")) setError("该测试已有人参与");
          else if (msg.includes("自己")) setError("不能和自己测试哦");
          else setError(msg);
        } else {
          setError(data.message ?? "加入失败，请重试");
        }
        return;
      }

      router.push(`/quiz/${data.sessionId}?mode=${data.mode ?? "STAGED"}&stage=${data.stage}`);
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50/50 to-white">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>首页</span>
          </Link>
        </div>
      </nav>

      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 rounded-full mb-6">
              <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
              <span className="text-pink-600 font-medium">
                {stageLabel ?? "邀请加入"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">加入测试</h1>
            <p className="text-gray-500 text-sm mb-8">
              输入邀请码和昵称，和 TA 一起完成测试
            </p>

            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  邀请码
                </label>
                <Input
                  type="text"
                  placeholder="6 位邀请码"
                  value={inviteCode}
                  onChange={handleCodeChange}
                  maxLength={6}
                  className="w-full h-12 rounded-xl border-gray-200 bg-white px-4 text-base text-center font-mono tracking-[0.3em] uppercase"
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  你的昵称
                </label>
                <Input
                  type="text"
                  placeholder="输入昵称"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full h-12 rounded-xl border-gray-200 bg-white px-4 text-base text-center"
                  maxLength={20}
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <Button
                type="submit"
                disabled={loading || !nickname.trim()}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 text-white font-medium transition-all duration-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    加入中...
                  </>
                ) : (
                  <>
                    开始答题
                    <Sparkles className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
        </div>
      }
    >
      <JoinContent />
    </Suspense>
  );
}
