import { Link, redirect } from "react-router";
import { MarketingLayout } from "~/components/marketing/MarketingLayout";
import { getBlogArticle } from "~/lib/blogArticles";
import { COMPANY_NAME } from "~/lib/branding";
import type { Route } from "./+types/blog.$slug";

export async function loader({ params }: Route.LoaderArgs) {
  const article = params.slug ? getBlogArticle(params.slug) : undefined;
  if (!article) throw redirect("/blog");
  return { article };
}

export function meta({ data }: Route.MetaArgs) {
  if (!data) return [{ title: `Insights — ${COMPANY_NAME}` }];
  return [
    { title: `${data.article.title} — ${COMPANY_NAME}` },
    { name: "description", content: data.article.excerpt },
  ];
}

export default function BlogPost({ loaderData }: Route.ComponentProps) {
  const { article } = loaderData;

  return (
    <MarketingLayout>
      <article className="mx-auto max-w-3xl px-5 py-16 sm:px-6">
        <Link to="/blog" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
          ← All insights
        </Link>
        <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">{article.category}</p>
        <h1 className="mt-2 text-4xl font-bold text-gray-900 dark:text-white">{article.title}</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
          {new Date(article.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </p>
        <div className="mt-10 space-y-4">
          {article.body.map((p) => (
            <p key={p.slice(0, 24)} className="leading-relaxed text-gray-600 dark:text-gray-400">{p}</p>
          ))}
        </div>
        <Link to="/#quote" className="mt-12 inline-flex rounded-xl bg-blue-600 px-8 py-3 text-sm font-bold text-white hover:bg-blue-700">
          Get a quote
        </Link>
      </article>
    </MarketingLayout>
  );
}
