import { createClient } from '@supabase/supabase-js';

const configuredSupabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const configuredSupabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Placeholder local evita que o processo (e os testes) quebrem quando o
// ambiente ainda não tem Supabase. Chamadas de autenticação não têm sucesso.
const supabaseUrl = configuredSupabaseUrl || 'http://127.0.0.1:54321';
const supabaseAnonKey = configuredSupabaseAnonKey || 'local-anon-key';

if (!configuredSupabaseUrl || !configuredSupabaseAnonKey) {
  console.warn('[Supabase] Sem credenciais configuradas; a autenticação fica desligada.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for privileged operations (email change, user management)
// Only available when SUPABASE_SERVICE_ROLE_KEY is configured
export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;
