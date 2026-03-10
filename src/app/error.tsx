"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Error:", error);
  }, [error]);

  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-100 mb-4">
            <span className="text-2xl text-violet-600">!</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            页面开小差了
          </h1>
          <p className="text-gray-500 mb-6 text-sm sm:text-base">
            刷新一下页面或稍后重试。如果问题持续出现，可以在「联系我们」页面告诉我们。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={reset}
              className="bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] hover:from-[#DB2777] hover:to-[#7C3AED] text-white rounded-full px-6 py-5 text-sm sm:text-base font-medium shadow-lg shadow-pink-500/15"
            >
              重新加载
            </Button>
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              回到首页
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}

