import { createClient } from '@supabase/supabase-js';

// Essas variáveis DEVEM estar na Vercel (Settings > Environment Variables)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  }
});