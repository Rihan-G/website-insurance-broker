import { Link, Navigate, useParams } from "react-router-dom";
import { CheckCircle, Download } from "lucide-react";
import { MarketingPageLayout } from "../../components/marketing/MarketingPageLayout";
import { getProductBySlug } from "../../lib/marketingProducts";
import { insuranceTemplates, insuranceTemplateDownloadUrl } from "../../lib/insuranceTemplates";
import { COMPANY_NAME } from "../../lib/branding";

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = slug ? getProductBySlug(slug) : undefined;
  if (!product) return <Navigate to="/products" replace />;

  const Icon = product.icon;
  const template = product.templateId
    ? insuranceTemplates.find((t) => t.id === product.templateId)
    : undefined;

  return (
    <MarketingPageLayout
      meta={{
        title: `${product.name} — ${COMPANY_NAME}`,
        description: product.summary,
      }}
    >
      <div className="mx-auto max-w-4xl px-5 py-16 sm:px-6">
        <Link to="/products" className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-400">
          ← All products
        </Link>
        <div className="mt-6 flex items-start gap-4">
          <div className="rounded-xl bg-primary-50 p-4 dark:bg-primary-950/50">
            <Icon className="h-10 w-10 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-surface-foreground">{product.name}</h1>
            <p className="mt-2 text-lg text-muted-foreground">{product.tagline}</p>
          </div>
        </div>
        <p className="mt-8 text-muted-foreground">{product.summary}</p>
        <ul className="mt-8 space-y-3">
          {product.highlights.map((h) => (
            <li key={h} className="flex gap-3 text-sm text-surface-foreground">
              <CheckCircle className="h-5 w-5 shrink-0 text-accent-600" aria-hidden />
              {h}
            </li>
          ))}
        </ul>
        {template && (
          <a
            href={insuranceTemplateDownloadUrl(template.fileName)}
            download
            className="mt-8 inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium hover:bg-muted"
          >
            <Download className="h-4 w-4" /> Download {template.title}
          </a>
        )}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-surface-foreground">Common questions</h2>
          <dl className="mt-4 space-y-4">
            {(product.faq ?? []).map((f) => (
              <div key={f.q} className="rounded-lg border border-border bg-surface p-4">
                <dt className="font-semibold text-surface-foreground">{f.q}</dt>
                <dd className="mt-1 text-sm text-muted-foreground">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
        <Link to="/#quote" className="btn-marketing mt-12 inline-flex rounded-xl px-8 py-3 text-sm font-bold text-white">
          Get a quote
        </Link>
      </div>
    </MarketingPageLayout>
  );
}
