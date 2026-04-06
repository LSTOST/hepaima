import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";

const reportSerif = Noto_Serif_SC({
  weight: ["600", "700"],
  subsets: ["latin"],
  variable: "--font-report-serif",
  display: "swap",
});

const reportSans = Noto_Sans_SC({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-report-sans",
  display: "swap",
});

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ReportH5Layout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`attachment-zhiwo report-h5-root ${reportSerif.variable} ${reportSans.variable}`}
    >
      <div className="report-h5-inner mx-auto min-h-screen max-w-[390px] px-5 pb-10 pt-6">
        {children}
      </div>
    </div>
  );
}
