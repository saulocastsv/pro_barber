
import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { db } from '../services/databaseService';
import { Scissors, Lock, Mail, User as UserIcon, Loader2, Store, AlertCircle } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (user: User) => void;
  onGuestContinue: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onGuestContinue }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    shopName: '',
    role: UserRole.CUSTOMER
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (!isSupabaseConfigured()) {
        throw new Error("Supabase não configurado. Verifique suas variáveis de ambiente.");
      }

      if (mode === 'login') {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (authError) throw authError;

        const profile = await db.getProfile(authData.user.id);
        onLogin({ ...profile, email: authData.user.email } as User);
      } else {
        // Cadastro
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: { data: { full_name: formData.name, role: formData.role } }
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error("Erro ao criar usuário.");

        const profileData: Partial<User> = {
          id: authData.user.id,
          name: formData.name,
          role: formData.role,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${authData.user.id}`,
          points: 0
        };

        const profile = await db.createProfile(profileData);

        // Se for dono, cria a barbearia
        if (formData.role === UserRole.OWNER) {
          await supabase.from('barbershops').insert([{
            owner_id: authData.user.id,
            name: formData.shopName,
            slug: formData.shopName.toLowerCase().replace(/ /g, '-'),
            opening_hours: { start: '09:00', end: '19:00' },
            working_days: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']
          }]);
        }

        onLogin({ ...profile, email: formData.email } as User);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Ocorreu um erro na autenticação.");
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
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2 text-center">
            {mode === 'login' ? 'Performance & Estilo' : 'Crie sua conta profissional'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold animate-pulse">
            <AlertCircle size={18} />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input required placeholder="Nome Completo" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-light font-bold text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="relative">
                <select className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm appearance-none" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})}>
                  <option value={UserRole.CUSTOMER}>Sou Cliente</option>
                  <option value={UserRole.BARBER}>Sou Barbeiro (Equipe)</option>
                  <option value={UserRole.OWNER}>Sou Proprietário (Criar Barbearia)</option>
                </select>
              </div>
              {formData.role === UserRole.OWNER && (
                <div className="relative animate-slide-in">
                  <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input required placeholder="Nome da Sua Barbearia" className="w-full pl-12 pr-4 py-4 bg-blue-50 border border-blue-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 font-bold text-sm text-blue-900" value={formData.shopName} onChange={e => setFormData({...formData, shopName: e.target.value})} />
                </div>
              )}
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

          <button disabled={loading} type="submit" className="w-full bg-brand-dark text-white font-black py-4 rounded-2xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest active:scale-95 disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" /> : mode === 'login' ? 'Entrar' : 'Começar Agora'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-[10px] font-black text-slate-400 hover:text-brand-dark uppercase tracking-widest transition-colors">
            {mode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça o login'}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <button onClick={onGuestContinue} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
            Explorar como visitante
          </button>
        </div>
      </div>
    </div>
  );
};
