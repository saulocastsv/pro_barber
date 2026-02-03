
import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { Scissors, Lock, Mail, User as UserIcon, Loader2, Store, Phone, AlertCircle } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (user: User) => void;
  onGuestContinue: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onGuestContinue }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    shopName: '',
    role: UserRole.CUSTOMER
  });

  const handleGoogleLogin = async () => {
    if (!isSupabaseConfigured()) {
      alert("Erro: Configurações do Supabase não encontradas.");
      return;
    }

    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Erro Google Login:", error);
      alert(error.message || "Erro ao conectar com Google");
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured()) {
      alert("Configuração do Supabase ausente.");
      return;
    }
    
    setLoading(true);

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') throw profileError;

        if (profile) {
          onLogin({
            ...profile,
            name: profile.name || profile.full_name || 'Usuário',
            barbershopId: profile.barbershop_id,
            email: data.user.email
          } as User);
        } else {
          onLogin({
             id: data.user.id,
             name: data.user.user_metadata?.full_name || 'Usuário',
             role: (data.user.user_metadata?.role as UserRole) || UserRole.CUSTOMER,
             avatar: data.user.user_metadata?.avatar_url || `https://picsum.photos/seed/${data.user.id}/100/100`,
             email: data.user.email
          } as User);
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
              role: formData.role
            }
          }
        });

        if (error) throw error;
        if (!data.user) throw new Error("Falha ao criar usuário.");

        let barbershopId = null;

        if (formData.role === UserRole.OWNER && formData.shopName) {
            const { data: shop, error: shopError } = await supabase
                .from('barbershops')
                .insert([{
                    name: formData.shopName,
                    slug: formData.shopName.toLowerCase().replace(/\s+/g, '-'),
                    owner_id: data.user.id,
                    phone: formData.phone
                }])
                .select()
                .single();
            
            if (shopError) throw shopError;
            barbershopId = shop.id;
        }

        const profileData = {
          id: data.user.id,
          name: formData.name,
          role: formData.role,
          phone: formData.phone,
          barbershop_id: barbershopId,
          avatar: `https://picsum.photos/seed/${data.user.id}/100/100`
        };

        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert([profileData], { onConflict: 'id' });
          
        if (upsertError) throw upsertError;

        onLogin({
            ...profileData,
            barbershopId: barbershopId || undefined,
            email: formData.email
        } as User);
      }
    } catch (error: any) {
      console.error("Auth Error:", error);
      alert(error.message || 'Erro na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
      {!isSupabaseConfigured() && (
        <div className="fixed top-4 left-4 right-4 bg-amber-500 text-white p-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-fade-in text-xs font-bold">
          <AlertCircle size={20} />
          <span>Atenção: Modo offline/demonstração ativo.</span>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 md:p-10 animate-fade-in border border-white/10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-brand-dark text-brand-light rounded-[1.5rem] shadow-2xl mb-4 flex items-center justify-center">
            <Scissors size={32} />
          </div>
          <h2 className="text-4xl font-black text-brand-dark italic tracking-tighter">BARVO</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2 text-center">
            {mode === 'login' ? 'Performance & Estilo' : 'Crie sua conta profissional'}
          </p>
        </div>

        <div className="space-y-4">
          {mode === 'login' && (
            <button 
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 py-4 border-2 border-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
            >
              {googleLoading ? (
                <Loader2 className="animate-spin text-brand-dark" size={20} />
              ) : (
                <>
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                  Entrar com Google
                </>
              )}
            </button>
          )}

          <div className="relative flex items-center justify-center py-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <span className="relative bg-white px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">ou e-mail</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" id="auth-form">
            {mode === 'register' && (
              <>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    required 
                    id="reg-name"
                    name="name"
                    autoComplete="name"
                    placeholder="Seu Nome Completo" 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-light font-bold text-sm" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                
                <div className="relative">
                  <select 
                    id="reg-role"
                    name="role"
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm appearance-none" 
                    value={formData.role} 
                    onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                  >
                    <option value={UserRole.CUSTOMER}>Sou Cliente</option>
                    <option value={UserRole.BARBER}>Sou Barbeiro (Equipe)</option>
                    <option value={UserRole.OWNER}>Sou Proprietário (Criar Barbearia)</option>
                  </select>
                </div>

                {formData.role === UserRole.OWNER && (
                    <div className="relative animate-fade-in">
                        <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          required 
                          id="reg-shop"
                          name="organization"
                          autoComplete="organization"
                          placeholder="Nome da sua Barbearia" 
                          className="w-full pl-12 pr-4 py-4 bg-blue-50 border border-blue-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 font-bold text-sm text-blue-900 placeholder:text-blue-300" 
                          value={formData.shopName} 
                          onChange={e => setFormData({...formData, shopName: e.target.value})} 
                        />
                    </div>
                )}

                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    id="reg-phone"
                    name="tel"
                    autoComplete="tel"
                    placeholder="WhatsApp (Opcional)" 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-light font-bold text-sm" 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                  />
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                required 
                type="email" 
                id="auth-email"
                name="email"
                autoComplete="email"
                placeholder="Seu E-mail" 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-light font-bold text-sm" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                required 
                type="password" 
                id="auth-password"
                name="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="Sua Senha" 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-light font-bold text-sm" 
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
              />
            </div>

            <button disabled={loading} type="submit" className="w-full bg-brand-dark text-white font-black py-4 rounded-2xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest active:scale-95">
              {loading ? <Loader2 className="animate-spin" /> : mode === 'login' ? 'Entrar no Sistema' : 'Finalizar Cadastro'}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-[10px] font-black text-slate-400 hover:text-brand-dark uppercase tracking-widest transition-colors">
            {mode === 'login' ? 'Não tem conta? Registre sua barbearia' : 'Já tem conta? Faça o login'}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <button onClick={onGuestContinue} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95">
            Explorar como Visitante
          </button>
        </div>
      </div>
    </div>
  );
};
