
// This configuration prioritizes Environment Variables (for Render/Vercel)
// but falls back to hardcoded strings for local testing if needed.

export const SUPABASE_CONFIG = {
  // On Render, set these in the "Environment" tab as VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
  url: (import.meta as any).env?.VITE_SUPABASE_URL || "YOUR_SUPABASE_PROJECT_URL_HERE", 
  key: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY_HERE" 
};
