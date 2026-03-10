"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Config = {
  enableGa4: boolean;
  ga4MeasurementId: string | null;
  enableUmami: boolean;
  umamiScriptUrl: string | null;
  umamiWebsiteId: string | null;
  enableClarity: boolean;
  clarityProjectId: string | null;
};

function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "";
  let vid = localStorage.getItem("hepaima_visitor_id");
  if (!vid) {
    vid = `v_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
    localStorage.setItem("hepaima_visitor_id", vid);
  }
  return vid;
}

/** 上报埋点事件，供业务页调用（如 quiz_start、result_view、pay_click） */
export function trackEvent(eventType: string, path?: string) {
  if (typeof window === "undefined") return;
  const visitorId = getOrCreateVisitorId();
  fetch("/api/v1/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventType,
      path: path || window.location.pathname,
      visitorId,
    }),
  }).catch(() => {});
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [config, setConfig] = useState<Config | null>(null);

  useEffect(() => {
    fetch("/api/v1/public/analytics-config")
      .then((r) => r.json())
      .then(setConfig)
      .catch(() => setConfig(null));
  }, []);

  useEffect(() => {
    if (!pathname) return;
    trackEvent("page_view", pathname);
  }, [pathname]);

  return (
    <>
      {children}
      {config?.enableGa4 && config.ga4MeasurementId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${config.ga4MeasurementId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-config" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){ dataLayer.push(arguments); }
              gtag('js', new Date());
              gtag('config', '${config.ga4MeasurementId}');
            `}
          </Script>
        </>
      )}
      {config?.enableUmami && config.umamiScriptUrl && config.umamiWebsiteId && (
        <Script
          src={config.umamiScriptUrl}
          strategy="afterInteractive"
          data-website-id={config.umamiWebsiteId}
        />
      )}
      {config?.enableClarity && config.clarityProjectId && (
        <Script id="ms-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src=\"https://www.clarity.ms/tag/\"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, \"clarity\", \"script\", \"${config.clarityProjectId}\");
          `}
        </Script>
      )}
    </>
  );
}
