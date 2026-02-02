import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { Scissors, Lock, Mail, User as UserIcon, Loader2 } from 'lucide-react';

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
    role: UserRole.CUSTOMER
  });

  const handleGoogleLogin = async () => {
    if (!isSupabaseConfigured()) {
      alert("Configuração do Supabase ausente no .env. Não é possível realizar login real.");
      return;
    }

    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Captura dinamicamente a URL de origem para o redirect
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      // O redirecionamento acontece via navegador, App.tsx tratará o retorno da sessão
    } catch (error: any) {
      console.error("Erro Google Login:", error);
      alert(error.message || "Erro ao conectar com Google");
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured()) {
      alert("Configuração do Supabase ausente. Use 'Continuar como Visitante'.");
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

        // Buscar perfil completo
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile) onLogin(profile as User);
        else {
          // Caso o usuário exista no Auth mas não no Profile (raro, mas possível)
          const recoveryProfile = {
             id: data.user.id,
             name: data.user.user_metadata?.full_name || 'Usuário',
             role: UserRole.CUSTOMER,
             avatar: data.user.user_metadata?.avatar_url || `https://picsum.photos/seed/${data.user.id}/100/100`
          };
          onLogin(recoveryProfile as User);
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
        if (data.user) {
          // Criar perfil no banco
          const newProfile = {
            id: data.user.id,
            name: formData.name,
            role: formData.role,
            phone: formData.phone,
            avatar: `https://picsum.photos/seed/${data.user.id}/100/100`
          };

          await supabase.from('profiles').insert([newProfile]);
          onLogin(newProfile as User);
        }
      }
    } catch (error: any) {
      alert(error.message || 'Erro na autenticação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 md:p-10 animate-fade-in border border-white/10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-brand-dark text-brand-light rounded-[1.5rem] shadow-2xl mb-4 flex items-center justify-center">
            <Scissors size={32} />
          </div>
          <h2 className="text-4xl font-black text-brand-dark italic tracking-tighter">BARVO</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
            {mode === 'login' ? 'Performance & Estilo' : 'Crie sua conta'}
          </p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={handleGoogleLogin}
            disabled={googleLoading || !isSupabaseConfigured()}
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

          <div className="relative flex items-center justify-center py-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <span className="relative bg-white px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">ou e-mail</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input required placeholder="Nome Completo" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-light font-bold text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-1">
                  <select className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm appearance-none" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})}>
                    <option value={UserRole.CUSTOMER}>Sou Cliente</option>
                    <option value={UserRole.BARBER}>Sou Barbeiro (Equipe)</option>
                    <option value={UserRole.OWNER}>Sou Proprietário</option>
                  </select>
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input required type="email" placeholder="E-mail" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-light font-bold text-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input required type="password" placeholder="Senha" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-light font-bold text-sm" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>

            <button disabled={loading} type="submit" className="w-full bg-brand-dark text-white font-black py-4 rounded-2xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest active:scale-95">
              {loading ? <Loader2 className="animate-spin" /> : mode === 'login' ? 'Acessar Painel' : 'Criar Perfil'}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-[10px] font-black text-slate-400 hover:text-brand-dark uppercase tracking-widest transition-colors">
            {mode === 'login' ? 'Ainda não é Barvo? Registre-se' : 'Já é da casa? Entre aqui'}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <button onClick={onGuestContinue} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95">
            Continuar como Visitante
          </button>
        </div>
      </div>
    </div>
  );
};