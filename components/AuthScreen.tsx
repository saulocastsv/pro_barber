
import React, { useState } from 'react';
import Image from 'next/image';
import { UserRole, User } from '../types';
import authService from '../services/authService';
import { db } from '../services/databaseService';
import { MOCK_USERS } from '../constants';
import { Lock, Mail, User as UserIcon, Loader2, Store, AlertCircle, Check, Eye, EyeOff } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (user: User) => void;
  onGuestContinue: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onGuestContinue }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [emailValidated, setEmailValidated] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    shopName: '',
    role: UserRole.CUSTOMER
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

      if (mode === 'login') {
        const { data: authData, error: authError } = await authService.signInWithPassword({
          email: formData.email,
          password: formData.password,
        } as any);

        if (authError) throw authError;

        const profile = await db.getProfile(authData.user.id);
        onLogin({ ...profile, email: authData.user.email } as User);
      } else {
        // Cadastro
        const { data: authData, error: authError } = await authService.signUp({
          email: formData.email,
          password: formData.password,
          options: { data: { full_name: formData.name, role: formData.role } }
        } as any);

        if (authError) throw authError;
        if (!authData || !authData.user) throw new Error("Erro ao criar usuário.");

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
          await db.createBarbershop({
            owner_id: authData.user.id,
            name: formData.shopName,
            slug: formData.shopName.toLowerCase().replace(/ /g, '-'),
            opening_hours: { start: '09:00', end: '19:00' },
            working_days: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']
          });
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
    <div className="min-h-screen bg-brand-gray flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        {/* LEFT - IMAGE / TESTIMONIAL */}
        <div className="hidden lg:block lg:w-1/2 relative h-96 bg-brand-dark">
          <Image
            src="/hero_barber.jpg"
            alt="Barvo"
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 0px, 50vw"
          />
          <div className="absolute inset-0 bg-brand-dark/50"></div>
          <div className="absolute top-6 left-6 z-10 flex items-center gap-2 text-white">
            <Image
              src="/logo-branco.png"
              alt="Barvo"
              width={36}
              height={36}
              className="object-contain"
            />
            <span className="font-bold text-xl tracking-tight">Barvo</span>
          </div>

          <div className="absolute bottom-8 left-8 z-10 text-white max-w-sm">
            <p className="text-2xl font-extrabold leading-tight mb-4">"Tudo que meu time e eu precisamos."</p>
            <p className="text-sm opacity-90">Gerente de Barbearia</p>
            <p className="text-xs opacity-80">Sistema completo de gestão</p>
          </div>
        </div>

        {/* RIGHT - FORM */}
        <div className="w-full lg:w-1/2 p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center min-h-screen lg:min-h-auto overflow-y-auto lg:overflow-y-visible">
          <div className="w-full max-w-xs">
            <div className="mb-4 sm:mb-6">
              <div className="flex lg:hidden items-center gap-2 mb-4">
                <Image
                  src="/logo-preto.png"
                  alt="Barvo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
                <span className="font-bold text-lg text-brand-dark">Barvo</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-brand-dark mb-1">Bem-vindo ao Barvo</h2>
              <p className="text-[11px] sm:text-xs text-brand-midGray">Gerencie sua barbearia com inteligência e eficiência.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-5 mb-4 border-b border-brand-light">
              <button 
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                }} 
                className={`pb-3 text-sm font-bold transition-colors ${
                  mode === 'login' 
                    ? 'text-brand-accent border-b-2 border-brand-accent -mb-px' 
                    : 'text-brand-midGray hover:text-brand-dark'
                }`}
              >
                Entrar
              </button>
              <button 
                onClick={() => {
                  setMode('register');
                  setErrorMsg(null);
                }} 
                className={`pb-3 text-sm font-bold transition-colors ${
                  mode === 'register' 
                    ? 'text-brand-accent border-b-2 border-brand-accent -mb-px' 
                    : 'text-brand-midGray hover:text-brand-dark'
                }`}
              >
                Cadastro
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-600 text-xs font-medium">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'register' && (
                <div>
                  <label className="text-[11px] font-bold text-brand-dark uppercase tracking-wider mb-1.5 block">Nome Completo</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-midGray" size={18} />
                    <input
                      required
                      placeholder="João Silva"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-12 pr-4 py-2.5 bg-white border border-brand-light rounded-lg outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent font-medium text-xs transition-all placeholder:text-brand-midGray/50"
                    />
                  </div>
                </div>
              )}

              {mode === 'register' && (
                <div>
                  <label className="text-[11px] font-bold text-brand-dark uppercase tracking-wider mb-1.5 block">Tipo de Conta</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-4 py-2.5 bg-white border border-brand-light rounded-lg outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent font-medium text-xs appearance-none transition-all cursor-pointer text-brand-dark"
                  >
                    <option value={UserRole.CUSTOMER}>Cliente</option>
                    <option value={UserRole.BARBER}>Barbeiro (Equipe)</option>
                    <option value={UserRole.OWNER}>Dono (Criar Barbearia)</option>
                  </select>
                </div>
              )}

              {mode === 'register' && formData.role === UserRole.OWNER && (
                <div>
                  <label className="text-[11px] font-bold text-brand-dark uppercase tracking-wider mb-1.5 block">Nome da Barbearia</label>
                  <div className="relative">
                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-midGray" size={18} />
                    <input
                      required
                      placeholder="Minha Barbearia"
                      value={formData.shopName}
                      onChange={e => setFormData({ ...formData, shopName: e.target.value })}
                      className="w-full pl-12 pr-4 py-2.5 bg-white border border-brand-light rounded-lg outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent font-medium text-xs text-brand-dark transition-all placeholder:text-brand-midGray/50"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-brand-dark uppercase tracking-wider mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-midGray" size={18} />
                  <input
                    required
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={e => {
                      setFormData({ ...formData, email: e.target.value });
                      setEmailValidated(validateEmail(e.target.value));
                    }}
                    className="w-full pl-12 pr-12 py-2.5 bg-white border border-brand-light rounded-lg outline-none focus:ring-2 focus:ring-brand-accent focus:bg-white font-medium text-xs transition-all placeholder:text-brand-midGray/50"
                  />
                  {emailValidated && <Check className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" size={20} strokeWidth={3} />}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-brand-dark uppercase tracking-wider mb-1.5 block">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-midGray" size={18} />
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-12 py-2.5 bg-white border border-brand-light rounded-lg outline-none focus:ring-2 focus:ring-brand-accent focus:bg-white font-medium text-xs transition-all placeholder:text-brand-midGray/50"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-midGray hover:text-brand-dark transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                disabled={loading || (mode === 'register' && !emailValidated)}
                type="submit"
                className="w-full bg-brand-accent hover:bg-blue-600 disabled:bg-brand-light text-white font-bold py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-sm disabled:cursor-not-allowed mt-1"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : null}
                {mode === 'login' ? 'Entrar' : 'Criar Conta'}
              </button>
            </form>

            <div className="flex items-center gap-3 my-3">
              <div className="flex-1 h-px bg-brand-light" />
              <span className="text-[11px] text-brand-midGray font-medium">OU</span>
              <div className="flex-1 h-px bg-brand-light" />
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button className="flex items-center justify-center gap-2 py-2 px-4 border-2 border-brand-light rounded-lg hover:border-brand-accent hover:bg-brand-gray transition-all font-medium text-xs text-brand-dark">
                <img src="/google-icon.svg" alt="Google" className="w-4 h-4" />
                <span>Continuar com Google</span>
              </button>
            </div>

            <div className="mt-3 text-center">
              <span className="text-xs text-brand-midGray">
                {mode === 'login' ? "Não tem uma conta? " : 'Já tem uma conta? '}
                <button
                  onClick={() => {
                    setMode(mode === 'login' ? 'register' : 'login');
                    setErrorMsg(null);
                  }}
                  className="font-bold text-brand-accent hover:text-blue-600 transition-colors"
                >
                  {mode === 'login' ? 'Cadastre-se' : 'Entre'}
                </button>
              </span>
            </div>

            <button 
              onClick={onGuestContinue} 
              className="mt-3 w-full py-2 border-2 border-dashed border-brand-light text-brand-midGray font-bold rounded-lg hover:border-brand-accent hover:text-brand-accent transition-all text-xs"
            >
              Continuar como Convidado
            </button>

            <div className="text-center text-[10px] text-brand-midGray space-y-0.5 mt-3">
              <p>Ao fazer login, você concorda com nossos</p>
              <div className="flex justify-center gap-3">
                <a href="#" className="hover:text-brand-accent transition-colors">Termos de Serviço</a>
                <span>•</span>
                <a href="#" className="hover:text-brand-accent transition-colors">Política de Privacidade</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
