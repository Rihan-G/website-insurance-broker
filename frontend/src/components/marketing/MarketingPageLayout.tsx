import type { ReactNode } from "react";
import { MarketingSubNav } from "./MarketingSubNav";
import { MarketingFooter } from "./MarketingFooter";
import { FaqAssistant } from "../FaqAssistant";
import { usePageMeta, type PageMeta } from "../../hooks/usePageMeta";

export function MarketingPageLayout({ meta, children }: { meta: PageMeta; children: ReactNode }) {
  usePageMeta(meta);
  return (
    <div className="home-marketing min-h-screen bg-background">
      <a
        href="#main-content"
        className="absolute -top-16 left-4 z-[9999] rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-[top] duration-200 focus:top-4 focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>
      <MarketingSubNav />
      <main id="main-content" className="pt-20">{children}</main>
      <MarketingFooter />
      <FaqAssistant />
    </div>
  );
}
