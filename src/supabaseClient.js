import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 🕵️‍♂️ CONNECTION CHECKER
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("🚨 MISSING KEYS: Check your .env.local file and RESTART VITE!")
} else {
  console.log("🔗 SUPABASE CONNECTED: ", supabaseUrl)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)