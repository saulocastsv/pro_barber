import { supabase, isSupabaseConfigured } from './supabaseClient';
import localDb from './localDatabase';

type SignUpOpts = {
  email: string;
  password: string;
  options?: { data?: any };
};

const localAuth = {
  async signUp({ email, password, options }: SignUpOpts) {
    try {
      const created = await localDb.createUser(email, password);
      // update profile data (name/role)
      await localDb.updateProfile(created.id, { name: options?.data?.full_name || '', role: options?.data?.role || 'customer', email });
      return { data: { user: { id: created.id, email } }, error: null };
    } catch (e: any) {
      return { data: null, error: e };
    }
  },

  async signInWithPassword({ email, password }: { email: string; password: string }) {
    try {
      const u = await localDb.signIn(email, password);
      return { data: { user: { id: u.id, email: u.email } }, error: null };
    } catch (e: any) {
      return { data: null, error: e };
    }
  }
};

export const authService = {
  async signUp(params: SignUpOpts) {
    if (isSupabaseConfigured()) {
      return supabase.auth.signUp(params as any);
    }
    return localAuth.signUp(params);
  },
  async signInWithPassword(params: { email: string; password: string }) {
    if (isSupabaseConfigured()) {
      return supabase.auth.signInWithPassword(params as any);
    }
    return localAuth.signInWithPassword(params);
  }
};

export default authService;
