import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://tsnhuqirnztbhjvwdxzb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzbmh1cWlybnp0YmhqdndkeHpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMjk4ODQsImV4cCI6MjA4NDgwNTg4NH0.MnOeeRfg2EKCnmxTlX0NCqYhB11B-3t-1dny-ILxLHM";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
