import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabase_publishable_key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;


export const supabase = createClient(supabaseUrl, supabase_publishable_key);