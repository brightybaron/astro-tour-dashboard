import { createClient } from "@supabase/supabase-js";

const supabaseKey = import.meta.env.SUPABASE_ANON_KEY;
const supabaseUrl = import.meta.env.SUPABASE_URL;

export const supabase = createClient(supabaseUrl, supabaseKey);
