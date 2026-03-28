import { createClient } from '@supabase/supabase-js';

// No celular e em outros PCs, o código SÓ funciona se estiver assim:
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);