"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-pink-100 mb-4">
          <span className="text-2xl text-pink-500">?</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          好像走丢了这一页
        </h1>
        <p className="text-gray-500 mb-6 text-sm sm:text-base">
          你访问的页面不存在，或者已经被移动。试试回到首页重新开始测评吧。
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/">
            <Button className="bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] hover:from-[#DB2777] hover:to-[#7C3AED] text-white rounded-full px-6 py-5 text-sm sm:text-base font-medium shadow-lg shadow-pink-500/15">
              回到首页
            </Button>
          </Link>
          <Link href="/history" className="text-sm text-gray-500 hover:text-gray-700">
            查看我的历史记录
          </Link>
        </div>
      </div>
    </div>
  );
}

