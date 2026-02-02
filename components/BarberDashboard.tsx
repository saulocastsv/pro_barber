
import React, { useState } from 'react';
import { User, Appointment, Service, BarberAvailabilityException } from '../types';
import { Ban, CheckCircle, Clock, Smartphone, CreditCard, RefreshCw, AlertTriangle, Crown, Calendar } from 'lucide-react';

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
  const totalMonth = calculateCommission(myAppointments.filter(a => a.status === 'COMPLETED'));

  const handleBlock = (time: string) => {
      onBlockTime(currentUser.id, todayStr, time);
      alert(`Horário ${time} bloqueado com sucesso!`);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-3xl font-bold text-brand-dark tracking-tight">Olá, {currentUser.name.split(' ')[0]}</h2>
            <p className="text-brand-midGray mt-1 font-medium">Veja seus ganhos e agenda do dia.</p>
        </div>
        <button onClick={() => setShowAvailability(!showAvailability)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-sm transition-all shadow-sm ${showAvailability ? 'bg-brand-dark text-white' : 'bg-white text-slate-700'}`}>
            <Ban size={16} /> {showAvailability ? 'Voltar p/ Agenda' : 'Bloquear Horário'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-brand-dark text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
            <p className="text-brand-light/60 text-[10px] font-bold uppercase tracking-widest mb-1">Comissão Hoje</p>
            <h3 className="text-4xl font-bold tracking-tight">R$ {earnedToday.toFixed(2)}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-slate-400 text-[10px] font-bold uppercase mb-1">Acumulado Mês</p>
            <h3 className="text-3xl font-bold text-brand-dark">R$ {totalMonth.toFixed(2)}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-slate-400 text-[10px] font-bold uppercase mb-1">Agenda Hoje</p>
            <h3 className="text-3xl font-bold text-brand-dark">{todaysAppointments.length} Clientes</h3>
        </div>
      </div>

      {!showAvailability ? (
          <div className="space-y-4">
                <h3 className="text-xl font-bold text-brand-dark">Próximos Clientes</h3>
                <div className="grid gap-4">
                    {todaysAppointments.map(appt => {
                        const service = services.find(s => s.id === appt.serviceId);
                        const isCompleted = appt.status === 'COMPLETED';
                        const time = new Date(appt.startTime).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
                        
                        // Determinar Tags
                        const isAssinante = appt.customerId.startsWith('c'); // Mock de assinante para demo
                        const pagoApp = appt.paymentMethod === 'APP';
                        const presencial = appt.paymentMethod === 'PRESENTIAL';

                        return (
                            <div key={appt.id} className={`bg-white p-6 rounded-3xl border transition-all ${isCompleted ? 'opacity-60 bg-slate-50' : 'hover:border-brand-light shadow-sm'}`}>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex items-start gap-5 flex-1">
                                        <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-bold text-lg shadow-inner ${isCompleted ? 'bg-slate-200 text-slate-400' : 'bg-brand-dark text-brand-light'}`}>{time}</div>
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <h4 className="font-bold text-brand-black text-xl">{appt.customerName}</h4>
                                                
                                                {/* TAGS DO CLIENTE */}
                                                {isAssinante && (
                                                    <span className="bg-amber-100 text-amber-700 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-200 uppercase tracking-tighter">
                                                        <Crown size={10} /> Assinante
                                                    </span>
                                                )}
                                                {pagoApp && (
                                                    <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200 uppercase tracking-tighter">
                                                        <Smartphone size={10} /> Pago App
                                                    </span>
                                                )}
                                                {presencial && (
                                                    <span className="bg-blue-100 text-blue-700 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 border border-blue-200 uppercase tracking-tighter">
                                                        <CreditCard size={10} /> Presencial
                                                    </span>
                                                )}
                                                {appt.isRescheduled && (
                                                    <span className="bg-purple-100 text-purple-700 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 border border-purple-200 uppercase tracking-tighter">
                                                        <RefreshCw size={10} /> Reagendado
                                                    </span>
                                                )}
                                                {appt.isLate && (
                                                    <span className="bg-red-100 text-red-700 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 border border-red-200 uppercase tracking-tighter animate-pulse">
                                                        <AlertTriangle size={10} /> Atrasado
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-brand-midGray font-bold uppercase tracking-widest">{service?.name}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-2 w-full md:w-auto">
                                        {!isCompleted && (
                                            <button onClick={() => onCompleteAppointment(appt.id)} className="flex-1 md:flex-none bg-brand-dark text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-md">Finalizar</button>
                                        )}
                                        {isCompleted && (
                                            <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-xl text-xs uppercase"><CheckCircle size={16}/> Concluído</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
          </div>
      ) : (
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm animate-fade-in">
              <h3 className="text-xl font-bold text-brand-dark mb-6">Bloquear Horário de Hoje</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'].map(h => {
                      const isBlocked = exceptions.some(ex => ex.barberId === currentUser.id && ex.startTime === h && ex.date === todayStr);
                      return (
                        <button key={h} disabled={isBlocked} onClick={() => handleBlock(h)} className={`p-4 border rounded-2xl font-bold text-sm transition-all ${isBlocked ? 'bg-red-50 text-red-400 border-red-100 cursor-not-allowed' : 'border-slate-200 text-slate-600 hover:border-red-500 hover:text-red-500'}`}>
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
