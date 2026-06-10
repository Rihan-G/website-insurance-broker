import { Link } from "react-router-dom";
import { Award, ShieldCheck, Users } from "lucide-react";
import { MarketingPageLayout } from "../../components/marketing/MarketingPageLayout";
import { marketingAboutCopy, marketingProducts } from "../../lib/marketingProducts";
import { COMPANY_NAME } from "../../lib/branding";

export function AboutPage() {
  return (
    <MarketingPageLayout
      meta={{
        title: `About — ${COMPANY_NAME}`,
        description: marketingAboutCopy.intro,
      }}
    >
      <div className="mx-auto max-w-4xl px-5 py-16 sm:px-6">
        <h1 className="text-4xl font-bold text-surface-foreground">{marketingAboutCopy.headline}</h1>
        <p className="mt-6 text-lg text-muted-foreground">{marketingAboutCopy.intro}</p>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {marketingAboutCopy.values.map((v) => (
            <div key={v.title} className="rounded-xl border border-border bg-surface p-6">
              <ShieldCheck className="h-8 w-8 text-primary-600 dark:text-primary-400" aria-hidden />
              <h2 className="mt-4 font-semibold text-surface-foreground">{v.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-16 rounded-2xl border border-border bg-muted/30 p-8">
          <div className="flex items-center gap-3">
            <Award className="h-10 w-10 text-accent-600" aria-hidden />
            <div>
              <h2 className="text-xl font-bold text-surface-foreground">FSC Mauritius</h2>
              <p className="text-sm text-muted-foreground">Licensed insurance broker — regulatory oversight and client protection frameworks apply.</p>
            </div>
          </div>
        </div>
        <div className="mt-16">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-surface-foreground">
            <Users className="h-7 w-7" aria-hidden /> What we place
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {marketingProducts.map((p) => (
              <li key={p.slug}>
                <Link to={`/products/${p.slug}`} className="block rounded-lg border border-border bg-surface px-4 py-3 text-sm font-medium hover:border-primary-300 dark:hover:border-primary-700">
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-12 text-center">
          <Link to="/#quote" className="btn-marketing inline-flex rounded-xl px-8 py-3 text-sm font-bold text-white">
            Get a quote
          </Link>
        </div>
      </div>
    </MarketingPageLayout>
  );
}
