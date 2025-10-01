/**
 * Supabase Growth Client
 * Conexão com banco de dados de performance (mkt_ads_looker)
 */

import { createBrowserClient } from "@supabase/ssr";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Client-side Supabase Growth
export const supabaseGrowthClient = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL_GROWTH!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_GROWTH!
);

// Server-side Supabase Growth
export async function createSupabaseGrowthServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL_GROWTH!,
    process.env.SUPABASE_SERVICE_ROLE_KEY_GROWTH!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

