"use client";

import Link from "next/link";

/**
 * 支付完成同步跳转页（支付宝 return_url、用户关闭微信支付后也可引导至此）
 * 实际解锁以异步通知为准，结果页轮询订单状态即可
 */
export default function ResultReturnPage() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-semibold text-gray-800">支付提交成功</h1>
      <p className="text-gray-600">
        正在处理您的订单，请稍候在结果页查看报告是否已解锁。
      </p>
      <Link
        href="/history"
        className="rounded-lg bg-pink-500 px-4 py-2 text-white hover:bg-pink-600"
      >
        查看我的记录
      </Link>
    </div>
  );
}
