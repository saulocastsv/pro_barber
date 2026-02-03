import { createClient } from '@supabase/supabase-js';

/**
 * Utilitário extremamente robusto para capturar variáveis de ambiente.
 * Procura em process.env, import.meta.env e tenta versões com e sem prefixo VITE_.
 */
const getEnvVar = (key: string): string => {
  const getRawValue = (k: string): string => {
    // 1. Tenta process.env (comum em shims de navegadores e Node)
    try {
      if (typeof process !== 'undefined' && process.env && process.env[k]) {
        return process.env[k];
      }
    } catch (e) {}

    // 2. Tenta import.meta.env (padrão Vite)
    try {
      // @ts-ignore
      if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[k]) {
        // @ts-ignore
        return import.meta.env[k];
      }
    } catch (e) {}

    // 3. Tenta window.env ou window.process.env (algumas plataformas injetam aqui)
    try {
      if (typeof window !== 'undefined') {
        const win = window as any;
        if (win.env?.[k]) return win.env[k];
        if (win.process?.env?.[k]) return win.process.env[k];
      }
    } catch (e) {}

    return '';
  };

  let value = getRawValue(key);

  // Fallback: se a chave tem VITE_ e não achou, tenta sem VITE_
  if (!value && key.startsWith('VITE_')) {
    value = getRawValue(key.replace('VITE_', ''));
  }

  // Fallback invertido: se a chave NÃO tem VITE_ e não achou, tenta com VITE_
  if (!value && !key.startsWith('VITE_')) {
    value = getRawValue(`VITE_${key}`);
  }

  return typeof value === 'string' ? value.trim() : '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

/**
 * Verifica se as configurações básicas existem e parecem válidas.
 */
export const isSupabaseConfigured = (): boolean => {
  const hasUrl = !!supabaseUrl && supabaseUrl.startsWith('http');
  const hasKey = !!supabaseAnonKey && supabaseAnonKey.length > 10; 
  return hasUrl && hasKey;
};

// Inicialização com Fallback para evitar crash imediato
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url-missing.supabase.co', 
  supabaseAnonKey || 'placeholder-key-missing'
);

// Logging para depuração silenciosa (visível no console do dev)
if (!isSupabaseConfigured()) {
  console.group('🛠️ BARVO Debug: Supabase Configuration');
  console.warn('Configuração incompleta detectada.');
  console.log('URL:', supabaseUrl ? 'OK' : 'MISSING');
  console.log('Key:', supabaseAnonKey ? 'OK (Length: ' + supabaseAnonKey.length + ')' : 'MISSING');
  console.groupEnd();
}
