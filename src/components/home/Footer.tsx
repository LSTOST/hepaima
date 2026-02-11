"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-8 px-4 sm:px-6 border-t border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
        <p>© 2026 合拍吗 hepaima.com</p>
        <div className="flex flex-wrap items-center justify-center gap-6">
          <Link href="/privacy" className="hover:text-gray-600 transition-colors">
            隐私政策
          </Link>
          <Link href="/terms" className="hover:text-gray-600 transition-colors">
            服务条款
          </Link>
          <Link href="/contact" className="hover:text-gray-600 transition-colors">
            联系我们
          </Link>
        </div>
      </div>
    </footer>
  );
}
