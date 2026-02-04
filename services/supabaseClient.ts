
import { createClient } from '@supabase/supabase-js';

/**
 * Safely access environment variables from either import.meta.env (Vite standard)
 * or process.env (Vite define polyfill).
 */
const getEnv = (key: string): string | undefined => {
  try {
    // Check import.meta.env first (Vite standard)
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      return (import.meta as any).env[key];
    }
    // Fallback to process.env (mapped in vite.config.ts)
    if (typeof process !== 'undefined' && (process as any).env) {
      return (process as any).env[key];
    }
  } catch (e) {
    console.warn(`Error accessing environment variable ${key}:`, e);
  }
  return undefined;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

/**
 * Verifica se as configurações básicas existem.
 */
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));
};

// Inicialização segura
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

if (!isSupabaseConfigured()) {
  console.warn('⚠️ Supabase não configurado. Verifique o arquivo .env ou as variáveis de ambiente.');
}
