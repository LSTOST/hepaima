import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "依恋类型测试 | 知我实验室",
  description: "12道题了解你的依恋类型，完成后报告将发送至微信服务号",
  robots: { index: false, follow: false },
};

export default function AttachmentTestLayout({ children }: { children: ReactNode }) {
  return (
    <div className="attachment-zhiwo">
      <div className="mx-auto min-h-screen max-w-[390px] px-5 py-6">{children}</div>
    </div>
  );
}
