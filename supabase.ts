
import { createClient } from '@supabase/supabase-js';

// Accessing Vite environment variables
// These should be set in Cloudflare as VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
const rawUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const rawKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

export const SUPABASE_URL = rawUrl || (window as any)._env_?.SUPABASE_URL || 'https://your-project.supabase.co';
export const SUPABASE_ANON_KEY = rawKey || (window as any)._env_?.SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
