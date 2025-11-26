import React, { useState } from 'react';
import { User, Appointment } from '../types';
import { SERVICES } from '../constants';
import { Calendar, Clock, Scissors, DollarSign, CheckCircle, User as UserIcon, MapPin, ChevronRight, PlayCircle, StopCircle } from 'lucide-react';

interface BarberDashboardProps {
  currentUser: User;
  appointments: Appointment[];
}

export const BarberDashboard: React.FC<BarberDashboardProps> = ({ currentUser, appointments }) => {
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
          // In a real app, update appointment status to COMPLETED here via API
      }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Painel do Profissional</h2>
            <p className="text-slate-500 mt-1">Olá, {currentUser.name.split(' ')[0]}! Vamos fazer arte hoje?</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-bold text-slate-700">Agenda Atualizada</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-transform">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
            <div className="relative z-10">
                <div className="flex items-center gap-2 text-slate-300 mb-1">
                    <DollarSign size={16} />
                    <span className="text-sm font-medium">Comissão Hoje (Est.)</span>
                </div>
                <h3 className="text-3xl font-bold">R$ {dailyCommission.toFixed(2)}</h3>
                <p className="text-xs text-slate-400 mt-2">Baseado em {todaysAppointments.length} agendamentos</p>
            </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:-translate-y-1 transition-transform">
             <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <Scissors size={16} />
                        <span className="text-sm font-medium">Cortes Hoje</span>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-800">{todaysAppointments.length}</h3>
                </div>
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                    <UserIcon size={20} />
                </div>
             </div>
             <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
                 <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(todaysAppointments.filter(a => a.status === 'COMPLETED').length / todaysAppointments.length) * 100}%` }}></div>
             </div>
             <p className="text-xs text-slate-400 mt-2">{todaysAppointments.filter(a => a.status === 'COMPLETED').length} concluídos</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:-translate-y-1 transition-transform">
             <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <Calendar size={16} />
                        <span className="text-sm font-medium">Total Mês</span>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-800">R$ {monthlyCommission.toFixed(2)}</h3>
                </div>
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                    <DollarSign size={20} />
                </div>
             </div>
             <p className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded inline-block mt-4 font-bold">
                 +15% vs mês passado
             </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timeline / Schedule */}
        <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Clock className="text-blue-500" /> Agenda de Hoje
            </h3>
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {todaysAppointments.length === 0 ? (
                    <div className="p-10 text-center text-slate-400">
                        <p>Nenhum agendamento para hoje. Aproveite a folga! 😎</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {todaysAppointments.map((appt, index) => {
                            const service = SERVICES.find(s => s.id === appt.serviceId);
                            const isActive = activeAppointmentId === appt.id;
                            const isCompleted = appt.status === 'COMPLETED';
                            const startTime = new Date(appt.startTime);
                            const timeStr = startTime.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});

                            return (
                                <div key={appt.id} className={`p-6 transition-colors ${isActive ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}>
                                    <div className="flex flex-col md:flex-row items-center gap-4">
                                        {/* Time Pill */}
                                        <div className={`
                                            flex-shrink-0 w-20 py-2 rounded-lg text-center font-bold text-sm border
                                            ${isActive ? 'bg-blue-500 text-white border-blue-500 shadow-md' : 'bg-slate-50 text-slate-600 border-slate-200'}
                                        `}>
                                            {timeStr}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 text-center md:text-left">
                                            <h4 className="font-bold text-slate-800 text-lg">{appt.customerName}</h4>
                                            <p className="text-sm text-slate-500 flex items-center justify-center md:justify-start gap-1">
                                                {service?.name} • {service?.durationMinutes} min
                                            </p>
                                        </div>

                                        {/* Status / Actions */}
                                        <div className="flex items-center gap-3">
                                            {isCompleted ? (
                                                <span className="flex items-center gap-1 text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                                                    <CheckCircle size={16} /> Concluído
                                                </span>
                                            ) : isActive ? (
                                                <button 
                                                    onClick={() => handleStatusChange(appt.id, 'finish')}
                                                    className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20"
                                                >
                                                    <CheckCircle size={18} /> Finalizar
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleStatusChange(appt.id, 'start')}
                                                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-800 transition-colors"
                                                >
                                                    <PlayCircle size={18} /> Atender
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {isActive && (
                                        <div className="mt-4 pt-4 border-t border-blue-100 flex items-center justify-between text-sm text-blue-800 animate-fade-in">
                                            <span className="flex items-center gap-2"><Scissors size={14} /> Serviço em andamento...</span>
                                            <span className="font-bold">Valor: R$ {service?.price}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>

        {/* Sidebar / History */}
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800">Histórico Recente</h3>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="space-y-6">
                    {myAppointments.filter(a => a.status === 'COMPLETED').slice(0, 5).map(appt => {
                        const service = SERVICES.find(s => s.id === appt.serviceId);
                         return (
                            <div key={appt.id} className="flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-400">
                                    <UserIcon size={18} />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-slate-800 text-sm">{appt.customerName}</p>
                                    <p className="text-xs text-slate-500">{service?.name}</p>
                                    <p className="text-[10px] text-slate-400 mt-1">
                                        {new Date(appt.startTime).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                                <span className="text-xs font-bold text-emerald-600">+ R$ {(service?.price || 0) * 0.5}</span>
                            </div>
                         )
                    })}
                    <button className="w-full py-3 border border-slate-200 rounded-xl text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors">
                        Ver Relatório Completo
                    </button>
                </div>
            </div>

            <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-6 rounded-2xl shadow-lg text-slate-900 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                <h4 className="font-bold text-lg mb-2 relative z-10">Meta Diária</h4>
                <div className="flex items-end gap-2 mb-1 relative z-10">
                    <span className="text-4xl font-bold">85%</span>
                    <span className="text-sm font-medium mb-1 opacity-80">atingida</span>
                </div>
                <div className="w-full bg-black/10 h-2 rounded-full mt-2 relative z-10">
                    <div className="bg-slate-900 h-full rounded-full" style={{ width: '85%' }}></div>
                </div>
                <p className="text-xs mt-3 font-medium opacity-80 relative z-10">Faltam apenas 2 cortes para bater a meta!</p>
            </div>
        </div>
      </div>
    </div>
  );
};