import type { ReactNode } from "react";
import { MarketingNav } from "./MarketingNav";
import { MarketingFooter } from "./MarketingFooter";

export function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <a
        href="#main-content"
        className="absolute -top-16 left-4 z-[9999] rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-[top] duration-200 focus:top-4 focus:outline-none"
      >
        Skip to main content
      </a>
      <MarketingNav />
      <main id="main-content" className="pt-20">
        {children}
      </main>
      <MarketingFooter />
    </div>
  );
}
