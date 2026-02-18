
import React, { useState } from 'react';
import { Appointment, User, Service } from '../types';
import { AvatarComponent } from './AvatarComponent';
import { UIButton, Section, EmptyState } from './UIKit';
import { Clock, Plus, X, Calendar as CalendarIcon, User as UserIcon, Scissors, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

interface CalendarViewProps {
  appointments: Appointment[];
  barbers: User[];
  services: Service[];
  onAddAppointment: (appt: Partial<Appointment>) => boolean | Promise<boolean> | void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ appointments, barbers, services, onAddAppointment }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newApptData, setNewApptData] = useState({ time: '', barberId: '', customerName: '', serviceId: '' });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const timeSlots: string[] = [];
  for (let i = 9; i <= 19; i++) {
    timeSlots.push(`${i.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${i.toString().padStart(2, '0')}:30`);
  }

  const getAppointmentForSlot = (barberId: string, time: string) => {
    return appointments.find(apt => {
      const aptDate = new Date(apt.startTime);
      const aptTime = `${aptDate.getHours().toString().padStart(2, '0')}:${aptDate.getMinutes().toString().padStart(2, '0')}`;
      const isSameDay = aptDate.toDateString() === selectedDate.toDateString();
      return apt.barberId === barberId && aptTime === time && apt.status !== 'CANCELLED' && isSameDay;
    });
  };

  const openNewAppointment = (time?: string, barberId?: string) => {
      setNewApptData({
          time: time || '09:00',
          barberId: barberId || barbers[0]?.id || '',
          customerName: '',
          serviceId: services[0]?.id || ''
      });
      setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      
      const [h, m] = newApptData.time.split(':').map(Number);
      const start = new Date(selectedDate);
      start.setHours(h, m, 0, 0);

      onAddAppointment({
          barberId: newApptData.barberId,
          customerName: newApptData.customerName,
          serviceId: newApptData.serviceId,
          startTime: start
      });

      setIsModalOpen(false);
      setToastMessage("Agendamento manual criado!");
      setTimeout(() => setToastMessage(null), 3000);
  };

  const changeDate = (days: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + days);
    setSelectedDate(next);
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[calc(100vh-160px)] animate-fade-in relative">
      
      {toastMessage && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-brand-dark text-white px-6 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-3 animate-fade-in border border-white/10">
              <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white"><Plus size={14} strokeWidth={4} /></div>
              <span className="text-xs font-black uppercase tracking-widest">{toastMessage}</span>
          </div>
      )}

      {/* Header da Agenda Refinado */}
      <Section title="Agenda" className="border-b border-slate-50 bg-white sticky top-0 z-20 px-6 py-5">
        <div className="flex items-center gap-4">
          <UIButton onClick={() => changeDate(-1)} variant="ghost" size="sm" className="p-2"><ChevronLeft size={18}/></UIButton>
          <div className="px-4 flex flex-col items-center min-w-[140px]">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">
              {selectedDate.toLocaleDateString('pt-BR', { weekday: 'short' })}
            </span>
            <span className="text-sm font-black text-brand-dark">
              {selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
            </span>
          </div>
          <UIButton onClick={() => changeDate(1)} variant="ghost" size="sm" className="p-2"><ChevronRight size={18}/></UIButton>
          <UIButton onClick={() => setSelectedDate(new Date())} variant="ghost" size="sm" className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">Hoje</UIButton>
        </div>
        <UIButton onClick={() => openNewAppointment()} variant="primary" size="md" className="w-full md:w-auto flex items-center gap-3 mt-4">
          <Plus size={16} strokeWidth={3} /> Novo Agendamento
        </UIButton>
      </Section>
      
      <div className="flex-1 overflow-auto bg-slate-50/30 relative custom-scrollbar">
        <div className="min-w-[800px]">
          {/* Cabeçalho dos Barbeiros */}
          <div className="flex border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-10 shadow-sm">
            <div className="w-24 p-4 border-r border-slate-50 font-black text-slate-300 text-[10px] uppercase tracking-widest text-center flex items-center justify-center">
                Horário
            </div>
            {barbers.map(barber => (
              <div key={barber.id} className="flex-1 p-4 border-r border-slate-50 flex items-center justify-center gap-4 min-w-[200px]">
                <div className="relative">
                    <AvatarComponent url={barber.avatar} name={barber.name} size="sm" className="w-10 h-10 border-2 border-white shadow-md" />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                    <span className="block font-black text-brand-dark text-sm tracking-tight">{barber.name.split(' ')[0]}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Disponível</span>
                </div>
              </div>
            ))}
          </div>

          <div className="divide-y divide-slate-50 bg-white">
            {timeSlots.map(time => (
              <div key={time} className="flex h-32 group/row">
                <div className="w-24 border-r border-slate-50 flex items-start justify-center pt-4 text-[11px] font-black text-slate-400 bg-slate-50/20 group-hover/row:bg-slate-50 transition-colors">
                  {time}
                </div>

                {barbers.map(barber => {
                  const apt = getAppointmentForSlot(barber.id, time);
                  return (
                    <div key={`${barber.id}-${time}`} className="flex-1 border-r border-slate-50 p-2 relative min-w-[200px] group/slot transition-colors hover:bg-slate-50/30">
                      {apt ? (
                        <div className={`
                          w-full h-full rounded-[1.5rem] p-4 border-l-[6px] shadow-sm flex flex-col justify-center cursor-pointer 
                          transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:z-10 relative group/card
                          ${apt.status === 'COMPLETED' 
                            ? 'bg-slate-50 border-slate-400 text-slate-500 opacity-60' 
                            : 'bg-white border-brand-dark text-brand-dark ring-1 ring-slate-100'}
                        `}>
                          <div className="flex justify-between items-start mb-1">
                             <p className="font-black text-sm tracking-tight truncate leading-tight pr-4">{apt.customerName}</p>
                             {apt.status !== 'COMPLETED' && <CalendarDays size={12} className="text-brand-dark/20" />}
                          </div>
                          <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-2 truncate">
                             {services.find(s => s.id === apt.serviceId)?.name || 'Serviço'}
                          </p>
                          <div className="flex items-center gap-1">
                             <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></div>
                             <span className="text-[8px] font-bold uppercase tracking-widest">{apt.status === 'COMPLETED' ? 'Finalizado' : 'Confirmado'}</span>
                          </div>
                        </div>
                      ) : (
                        <button 
                            onClick={() => openNewAppointment(time, barber.id)}
                            className="w-full h-full rounded-[1.5rem] border-2 border-dashed border-transparent hover:border-slate-200 hover:bg-slate-50 flex items-center justify-center cursor-pointer transition-all duration-300 group/btn"
                        >
                           <div className="bg-slate-100 text-slate-300 p-2 rounded-xl group-hover/btn:bg-brand-dark group-hover/btn:text-white transition-all opacity-0 group-hover/slot:opacity-100 scale-75 group-hover/btn:scale-100">
                             <Plus size={20} strokeWidth={3} />
                           </div>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Novo Agendamento */}
      {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-dark/60 backdrop-blur-md p-4 animate-fade-in">
              <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-slide-in">
                  <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-black text-brand-dark tracking-tighter uppercase italic leading-none">Agendar Manual</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Criação rápida de reserva</p>
                      </div>
                      <button onClick={() => setIsModalOpen(false)} className="p-2.5 bg-white hover:bg-slate-100 rounded-full text-slate-400 transition-all active:scale-90 shadow-sm border border-slate-100"><X size={18}/></button>
                  </div>
                  <form onSubmit={handleSave} className="p-8 space-y-5 bg-white">
                      <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nome do Cliente</label>
                          <div className="relative">
                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input required type="text" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-light font-bold text-sm" placeholder="Ex: Lucas Moura" value={newApptData.customerName} onChange={e => setNewApptData({...newApptData, customerName: e.target.value})} />
                          </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Barbeiro</label>
                            <select className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm appearance-none cursor-pointer" value={newApptData.barberId} onChange={e => setNewApptData({...newApptData, barberId: e.target.value})}>
                                {barbers.map(b => <option key={b.id} value={b.id}>{b.name.split(' ')[0]}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Horário</label>
                            <select className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm appearance-none cursor-pointer" value={newApptData.time} onChange={e => setNewApptData({...newApptData, time: e.target.value})}>
                                {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </div>
                      </div>
                      <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Serviço Principal</label>
                          <div className="relative">
                            <Scissors className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <select className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm appearance-none cursor-pointer" value={newApptData.serviceId} onChange={e => setNewApptData({...newApptData, serviceId: e.target.value})}>
                                {services.map(s => <option key={s.id} value={s.id}>{s.name} - R${s.price}</option>)}
                            </select>
                          </div>
                      </div>
                      <button type="submit" className="w-full py-5 bg-brand-dark text-white font-black rounded-2xl shadow-xl shadow-brand-dark/20 hover:bg-black transition-all mt-4 uppercase text-xs tracking-widest active:scale-95">Confirmar Reserva</button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};
