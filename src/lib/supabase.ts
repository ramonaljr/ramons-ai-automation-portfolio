import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Browser Supabase client for the private dashboard.
 *
 * Both values are public by design: the anon (publishable) key only grants
 * what the row-level security policies in supabase/dashboard.sql allow, and
 * those allow nothing to anyone who is not signed in. Client data is never
 * rendered on the server and never reaches the static build.
 *
 * Created lazily, so a deploy without the variables still builds and the
 * login page can say what is missing instead of crashing.
 */
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabaseConfigured = Boolean(URL && ANON_KEY)

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  if (!supabaseConfigured) return null

  client ??= createClient(URL as string, ANON_KEY as string, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  })

  return client
}
