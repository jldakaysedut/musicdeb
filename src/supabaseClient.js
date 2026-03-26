import { createClient } from '@supabase/supabase-js'

// 🚨 SIGURADUHIN NA ITO ANG URL NG BAGONG PROJECT MO!
const supabaseUrl = 'https://xbckrplonyrgveaiuyat.supabase.co' 
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)