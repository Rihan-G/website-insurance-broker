import { createServerClient, parseCookieHeader, serializeCookieHeader } from "@supabase/ssr";

function isConfigured(): boolean {
  const url = process.env.SUPABASE_URL ?? "";
  return url.length > 0 && url.startsWith("https://") && !url.includes("placeholder");
}

export function createSupabaseServerClient(request: Request, headers: Headers) {
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get("Cookie") ?? "");
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            headers.append("Set-Cookie", serializeCookieHeader(name, value, options));
          });
        },
      },
    },
  );
}

export async function getSession(request: Request) {
  const headers = new Headers();
  if (!isConfigured()) {
    return { session: null, headers, supabase: null };
  }
  const supabase = createSupabaseServerClient(request, headers);
  const { data: { session } } = await supabase.auth.getSession();
  return { session, headers, supabase };
}
