import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 🕵️‍♂️ DEBUGGER: Lilitaw ito sa F12 Developer Console mo.
// Kapag "undefined" ang lumabas dito, ibig sabihin hindi binabasa ang .env.local mo!
console.log("URL Status:", supabaseUrl ? "Connected" : "MISSING")
console.log("Key Status:", supabaseAnonKey ? "Connected" : "MISSING")

export const supabase = createClient(supabaseUrl, supabaseAnonKey)