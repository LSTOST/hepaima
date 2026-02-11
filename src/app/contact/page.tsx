import Link from "next/link";
import { ChevronLeft, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "联系我们 - 合拍吗",
  description: "合拍吗联系方式与用户反馈",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 -ml-1.5">
              <ChevronLeft className="w-4 h-4 mr-0.5" />
              返回首页
            </Button>
          </Link>
          <span className="font-[family-name:var(--font-brand)] text-lg font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent tracking-widest">
            合拍吗
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">联系我们</h1>
        <p className="text-gray-600 mb-10">
          如有产品建议、合作意向、隐私或账号相关问题，欢迎通过以下方式与我们联系。
        </p>

        <div className="space-y-6">
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-[#EC4899]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-1">邮箱</h2>
                <p className="text-gray-600 text-sm mb-2">
                  一般咨询、反馈与商务合作，请发送邮件至：
                </p>
                <a
                  href="mailto:hello@hepaima.com"
                  className="text-[#EC4899] font-medium hover:underline"
                >
                  hello@hepaima.com
                </a>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-1">反馈与建议</h2>
                <p className="text-gray-600 text-sm">
                  使用中遇到问题或有功能建议，欢迎在邮件中说明具体情况，我们会尽快查看并回复。
                </p>
              </div>
            </div>
          </section>

          <p className="text-sm text-gray-500 pt-4">
            您还可以查阅<Link href="/privacy" className="text-pink-500 hover:underline">隐私政策</Link>
            {" 与 "}
            <Link href="/terms" className="text-pink-500 hover:underline">服务条款</Link>了解我们如何保护您的信息及使用规范。
          </p>
        </div>
      </main>
    </div>
  );
}
