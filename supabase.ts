
import { createClient } from '@supabase/supabase-js';

// These would normally be environment variables
// In this simulated environment, we assume process.env.SUPABASE_URL and SUPABASE_ANON_KEY might be available 
// or replaced by the runtime.
const supabaseUrl = (window as any)._env_?.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = (window as any)._env_?.SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
