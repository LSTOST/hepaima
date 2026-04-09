import type { ReactNode } from "react";
import { Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";

const fontReportSans = Noto_Sans_SC({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-report-sans",
  display: "swap",
});

const fontReportSerif = Noto_Serif_SC({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-report-serif",
  display: "swap",
});

export default function ReportLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`attachment-zhiwo min-h-[100dvh] ${fontReportSans.variable} ${fontReportSerif.variable}`}
    >
      <div className="report-h5-inner mx-auto w-full max-w-[390px] px-5 pb-12">
        {children}
      </div>
    </div>
  );
}
