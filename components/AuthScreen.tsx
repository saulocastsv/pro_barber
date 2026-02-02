import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { MOCK_USERS } from '../constants';
import { Scissors, Lock, ChevronRight, Mail, User as UserIcon, Zap, Briefcase } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (user: User) => void;
  onGuestContinue: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onGuestContinue }) => {
  const [activeTab, setActiveTab] = useState<'customer' | 'pro'>('customer');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      const user = MOCK_USERS.find(u => u.email === formData.email && u.password === formData.password);
      if (user) onLogin(user);
      else alert('Credenciais inválidas! Use os botões de Acesso Rápido para testar.');
    } else {
      const newUser: User = {
        id: `new_${Date.now()}`,
        name: formData.name || 'Novo Usuário',
        email: formData.email,
        phone: formData.phone,
        role: activeTab === 'pro' ? UserRole.OWNER : UserRole.CUSTOMER,
        avatar: `https://picsum.photos/seed/${Date.now()}/100/100`
      };
      onLogin(newUser);
    }
  };

  const loginAsDemo = (role: 'customer' | 'owner' | 'barber') => {
      let demoUser;
      if (role === 'owner') demoUser = MOCK_USERS.find(u => u.role === UserRole.OWNER);
      else if (role === 'barber') demoUser = MOCK_USERS.find(u => u.role === UserRole.BARBER);
      else demoUser = MOCK_USERS.find(u => u.id === 'u4'); // Cliente Teste
      
      if (demoUser) onLogin(demoUser);
  };

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-brand-light/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[0%] right-[0%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row relative z-10 animate-fade-in border border-white/10">
        
        {/* Lado Esquerdo: Marca e Acesso Rápido */}
        <div className="md:w-5/12 bg-slate-50 p-8 md:p-12 flex flex-col justify-between border-r border-slate-100">
            <div>
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-brand-dark text-brand-light rounded-xl flex items-center justify-center shadow-lg">
                        <Scissors size={24} /> 
                    </div>
                    <span className="text-3xl font-bold tracking-tight text-brand-dark leading-none">Barvo</span>
                </div>
                
                <h2 className="text-2xl font-bold text-brand-black mb-4 leading-tight">
                    Teste a plataforma SaaS.
                </h2>
                <p className="text-brand-midGray leading-relaxed font-medium mb-10">
                    Escolha um dos perfis abaixo para testar cada nível de acesso do sistema.
                </p>

                <div className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Acesso Rápido (Demo)</p>
                    
                    <button 
                        onClick={() => loginAsDemo('owner')}
                        className="w-full flex items-center gap-3 p-4 bg-brand-dark text-white rounded-2xl hover:bg-black transition-all group shadow-md"
                    >
                        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                            <Zap size={20} className="text-brand-light" />
                        </div>
                        <div className="text-left">
                            <span className="block font-bold text-sm">Entrar como Proprietário</span>
                            <span className="text-[9px] text-brand-light/70 uppercase font-bold tracking-wider">Acesso Total + Relatórios</span>
                        </div>
                    </button>

                    <button 
                        onClick={() => loginAsDemo('barber')}
                        className="w-full flex items-center gap-3 p-4 bg-white border border-slate-200 text-brand-dark rounded-2xl hover:bg-slate-50 transition-all group shadow-sm"
                    >
                        <div className="w-10 h-10 bg-brand-light/20 rounded-lg flex items-center justify-center">
                            <Briefcase size={20} className="text-brand-dark" />
                        </div>
                        <div className="text-left">
                            <span className="block font-bold text-sm">Entrar como Barbeiro</span>
                            <span className="text-[9px] text-brand-midGray uppercase font-bold tracking-wider">Ganhos, Agenda e Fila</span>
                        </div>
                    </button>

                    <button 
                        onClick={() => loginAsDemo('customer')}
                        className="w-full flex items-center gap-3 p-4 bg-white border border-slate-200 text-brand-dark rounded-2xl hover:bg-slate-50 transition-all group shadow-sm"
                    >
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                            <UserIcon size={20} className="text-brand-dark" />
                        </div>
                        <div className="text-left">
                            <span className="block font-bold text-sm">Entrar como Cliente</span>
                            <span className="text-[9px] text-brand-midGray uppercase font-bold tracking-wider">Reservar e Comprar</span>
                        </div>
                    </button>
                </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-200">
                <button 
                    onClick={onGuestContinue}
                    className="w-full flex items-center justify-between p-4 bg-white border border-dashed border-slate-300 rounded-2xl hover:border-brand-light transition-all group"
                >
                    <span className="text-slate-500 font-bold text-sm group-hover:text-brand-dark">Visitante (Sem login)</span>
                    <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>

        {/* Lado Direito: Login Convencional */}
        <div className="md:w-7/12 p-8 md:p-12 bg-white flex flex-col justify-center">
            <h3 className="text-2xl font-bold text-brand-black mb-6">
                {mode === 'login' ? 'Acesso com E-mail' : 'Crie sua conta'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                    <div className="relative group">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-midGray group-focus-within:text-brand-dark transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="Nome" 
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-light focus:bg-white outline-none transition-all text-brand-dark placeholder:text-brand-midGray/60"
                            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                )}
                <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-midGray group-focus-within:text-brand-dark transition-colors" size={20} />
                    <input 
                        type="email" 
                        placeholder="E-mail" 
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-light focus:bg-white outline-none transition-all text-brand-dark placeholder:text-brand-midGray/60"
                        value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required
                    />
                </div>
                <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-midGray group-focus-within:text-brand-dark transition-colors" size={20} />
                    <input 
                        type="password" 
                        placeholder="Senha" 
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-light focus:bg-white outline-none transition-all text-brand-dark placeholder:text-brand-midGray/60"
                        value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required
                    />
                </div>

                <button 
                    type="submit"
                    className="w-full bg-brand-dark text-white font-bold py-4 rounded-2xl shadow-xl hover:bg-brand-black transition-all transform hover:-translate-y-0.5 active:scale-95"
                >
                    {mode === 'login' ? 'Entrar' : 'Cadastrar'}
                </button>
            </form>

            <div className="mt-8 text-center">
                <p className="text-brand-midGray text-sm font-medium">
                    {mode === 'login' ? 'Novo por aqui? ' : 'Já tem conta? '}
                    <button 
                        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                        className="text-brand-dark font-bold hover:underline ml-1"
                    >
                        {mode === 'login' ? 'Criar conta' : 'Fazer Login'}
                    </button>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};