'use client';

import { ThemeProvider } from 'next-themes';
import { Toaster } from "@/components/toaster";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PerformanceMonitor } from "@/components/performance-monitor";
import { ServiceWorkerRegister } from "@/components/service-worker-register";


export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="catppuccin-mocha"
      enableSystem={false}
      storageKey="ira-theme"
    >
      <ServiceWorkerRegister />
      {children}
      <Toaster />
      <PerformanceMonitor />
      {process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' && (
        <>
          <Analytics />
          <SpeedInsights />
        </>
      )}
    </ThemeProvider>
  );
}