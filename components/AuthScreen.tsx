import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { MOCK_USERS } from '../constants';
import { Scissors, User as UserIcon, Lock, ChevronRight, Mail, Phone } from 'lucide-react';

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
    
    // Simulating authentication
    if (mode === 'login') {
      const user = MOCK_USERS.find(u => u.email === formData.email && u.password === formData.password);
      if (user) {
        onLogin(user);
      } else {
        alert('Credenciais inválidas! (Tente admin@barber.com / 123 ou cliente@gmail.com / 123)');
      }
    } else {
      // Mock Registration
      const newUser: User = {
        id: `new_${Date.now()}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: activeTab === 'pro' ? UserRole.OWNER : UserRole.CUSTOMER,
        avatar: `https://picsum.photos/seed/${Date.now()}/100/100`
      };
      onLogin(newUser);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[150px] opacity-20 animate-pulse"></div>
          <div className="absolute bottom-[0%] right-[0%] w-[40%] h-[40%] bg-amber-500 rounded-full blur-[120px] opacity-10"></div>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row relative z-10 animate-fade-in">
        
        {/* Left Side: Brand & Info */}
        <div className="md:w-5/12 bg-slate-50 p-8 md:p-12 flex flex-col justify-between border-r border-slate-100 relative overflow-hidden">
            <div className="z-10">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center text-slate-900 shadow-lg">
                        <Scissors size={24} strokeWidth={2.5} /> 
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-slate-900 leading-none">Barber<span className="text-amber-500">Pro</span></span>
                </div>
                
                <h2 className="text-3xl font-bold text-slate-800 mb-4 leading-tight">
                    {activeTab === 'customer' ? 'Agende seu corte em segundos.' : 'Gestão completa para sua barbearia.'}
                </h2>
                <p className="text-slate-500 leading-relaxed">
                    {activeTab === 'customer' 
                        ? 'Entre para acumular pontos, ver histórico e receber lembretes automáticos.' 
                        : 'Controle agenda, financeiro, comissões e muito mais em um só lugar.'}
                </p>
            </div>

            <div className="mt-8 z-10">
                {activeTab === 'customer' && (
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                        <p className="text-amber-800 text-sm font-bold mb-1">Prefere agilizar?</p>
                        <button 
                            onClick={onGuestContinue}
                            className="text-amber-600 text-sm hover:underline flex items-center gap-1 font-semibold"
                        >
                            Agendar sem cadastro <ChevronRight size={14} />
                        </button>
                    </div>
                )}
            </div>

            {/* Pattern */}
            <div className="absolute bottom-0 right-0 opacity-5 pointer-events-none">
                <Scissors size={200} />
            </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-7/12 p-8 md:p-12 bg-white">
            {/* Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-xl mb-8 w-fit">
                <button 
                    onClick={() => { setActiveTab('customer'); setMode('login'); }}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'customer' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Sou Cliente
                </button>
                <button 
                    onClick={() => { setActiveTab('pro'); setMode('login'); }}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'pro' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Sou Profissional
                </button>
            </div>

            <h3 className="text-2xl font-bold text-slate-800 mb-6">
                {mode === 'login' ? 'Acesse sua conta' : 'Crie sua conta grátis'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                    <>
                        <div className="relative group">
                            <UserIcon className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                            <input 
                                type="text" 
                                placeholder="Seu nome completo" 
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-medium"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                required
                            />
                        </div>
                        <div className="relative group">
                            <Phone className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                            <input 
                                type="tel" 
                                placeholder="Seu WhatsApp" 
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-medium"
                                value={formData.phone}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                                required
                            />
                        </div>
                    </>
                )}

                <div className="relative group">
                    <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input 
                        type="email" 
                        placeholder="Seu e-mail" 
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-medium"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        required
                    />
                </div>

                <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input 
                        type="password" 
                        placeholder="Sua senha" 
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-medium"
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                        required
                    />
                </div>

                <div className="pt-2">
                    <button 
                        type="submit"
                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:bg-slate-800 transition-all transform hover:-translate-y-1"
                    >
                        {mode === 'login' ? 'Entrar' : 'Cadastrar'}
                    </button>
                </div>
            </form>

            <div className="mt-6 text-center">
                <p className="text-slate-500 text-sm">
                    {mode === 'login' ? 'Ainda não tem conta? ' : 'Já tem uma conta? '}
                    <button 
                        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                        className="text-blue-600 font-bold hover:underline"
                    >
                        {mode === 'login' ? 'Cadastre-se' : 'Faça Login'}
                    </button>
                </p>
            </div>
            
            {/* Demo Hint */}
            {mode === 'login' && (
                <div className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-400 text-center">
                    <p className="font-semibold mb-1">Dados de Teste (Demo):</p>
                    <p>Admin: admin@barber.com / 123</p>
                    <p>Cliente: cliente@gmail.com / 123</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};