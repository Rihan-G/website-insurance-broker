import type { Route } from "./+types/home";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Sindicom Brokers — Insurance Brokers in Mauritius" },
    { name: "description", content: "Compare insurance quotes, manage your policies, and file claims with Sindicom Brokers Ltd." },
  ];
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white p-6 text-center">
      <h1 className="text-4xl font-black text-gray-900">Sindicom Brokers</h1>
      <p className="mt-4 text-lg text-gray-600">React Router v7 — scaffold ready.</p>
      <p className="mt-2 text-sm text-gray-400">Pages will be migrated here from <code className="rounded bg-gray-100 px-1">frontend/</code>.</p>
    </main>
  );
}
