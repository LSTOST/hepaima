import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "服务条款 - 合拍吗",
  description: "合拍吗服务条款与使用须知",
};

export default function TermsPage() {
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">服务条款</h1>
        <p className="text-sm text-gray-500 mb-8">最后更新：2026 年 2 月</p>

        <div className="prose prose-gray max-w-none text-gray-600 space-y-6 text-sm sm:text-base leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mt-8 mb-3">一、服务说明</h2>
            <p>
              「合拍吗」是一款基于心理学与关系研究的恋爱契合度测试产品。我们提供测试题目、结果分析与报告生成等服务。服务内容仅供娱乐与自我认知参考，不构成任何专业心理咨询、医疗或法律建议。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mt-8 mb-3">二、用户行为规范</h2>
            <p>
              使用本服务时，您应遵守法律法规及公序良俗，不得利用本服务从事欺诈、骚扰、传播违法或不良信息等行为。您对自身填写的内容及由此产生的使用后果负责。我们保留在合理范围内限制或终止违规用户使用服务的权利。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mt-8 mb-3">三、知识产权</h2>
            <p>
              本服务中的题目、文案、界面设计、算法与报告结构等内容的著作权及相关知识产权归「合拍吗」或相应权利人所有。未经授权，您不得复制、修改、传播或用于商业目的。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mt-8 mb-3">四、免责声明</h2>
            <p>
              测试结果与报告基于您提供的信息及通用模型生成，仅供参考，不保证完全准确或适用于所有情况。我们不对因使用或依赖本服务内容而导致的任何直接或间接损失承担责任。如您需要专业情感或心理支持，请寻求具备资质的专业人士。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mt-8 mb-3">五、服务变更与终止</h2>
            <p>
              我们可能因产品迭代、合规要求或运营需要而调整服务内容或暂停、终止部分功能，并将尽量通过页面公告等方式通知用户。本条款的修改同样以页面发布为准，继续使用即视为接受修改后的条款。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mt-8 mb-3">六、适用法律与争议解决</h2>
            <p>
              本条款的订立、效力、解释与争议解决均适用中华人民共和国法律。因本服务产生的争议，双方应尽量友好协商；协商不成的，可向本产品运营主体所在地有管辖权的法院提起诉讼。
            </p>
          </section>

          <p className="mt-10 text-gray-500">
            如有疑问，请通过<Link href="/contact" className="text-pink-500 hover:underline">联系我们</Link>页面与我们沟通。
          </p>
        </div>
      </main>
    </div>
  );
}
