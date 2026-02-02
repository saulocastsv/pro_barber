
import React, { useState } from 'react';
import { User, Appointment, Service, BarberAvailabilityException } from '../types';
import { Ban, CheckCircle, Clock, Smartphone, CreditCard, RefreshCw, AlertTriangle, Crown, Calendar, Sparkles } from 'lucide-react';

interface BarberDashboardProps {
  currentUser: User;
  appointments: Appointment[];
  commissionRate: number;
  onCompleteAppointment: (id: string) => void;
  onNoShow: (id: string) => void;
  services: Service[];
  exceptions: BarberAvailabilityException[];
  onBlockTime: (barberId: string, date: string, time: string) => void;
}

export const BarberDashboard: React.FC<BarberDashboardProps> = ({ currentUser, appointments, commissionRate, onCompleteAppointment, onNoShow, services, exceptions, onBlockTime }) => {
  const [showAvailability, setShowAvailability] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];

  const myAppointments = appointments.filter(a => a.barberId === currentUser.id);
  const todaysAppointments = myAppointments.filter(a => {
    const d = new Date(a.startTime).toISOString().split('T')[0];
    return d === todayStr && a.status !== 'CANCELLED';
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const calculateCommission = (appts: Appointment[]) => {
    return appts.reduce((acc, curr) => {
      if (curr.status === 'CANCELLED') return acc;
      const service = services.find(s => s.id === curr.serviceId);
      return acc + ((service?.price || 0) * (commissionRate / 100));
    }, 0);
  };

  const earnedToday = calculateCommission(todaysAppointments.filter(a => a.status === 'COMPLETED'));

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 border-b border-slate-100 pb-4">
        <div>
            <div className="flex items-center gap-2 mb-0.5">
                <h2 className="text-xl md:text-2xl font-black text-brand-black tracking-tight">Olá, {currentUser.name.split(' ')[0]}!</h2>
                <div className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                    <Sparkles size={10}/> Pro
                </div>
            </div>
            <p className="text-brand-midGray text-xs font-medium">Bora dar aquele talento nos clientes de hoje? ✂️</p>
        </div>
        <button onClick={() => setShowAvailability(!showAvailability)} className={`w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all active:scale-95 ${showAvailability ? 'bg-brand-dark text-white' : 'bg-white text-slate-700 border border-slate-200'}`}>
            <Ban size={16} /> {showAvailability ? 'Ver Agenda' : 'Bloquear Horário'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-brand-dark p-5 rounded-2xl shadow-md relative overflow-hidden">
            <p className="text-brand-light/60 text-[9px] font-bold uppercase tracking-widest mb-1">Comissão Hoje</p>
            <div className="flex items-baseline gap-1 text-white">
                <span className="font-bold text-sm opacity-40">R$</span>
                <h3 className="text-2xl md:text-3xl font-black tracking-tighter">{earnedToday.toFixed(2)}</h3>
            </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-1">Cortes Hoje</p>
            <h3 className="text-xl md:text-2xl font-black text-brand-black tracking-tighter">{todaysAppointments.length}</h3>
        </div>
        <div className="hidden md:block bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-1">Meta Batida</p>
            <div className="h-1.5 w-full bg-slate-100 rounded-full mt-2"><div className="h-full bg-emerald-500 rounded-full w-[65%]" /></div>
        </div>
      </div>

      {!showAvailability ? (
          <div className="space-y-4">
                <h3 className="text-sm font-bold text-brand-black uppercase tracking-wider flex items-center gap-2 px-1">
                    <Calendar size={18} className="text-brand-dark" /> Próximos Atendimentos
                </h3>

                <div className="grid gap-3">
                    {todaysAppointments.length > 0 ? todaysAppointments.map(appt => {
                        const service = services.find(s => s.id === appt.serviceId);
                        const isCompleted = appt.status === 'COMPLETED';
                        const time = new Date(appt.startTime).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
                        
                        return (
                            <div key={appt.id} className={`bg-white p-3 md:p-4 rounded-xl border transition-all ${isCompleted ? 'opacity-50 grayscale bg-slate-50' : 'hover:shadow-md border-slate-100'}`}>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center font-bold text-sm shadow-inner ${isCompleted ? 'bg-slate-200 text-slate-400' : 'bg-brand-dark text-brand-light'}`}>
                                            <span className="text-[7px] uppercase opacity-50 tracking-tighter">Hora</span>
                                            {time}
                                        </div>
                                        <div className="space-y-0.5">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h4 className="font-bold text-brand-black text-sm md:text-base tracking-tight">{appt.customerName}</h4>
                                                {appt.customerId.startsWith('c') && <Crown size={12} className="text-amber-500 fill-amber-500" />}
                                            </div>
                                            <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                <span>{service?.name}</span>
                                                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                                <span>{service?.durationMinutes} min</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="w-full md:w-auto flex gap-2">
                                        {!isCompleted ? (
                                            <button 
                                                onClick={() => onCompleteAppointment(appt.id)} 
                                                className="flex-1 md:flex-none bg-brand-dark text-white px-5 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-md"
                                            >
                                                Concluir
                                            </button>
                                        ) : (
                                            <div className="flex-1 md:flex-none flex items-center justify-center gap-1.5 text-emerald-600 font-bold bg-emerald-50 px-3 py-2 rounded-lg text-[10px] uppercase border border-emerald-100">
                                                <CheckCircle size={14} /> Feito
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200">
                             <p className="text-slate-400 text-sm font-medium">Sem agendamentos para agora.</p>
                        </div>
                    )}
                </div>
          </div>
      ) : (
          <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm animate-fade-in">
              <h3 className="text-sm font-bold text-brand-black uppercase tracking-wider mb-4 flex items-center gap-2">
                 <Ban size={18} className="text-red-500" /> Bloquear Horários
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'].map(h => {
                      const isBlocked = exceptions.some(ex => ex.barberId === currentUser.id && ex.startTime === h && ex.date === todayStr);
                      return (
                        <button 
                            key={h} 
                            disabled={isBlocked} 
                            onClick={() => onBlockTime(currentUser.id, todayStr, h)} 
                            className={`p-3 border rounded-lg font-bold text-xs active:scale-95 transition-all ${
                                isBlocked 
                                ? 'bg-red-50 text-red-200 border-red-50 cursor-not-allowed' 
                                : 'bg-slate-50 text-slate-600 border-transparent hover:border-brand-dark'
                            }`}
                        >
                            {h}
                        </button>
                      );
                  })}
              </div>
          </div>
      )}
    </div>
  );
};
