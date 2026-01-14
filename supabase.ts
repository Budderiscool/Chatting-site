
import { createClient } from '@supabase/supabase-js';

// Vite uses import.meta.env for environment variables.
// Fallback to window._env_ for legacy/container environments or placeholders for local dev.
// Fix: Use type casting to access Vite's environment variables without TypeScript errors
export const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || (window as any)._env_?.SUPABASE_URL || 'https://hbruisbnvuglgqvsbhfc.supabase.co';
// Fix: Use type casting to access Vite's environment variables without TypeScript errors
export const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || (window as any)._env_?.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhicnVpc2JudnVnbGdxdnNiaGZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNTMyMDgsImV4cCI6MjA4MzkyOTIwOH0.vJgICTx8lnYlS7foirQGip03PxPXFfb5KTSySR2w6wg';

export const isConfigured = () => {
  return SUPABASE_URL !== 'https://hbruisbnvuglgqvsbhfc.supabase.co' && SUPABASE_ANON_KEY !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhicnVpc2JudnVnbGdxdnNiaGZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNTMyMDgsImV4cCI6MjA4MzkyOTIwOH0.vJgICTx8lnYlS7foirQGip03PxPXFfb5KTSySR2w6wg';
};
// h
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
