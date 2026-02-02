import { createClient } from '@supabase/supabase-js';

/**
 * Recuperação robusta de variáveis de ambiente.
 * Tenta capturar tanto do padrão Vite (import.meta.env) quanto do padrão Node/Vercel (process.env).
 */
const getEnvVar = (key: string): string | undefined => {
  try {
    // @ts-ignore - Suporte para ambientes Vite
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key];
    }
  } catch (e) {}

  try {
    // Suporte para ambientes Node/SaaS tradicionais
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {}

  return undefined;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || getEnvVar('SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || getEnvVar('SUPABASE_ANON_KEY');

/**
 * Verifica se o Supabase está configurado corretamente.
 */
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));
};

/**
 * Cria um objeto Proxy que simula o comportamento do cliente Supabase 
 * para evitar erros de execução quando as chaves não estão presentes.
 */
const createSafeProxy = (path: string[] = []): any => {
  const func = (..._args: any[]) => {
    const methodName = path[path.length - 1];

    // Retorna estruturas compatíveis para métodos comuns
    if (methodName === 'onAuthStateChange') {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
    if (['channel', 'on', 'subscribe', 'from', 'select', 'insert', 'update', 'eq', 'single'].includes(methodName)) {
      return createSafeProxy([...path, 'chained']);
    }
    if (methodName === 'removeChannel') {
      return Promise.resolve();
    }

    // Retorna uma Promise resolvida com dados nulos para métodos assíncronos
    return Promise.resolve({ data: null, error: null });
  };

  return new Proxy(func, {
    get: (_target, prop) => {
      if (typeof prop === 'symbol' || prop === 'then') return undefined;
      return createSafeProxy([...path, String(prop)]);
    }
  });
};

// Inicializa o cliente real ou o proxy de segurança
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : createSafeProxy(['supabase']);

if (!isSupabaseConfigured()) {
  console.info('ℹ️ Barvo: Supabase não configurado. Operando em modo de demonstração local.');
}
