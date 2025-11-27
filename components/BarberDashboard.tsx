import React, { useState } from 'react';
import { User, Appointment } from '../types';
import { SERVICES } from '../constants';
import { Calendar, Clock, Scissors, DollarSign, CheckCircle, User as UserIcon, MapPin, ChevronRight, PlayCircle, StopCircle, RefreshCcw, Trophy } from 'lucide-react';

interface BarberDashboardProps {
  currentUser: User;
  appointments: Appointment[];
  onCompleteAppointment: (id: string) => void;
}

export const BarberDashboard: React.FC<BarberDashboardProps> = ({ currentUser, appointments, onCompleteAppointment }) => {
  // Mock state for "In Progress"
  const [activeAppointmentId, setActiveAppointmentId] = useState<string | null>(null);

  // Filter appointments for this barber
  const myAppointments = appointments.filter(a => a.barberId === currentUser.id);

  // Today's appointments
  const today = new Date();
  const todaysAppointments = myAppointments.filter(a => {
    const d = new Date(a.startTime);
    return d.getDate() === today.getDate() && 
           d.getMonth() === today.getMonth() && 
           d.getFullYear() === today.getFullYear() &&
           a.status !== 'CANCELLED';
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  // Calculate Commissions (Mock 50%)
  const calculateCommission = (appts: Appointment[]) => {
    return appts.reduce((acc, curr) => {
      const service = SERVICES.find(s => s.id === curr.serviceId);
      return acc + ((service?.price || 0) * 0.5); // 50% commission
    }, 0);
  };

  const dailyCommission = calculateCommission(todaysAppointments.filter(a => a.status === 'COMPLETED' || a.status === 'CONFIRMED')); // Including confirmed for projection
  const monthlyCommission = calculateCommission(myAppointments); // Simple mock for total

  const handleStatusChange = (id: string, action: 'start' | 'finish') => {
      if (action === 'start') {
          setActiveAppointmentId(id);
      } else {
          setActiveAppointmentId(null);
          onCompleteAppointment(id);
      }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Painel do Profissional</h2>
            <p className="text-slate-500 mt-1 font-medium">Olá, {currentUser.name.split(' ')[0]}! Vamos fazer arte hoje?</p>
        </div>
        <button 
            className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-all active:scale-95 text-slate-700 font-bold text-sm"
            onClick={() => window.location.reload()}
        >
            <RefreshCcw size={16} className="text-blue-500" />
            Atualizar Agenda
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110" />
            <div className="relative z-10">
                <div className="flex items-center gap-2 text-slate-300 mb-2">
                    <div className="p-1.5 bg-white/10 rounded-lg">
                        <DollarSign size={16} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider">Comissão Hoje (Est.)</span>
                </div>
                <h3 className="text-4xl font-bold tracking-tight">R$ {dailyCommission.toFixed(2)}</h3>
                <div className="flex items-center gap-2 mt-4">
                    <div className="h-1.5 flex-1 bg-slate-700 rounded-full overflow-hidden">
                        <div className="bg-emerald-400 h-full w-3/4 rounded-full"></div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold">{todaysAppointments.length} agendamentos</p>
                </div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
             <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                        <Scissors size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Cortes Hoje</span>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-800">{todaysAppointments.length}</h3>
                </div>
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                    <UserIcon size={24} />
                </div>
             </div>
             <div className="w-full bg-slate-100 h-1.5 rounded-full mt-6 overflow-hidden">
                 <div className="bg-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: `${(todaysAppointments.filter(a => a.status === 'COMPLETED').length / todaysAppointments.length) * 100}%` }}></div>
             </div>
             <p className="text-xs text-slate-400 mt-2 font-medium">{todaysAppointments.filter(a => a.status === 'COMPLETED').length} concluídos de {todaysAppointments.length}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
             <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                        <Calendar size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Total Mês</span>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-800">R$ {monthlyCommission.toFixed(2)}</h3>
                </div>
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
                    <DollarSign size={24} />
                </div>
             </div>
             <p className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg inline-block mt-4 font-bold border border-emerald-100">
                 +15% vs mês passado
             </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timeline / Schedule */}
        <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Clock className="text-blue-600" /> Agenda de Hoje
                </h3>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{todaysAppointments.length} clientes</span>
            </div>
            
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
                {todaysAppointments.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Calendar size={32} className="text-slate-300" />
                        </div>
                        <p className="font-medium">Nenhum agendamento para hoje.</p>
                        <p className="text-sm opacity-70">Aproveite a folga! 😎</p>
                    </div>
                ) : (
                    <div className="p-6 relative">
                        {/* Timeline Vertical Line */}
                        <div className="absolute top-10 bottom-10 left-[4.5rem] w-0.5 bg-slate-100 hidden md:block"></div>

                        <div className="space-y-6">
                            {todaysAppointments.map((appt, index) => {
                                const service = SERVICES.find(s => s.id === appt.serviceId);
                                const isActive = activeAppointmentId === appt.id;
                                const isCompleted = appt.status === 'COMPLETED';
                                const startTime = new Date(appt.startTime);
                                const timeStr = startTime.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});

                                return (
                                    <div key={appt.id} className={`relative transition-all duration-300 ${isActive ? 'scale-[1.02]' : ''}`}>
                                        <div className={`
                                            flex flex-col md:flex-row items-center gap-6 p-5 rounded-2xl border transition-all
                                            ${isActive 
                                                ? 'bg-blue-50/50 border-blue-200 shadow-md ring-1 ring-blue-100' 
                                                : isCompleted 
                                                    ? 'bg-slate-50 border-slate-100 opacity-70' 
                                                    : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm'}
                                        `}>
                                            {/* Time Indicator */}
                                            <div className="flex flex-col items-center gap-1 z-10 min-w-[4rem]">
                                                <span className={`text-lg font-bold ${isActive ? 'text-blue-600' : 'text-slate-700'}`}>{timeStr}</span>
                                                <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${isActive ? 'bg-blue-500 animate-pulse' : isCompleted ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                            </div>

                                            {/* Card Content */}
                                            <div className="flex-1 w-full text-center md:text-left">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    <div>
                                                        <h4 className={`font-bold text-lg ${isActive ? 'text-blue-900' : 'text-slate-800'}`}>{appt.customerName}</h4>
                                                        <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                                                            <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase tracking-wide">{service?.name}</span>
                                                            <span className="text-xs text-slate-400">• {service?.durationMinutes} min</span>
                                                        </div>
                                                    </div>

                                                    {/* Status / Actions */}
                                                    <div className="flex items-center justify-center gap-3">
                                                        {isCompleted ? (
                                                            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                                                                <CheckCircle size={18} /> 
                                                                <span>Concluído</span>
                                                            </div>
                                                        ) : isActive ? (
                                                            <button 
                                                                onClick={() => handleStatusChange(appt.id, 'finish')}
                                                                className="group flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                                                            >
                                                                <CheckCircle size={18} className="group-hover:scale-110 transition-transform" /> 
                                                                Finalizar
                                                            </button>
                                                        ) : (
                                                            <button 
                                                                onClick={() => handleStatusChange(appt.id, 'start')}
                                                                className="group flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95"
                                                            >
                                                                <PlayCircle size={18} className="group-hover:scale-110 transition-transform" /> 
                                                                Atender
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                {isActive && (
                                                    <div className="mt-4 pt-4 border-t border-blue-100 flex items-center justify-between text-sm text-blue-800 animate-fade-in">
                                                        <span className="flex items-center gap-2 font-medium">
                                                            <span className="relative flex h-2 w-2">
                                                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                                              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                                            </span>
                                                            Serviço em andamento...
                                                        </span>
                                                        <span className="font-bold bg-white px-3 py-1 rounded-lg border border-blue-100 shadow-sm">Valor: R$ {service?.price.toFixed(2)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Sidebar / History */}
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800">Histórico Recente</h3>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div className="space-y-6">
                    {myAppointments.filter(a => a.status === 'COMPLETED').slice(0, 5).map(appt => {
                        const service = SERVICES.find(s => s.id === appt.serviceId);
                         return (
                            <div key={appt.id} className="flex gap-4 items-start group cursor-default">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                    <UserIcon size={18} />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{appt.customerName}</p>
                                    <p className="text-xs text-slate-500">{service?.name}</p>
                                    <p className="text-[10px] text-slate-400 mt-1 font-medium">
                                        {new Date(appt.startTime).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                                    + R$ {(service?.price || 0) * 0.5}
                                </span>
                            </div>
                         )
                    })}
                    <button className="w-full py-3.5 border border-slate-200 rounded-xl text-slate-600 text-sm font-bold hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-[0.98]">
                        Ver Relatório Completo
                    </button>
                </div>
            </div>

            <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-6 rounded-3xl shadow-xl shadow-orange-500/20 text-slate-900 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full -mr-12 -mt-12 blur-3xl transition-transform group-hover:scale-110"></div>
                <h4 className="font-bold text-lg mb-2 relative z-10 flex items-center gap-2">
                    <Trophy size={20} className="text-white drop-shadow-md" /> Meta Diária
                </h4>
                <div className="flex items-end gap-2 mb-1 relative z-10">
                    <span className="text-5xl font-black text-white drop-shadow-sm">85%</span>
                    <span className="text-sm font-bold mb-2 text-white/80">atingida</span>
                </div>
                <div className="w-full bg-black/20 h-3 rounded-full mt-3 relative z-10 p-0.5">
                    <div className="bg-white h-full rounded-full shadow-sm" style={{ width: '85%' }}></div>
                </div>
                <p className="text-xs mt-3 font-bold text-white/90 relative z-10 bg-white/20 inline-block px-3 py-1 rounded-lg backdrop-blur-sm">
                    Faltam apenas 2 cortes! 🚀
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};