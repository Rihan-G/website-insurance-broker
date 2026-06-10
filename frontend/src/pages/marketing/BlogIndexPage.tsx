import { Link } from "react-router-dom";
import { MarketingPageLayout } from "../../components/marketing/MarketingPageLayout";
import { blogArticles } from "../../lib/blogArticles";
import { COMPANY_NAME } from "../../lib/branding";

export function BlogIndexPage() {
  return (
    <MarketingPageLayout
      meta={{
        title: `Insights — ${COMPANY_NAME}`,
        description: "Insurance tips for Mauritius households and businesses.",
      }}
    >
      <div className="mx-auto max-w-4xl px-5 py-16 sm:px-6">
        <h1 className="text-4xl font-bold text-surface-foreground">Insights</h1>
        <p className="mt-4 text-muted-foreground">Practical guidance from our brokers — not formal advice.</p>
        <div className="mt-10 space-y-6">
          {blogArticles.map((a) => (
            <article key={a.slug} className="rounded-xl border border-border bg-surface p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">{a.category}</p>
              <h2 className="mt-2 text-xl font-bold">
                <Link to={`/blog/${a.slug}`} className="hover:text-primary-600">{a.title}</Link>
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{a.excerpt}</p>
              <p className="mt-3 text-xs text-muted-foreground">{new Date(a.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
            </article>
          ))}
        </div>
      </div>
    </MarketingPageLayout>
  );
}
