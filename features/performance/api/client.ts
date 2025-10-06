"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase Client for Performance module (GROWTH database)
 * Uses GROWTH-specific environment variables
 */
export const supabaseGrowth = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL_GROWTH!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_GROWTH!,
);


