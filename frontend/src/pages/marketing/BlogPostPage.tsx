import { Link, Navigate, useParams } from "react-router-dom";
import { MarketingPageLayout } from "../../components/marketing/MarketingPageLayout";
import { getBlogArticle } from "../../lib/blogArticles";
import { COMPANY_NAME } from "../../lib/branding";

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getBlogArticle(slug) : undefined;
  if (!article) return <Navigate to="/blog" replace />;

  return (
    <MarketingPageLayout
      meta={{ title: `${article.title} — ${COMPANY_NAME}`, description: article.excerpt }}
    >
      <article className="mx-auto max-w-3xl px-5 py-16 sm:px-6">
        <Link to="/blog" className="text-sm font-medium text-primary-600 hover:underline">← All insights</Link>
        <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-primary-600">{article.category}</p>
        <h1 className="mt-2 text-4xl font-bold text-surface-foreground">{article.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {new Date(article.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </p>
        <div className="prose prose-slate dark:prose-invert mt-10 max-w-none space-y-4">
          {article.body.map((p) => (
            <p key={p.slice(0, 24)} className="text-muted-foreground leading-relaxed">{p}</p>
          ))}
        </div>
        <Link to="/#quote" className="btn-marketing mt-12 inline-flex rounded-xl px-8 py-3 text-sm font-bold text-white">
          Get a quote
        </Link>
      </article>
    </MarketingPageLayout>
  );
}
