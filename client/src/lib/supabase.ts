import { createClient } from '@supabase/supabase-js';

const configuredSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const configuredSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// A calculadora pública continua abrindo sem credenciais. O login só funciona
// quando as variáveis reais do Supabase estão configuradas.
const supabaseUrl = configuredSupabaseUrl || 'http://127.0.0.1:54321';
const supabaseAnonKey = configuredSupabaseAnonKey || 'local-anon-key';

if (!configuredSupabaseUrl || !configuredSupabaseAnonKey) {
  console.warn('[Supabase] Sem credenciais configuradas; a autenticação fica desligada.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
