import { createClient } from '@supabase/supabase-js';

/**
 * Robust environment variable retrieval.
 */
const getEnvVar = (key: string): string | undefined => {
  try {
    // @ts-ignore
    const viteVar = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env[key] : undefined;
    if (viteVar) return viteVar;
    
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {}
  return undefined;
};

const supabaseUrl = getEnvVar('SUPABASE_URL') || getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('SUPABASE_ANON_KEY') || getEnvVar('VITE_SUPABASE_ANON_KEY');

/**
 * Check if Supabase is properly configured.
 */
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));
};

/**
 * Creates a proxy that returns compatible mock objects when Supabase is missing.
 */
const createSafeProxy = (path: string[] = []): any => {
  const func = (...args: any[]) => {
    const methodName = path[path.length - 1];

    // Handle specific methods to return expected structures
    if (methodName === 'onAuthStateChange') {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
    if (methodName === 'channel' || methodName === 'on' || methodName === 'subscribe') {
      return createSafeProxy([...path, 'chained']);
    }
    if (methodName === 'removeChannel') {
      return Promise.resolve();
    }

    // Default to a promise for async methods
    return Promise.resolve({ data: null, error: null });
  };

  return new Proxy(func, {
    get: (target, prop) => {
      if (typeof prop === 'symbol') return undefined;
      if (prop === 'then') return undefined;
      return createSafeProxy([...path, String(prop)]);
    }
  });
};

// Initialize real client or safe proxy
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : createSafeProxy(['supabase']);

if (!isSupabaseConfigured()) {
  console.warn('⚠️ Barvo SaaS: Supabase credentials missing. Running in demo/mock mode.');
}