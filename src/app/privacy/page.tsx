import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "隐私政策 - 合拍吗",
  description: "合拍吗隐私政策与个人信息保护说明",
};

export default function PrivacyPage() {
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">隐私政策</h1>
        <p className="text-sm text-gray-500 mb-8">最后更新：2026 年 2 月</p>

        <div className="prose prose-gray max-w-none text-gray-600 space-y-6 text-sm sm:text-base leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mt-8 mb-3">一、我们如何收集信息</h2>
            <p>
              当您使用「合拍吗」进行恋爱契合度测试时，我们可能收集：您填写的昵称、关系阶段、测试答案及由此生成的报告结果。我们不会要求您注册账号或绑定手机号即可完成测试；若您通过浏览器本地存储查看历史记录，相关数据仅保存在您的设备上。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mt-8 mb-3">二、我们如何使用信息</h2>
            <p>
              我们使用上述信息仅为：生成您的专属测试报告、在您同意的前提下用于产品改进与体验优化。我们不会将您的个人测试内容用于广告精准投放，也不会出售您的个人信息给第三方。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mt-8 mb-3">三、信息的存储与安全</h2>
            <p>
              测试数据与报告存储在受控的服务器环境中，我们采取合理的技术与管理措施保护数据安全。您可以随时清除浏览器本地数据以删除本地历史记录；如需删除服务器端与您会话相关的数据，请通过「联系我们」与我们取得联系。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mt-8 mb-3">四、Cookie 与类似技术</h2>
            <p>
              我们可能使用 Cookie 或本地存储以便记住您的偏好、保持会话状态及用于基本的产品功能。您可以在浏览器设置中管理或禁用 Cookie，但这可能影响部分功能的使用体验。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mt-8 mb-3">五、您的权利</h2>
            <p>
              您有权了解我们持有的与您相关的信息、要求更正或删除相关数据，以及就隐私问题向我们投诉或咨询。我们会在合理期限内响应您的请求。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mt-8 mb-3">六、政策更新</h2>
            <p>
              我们可能适时修订本隐私政策，修订后的版本将在本页面发布并注明更新日期。继续使用本服务即表示您接受当时的政策内容。
            </p>
          </section>

          <p className="mt-10 text-gray-500">
            如有任何疑问，请查看<Link href="/contact" className="text-pink-500 hover:underline">联系我们</Link>页面。
          </p>
        </div>
      </main>
    </div>
  );
}
