
import React from 'react';
import { User, Appointment, MembershipPlan } from '../types';
import { SERVICES, LOYALTY_RULES } from '../constants';
import { Gift, Star, Calendar, ShoppingBag, ArrowRight, CheckCircle2, Trophy, Zap, Scissors, Crown } from 'lucide-react';

interface CustomerDashboardProps {
  currentUser: User;
  appointments: Appointment[];
  onNavigate: (view: string) => void;
  membershipPlans: MembershipPlan[];
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ currentUser, appointments, onNavigate, membershipPlans }) => {
  const points = currentUser.points || 0;
  
  const rewards = [
    { id: 'r1', name: '50% de Desconto na Barba', pts: 150, icon: <Star className="text-amber-500" /> },
    { id: 'r2', name: 'Pomada Barvo Matte', pts: 200, icon: <ShoppingBag className="text-blue-500" /> },
    { id: 'r3', name: 'Corte de Cabelo Grátis', pts: 350, icon: <Trophy className="text-emerald-500" /> },
  ];

  const nextReward = rewards.find(r => r.pts > points) || rewards[rewards.length - 1];
  const progress = Math.min((points / nextReward.pts) * 100, 100);
  
  const upcomingAppt = appointments
    .filter(a => a.customerId === currentUser.id && a.status === 'CONFIRMED' && new Date(a.startTime) > new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];

  const discountValue = points / LOYALTY_RULES.DISCOUNT_CONVERSION_RATE;

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-brand-dark tracking-tight">Olá, {currentUser.name.split(' ')[0]}! 👋</h2>
          <p className="text-brand-midGray mt-1 font-medium">Bem-vindo de volta à sua barbearia favorita.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-brand-dark text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-light/10 rounded-full blur-[80px] -mr-20 -mt-20 transition-transform group-hover:scale-110"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <p className="text-brand-light/60 text-xs font-bold uppercase tracking-widest mb-2">Seu Saldo Fidelidade</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-6xl font-black tracking-tighter">{points}</h3>
                    <span className="text-xl font-bold text-brand-light">pts</span>
                  </div>
                </div>
                <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md border border-white/10">
                  <Gift size={32} className="text-brand-light" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end text-sm">
                  <span className="font-bold text-brand-light/80">Progresso para: <span className="text-white">{nextReward.name}</span></span>
                  <span className="font-black">{points}/{nextReward.pts}</span>
                </div>
                <div className="h-4 bg-white/10 rounded-full p-1 border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-brand-light to-white rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(184,208,217,0.5)]" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
               <h4 className="text-xl font-bold text-brand-dark flex items-center gap-2">
                  <Crown size={22} className="text-amber-500 fill-amber-500" /> Barvo Club
               </h4>
               <span className="text-[10px] font-black bg-amber-100 text-amber-700 px-3 py-1 rounded-full uppercase tracking-widest">Premium</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {membershipPlans.map(plan => (
                  <div key={plan.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-20 h-20 bg-brand-light/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
                     <div className="relative z-10">
                        <h5 className="font-black text-brand-dark text-lg leading-tight mb-1">{plan.name}</h5>
                        <p className="text-xs text-slate-400 font-bold mb-4 uppercase">{plan.servicesPerMonth === 0 ? 'Ilimitado' : `${plan.servicesPerMonth}x serviços /mês`}</p>
                        <div className="flex items-baseline gap-1 mb-6">
                           <span className="text-xs font-bold text-slate-400">R$</span>
                           <span className="text-3xl font-black text-brand-dark">{plan.price.toFixed(2)}</span>
                        </div>
                        <button className="w-full py-3 bg-brand-dark text-white rounded-xl text-xs font-bold hover:bg-black transition-all">Assinar Clube</button>
                     </div>
                  </div>
               ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h4 className="font-bold text-brand-dark mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-blue-500" /> Próximo Corte
            </h4>
            {upcomingAppt ? (
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Scissors size={20} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="font-bold text-brand-dark text-sm leading-tight">
                      {SERVICES.find(s => s.id === upcomingAppt.serviceId)?.name}
                    </p>
                    <p className="text-xs text-brand-midGray font-medium mt-1">
                      {new Date(upcomingAppt.startTime).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })} às {new Date(upcomingAppt.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <button onClick={() => onNavigate('appointments')} className="w-full py-3 bg-slate-100 text-slate-600 rounded-2xl text-xs font-bold hover:bg-slate-200 transition-all">Ver detalhes</button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-slate-400 font-medium mb-4">Você não tem agendamentos futuros.</p>
                <button onClick={() => onNavigate('booking')} className="w-full py-3 bg-brand-dark text-white rounded-2xl text-xs font-bold hover:bg-black transition-all shadow-lg shadow-brand-dark/20">Agendar Agora</button>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
            <CheckCircle2 size={80} className="absolute -bottom-6 -right-6 text-white/10 transform -rotate-12" />
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Desconto Acumulado</p>
            <h4 className="text-3xl font-black mb-4">R$ {discountValue.toFixed(2)}</h4>
            <p className="text-xs font-medium leading-relaxed opacity-90 mb-6">
              Você pode usar esse valor como desconto em qualquer serviço ou produto da nossa loja.
            </p>
            <button onClick={() => onNavigate('shop')} className="w-full py-3 bg-white text-emerald-700 rounded-2xl text-xs font-bold hover:bg-emerald-50 transition-all flex items-center justify-center gap-2">
              Ir para a Loja <ShoppingBag size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
