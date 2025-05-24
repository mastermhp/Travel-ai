import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables:")
  console.error("NEXT_PUBLIC_SUPABASE_URL:", !!supabaseUrl)
  console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY:", !!supabaseAnonKey)

  // For development, provide a more helpful error message
  if (process.env.NODE_ENV === "development") {
    throw new Error(`
      Missing Supabase environment variables. Please check your .env.local file:
      - NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? "Found" : "Missing"}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? "Found" : "Missing"}
      
      Make sure your .env.local file is in the root directory and contains:
      NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
      NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    `)
  }

  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role (if needed)
export const createServerClient = () => {
  return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey)
}
