


import React, { useState } from 'react';
import Image from 'next/image';
import { UserRole, User } from '../types';
import authService from '../services/authService';
import { db } from '../services/databaseService';
import { Loader2, Eye, EyeOff, AlertCircle, Check, LogIn } from 'lucide-react';
import { UIButton, Section, EmptyState } from './UIKit';

interface AuthScreenProps {
  onLogin: (user: User) => void;
  onGuestContinue: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onGuestContinue }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [emailValidated, setEmailValidated] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const { data: authData, error: authError } = await authService.signInWithPassword({
        email: formData.email,
        password: formData.password,
      } as any);
      if (authError) throw authError;
      const profile = await db.getProfile(authData.user.id);
      // Garante que role está presente e correto
      if (!profile?.role) throw new Error('Usuário sem permissão definida. Contate o administrador.');
      onLogin({ ...profile, email: authData.user.email } as User);
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocorreu um erro na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md mx-auto p-4 sm:p-8 flex flex-col gap-8 animate-fade-in my-8">
        <Section>
          <div className="flex flex-col items-center gap-4 mb-4">
            <Image src="/logo-preto.png" alt="Barvo" width={56} height={56} className="object-contain" />
            <h1 className="text-2xl font-black text-brand-dark tracking-tight">Acesse sua conta</h1>
            <p className="text-sm text-brand-midGray font-medium">Bem-vindo! Entre para acessar sua barbearia.</p>
          </div>
          {errorMsg && (
            <EmptyState title="Erro ao autenticar" description={errorMsg} icon={<AlertCircle size={32} className="text-red-500" />} />
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">Email</label>
              <div className="relative">
                <input
                  required
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={e => {
                    setFormData({ ...formData, email: e.target.value });
                    setEmailValidated(validateEmail(e.target.value));
                  }}
                  className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 font-medium text-sm transition-all placeholder:text-slate-400"
                  autoComplete="email"
                  aria-label="Email"
                />
                {emailValidated && <Check className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" size={20} strokeWidth={3} />}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">Senha</label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Sua senha"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 font-medium text-sm transition-all placeholder:text-slate-400"
                  autoComplete="current-password"
                  aria-label="Senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-dark transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <UIButton
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              iconLeft={<LogIn size={18} />}
              disabled={!emailValidated}
              className="mt-2"
            >
              Entrar
            </UIButton>
          </form>
          <div className="flex flex-col gap-2 mt-4">
            <UIButton
              type="button"
              variant="ghost"
              size="md"
              onClick={onGuestContinue}
              className="w-full border-2 border-dashed border-slate-200 text-slate-500 font-black rounded-xl hover:border-brand-accent hover:text-brand-accent transition-all text-xs uppercase tracking-widest"
            >
              Continuar como Convidado
            </UIButton>
            <div className="text-center text-xs text-slate-400 mt-2">
              <a href="#" className="hover:text-brand-accent font-bold transition-colors">Esqueceu a senha?</a>
            </div>
          </div>
          <div className="text-center text-[10px] text-slate-400 mt-4">
            <a href="#" className="hover:text-brand-accent font-bold transition-colors">Termos</a>
            <span className="mx-1">•</span>
            <a href="#" className="hover:text-brand-accent font-bold transition-colors">Privacidade</a>
          </div>
        </Section>
      </div>
    </div>
  );
};
