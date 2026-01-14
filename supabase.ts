
import { createClient } from '@supabase/supabase-js';

// These would normally be environment variables
// In this simulated environment, we assume process.env.SUPABASE_URL and SUPABASE_ANON_KEY might be available 
// or replaced by the runtime.
const supabaseUrl = (window as any)._env_?.SUPABASE_URL || 'https://hbruisbnvuglgqvsbhfc.supabase.co';
const supabaseAnonKey = (window as any)._env_?.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhicnVpc2JudnVnbGdxdnNiaGZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNTMyMDgsImV4cCI6MjA4MzkyOTIwOH0.vJgICTx8lnYlS7foirQGip03PxPXFfb5KTSySR2w6wg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
