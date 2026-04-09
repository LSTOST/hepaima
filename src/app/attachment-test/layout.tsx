import type { ReactNode } from "react";

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
