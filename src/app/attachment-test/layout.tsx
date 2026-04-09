import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "依恋类型测试 · 知我实验室",
  description: "12道题，5分钟，了解你在感情里的真实模式",
};

export default function AttachmentTestLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontFamily:
          '"PingFang SC","Hiragino Sans GB","Noto Sans SC","Microsoft YaHei",sans-serif',
      }}
    >
      {children}
    </div>
  );
}
