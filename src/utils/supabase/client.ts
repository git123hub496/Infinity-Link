import { createBrowserClient } from "@supabase/ssr";

const getEnv = (key: string) => {
  return (import.meta as any).env[key] || "";
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('NEXT_PUBLIC_SUPABASE_URL') || "https://xsasmgcybibzptkgmoqx.supabase.co";
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY') || "sb_publishable_ucCdZMvXPgdlgaDPdTeUDA_lV3x94cS";

export const createClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase credentials missing. Identity modules will remain offline.");
    return null;
  }
  
  return createBrowserClient(
    supabaseUrl,
    supabaseKey
  );
};
