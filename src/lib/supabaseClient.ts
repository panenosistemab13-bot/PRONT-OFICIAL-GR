import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://umwdxudhmyhhdakbtmcc.supabase.co";
const supabaseAnonKey = "sb_publishable_EAn9HqCwP1uhJHIkMwZvlQ_3gYaapct";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
