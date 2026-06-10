import type { ReactNode } from "react";
import { MarketingSubNav } from "./MarketingSubNav";
import { MarketingFooter } from "./MarketingFooter";
import { FaqAssistant } from "../FaqAssistant";
import { usePageMeta, type PageMeta } from "../../hooks/usePageMeta";

export function MarketingPageLayout({ meta, children }: { meta: PageMeta; children: ReactNode }) {
  usePageMeta(meta);
  return (
    <div className="home-marketing min-h-screen bg-background">
      <MarketingSubNav />
      <main className="pt-20">{children}</main>
      <MarketingFooter />
      <FaqAssistant />
    </div>
  );
}
