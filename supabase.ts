
import { createClient } from '@supabase/supabase-js';

// Vite uses import.meta.env for environment variables.
// Fallback to window._env_ for legacy/container environments or placeholders for local dev.
// Fix: Use type casting to access Vite's environment variables without TypeScript errors
export const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || (window as any)._env_?.SUPABASE_URL || 'https://your-project.supabase.co';
// Fix: Use type casting to access Vite's environment variables without TypeScript errors
export const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || (window as any)._env_?.SUPABASE_ANON_KEY || 'your-anon-key';

export const isConfigured = () => {
  return SUPABASE_URL !== 'https://your-project.supabase.co' && SUPABASE_ANON_KEY !== 'your-anon-key';
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);