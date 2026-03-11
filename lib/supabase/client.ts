import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (client) return client

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables are not set. Using placeholder values.')
    client = createBrowserClient(
      'https://placeholder.supabase.co',
      'placeholder-anon-key',
    )
    return client
  }

  client = createBrowserClient(supabaseUrl, supabaseAnonKey)
  return client
}
