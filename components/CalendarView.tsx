import React, { useState } from 'react';
import { Appointment, User } from '../types';
import { Clock, Plus, X, Calendar, User as UserIcon, Scissors } from 'lucide-react';
import { SERVICES } from '../constants';

interface CalendarViewProps {
  appointments: Appointment[];
  barbers: User[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ appointments, barbers }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newApptData, setNewApptData] = useState({ time: '', barberId: '', customerName: '', serviceId: '' });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const timeSlots: string[] = [];
  for (let i = 9; i <= 19; i++) {
    timeSlots.push(`${i.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${i.toString().padStart(2, '0')}:30`);
  }

  const getAppointmentForSlot = (barberId: string, time: string) => {
    return appointments.find(apt => {
      const aptTime = `${apt.startTime.getHours().toString().padStart(2, '0')}:${apt.startTime.getMinutes().toString().padStart(2, '0')}`;
      return apt.barberId === barberId && aptTime === time;
    });
  };

  const openNewAppointment = (time?: string, barberId?: string) => {
      setNewApptData({
          time: time || '09:00',
          barberId: barberId || barbers[0].id,
          customerName: '',
          serviceId: SERVICES[0].id
      });
      setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      // Em um app real, aqui faríamos o POST para a API
      setIsModalOpen(false);
      setToastMessage("Agendamento criado com sucesso!");
      setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-140px)] animate-fade-in relative">
      
      {/* Toast Notification */}
      {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2 animate-fade-in">
              <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center"><Plus size={12} strokeWidth={4} /></div>
              {toastMessage}
          </div>
      )}

      {/* Calendar Toolbar */}
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-20">
        <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-slate-800">Agenda Diária</h2>
            <div className="flex gap-2 text-sm bg-slate-100 p-1 rounded-lg">
                <button className="px-3 py-1 bg-white shadow rounded-md font-medium text-slate-800">Hoje</button>
                <button className="px-3 py-1 hover:bg-white/50 rounded-md font-medium text-slate-500 transition-colors">Amanhã</button>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mr-4">
             <span className="w-2 h-2 rounded-full bg-blue-500"></span> Concluído
             <span className="w-2 h-2 rounded-full bg-emerald-500 ml-2"></span> Confirmado
          </div>
          <button 
            onClick={() => openNewAppointment()}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10 flex items-center gap-2"
          >
            <Plus size={16} /> Novo Agendamento
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto bg-slate-50/50 relative custom-scrollbar">
        <div className="min-w-[700px]">
          {/* Header Row: Barbers (Sticky with Blur) */}
          <div className="flex border-b border-slate-200 sticky top-0 bg-white/90 backdrop-blur-md z-10 shadow-sm">
            <div className="w-20 p-4 border-r border-slate-100 font-semibold text-slate-400 text-xs uppercase tracking-wider text-center flex items-center justify-center">
                Horário
            </div>
            {barbers.map(barber => (
              <div key={barber.id} className="flex-1 p-3 border-r border-slate-100 flex items-center justify-center gap-3 min-w-[180px]">
                <div className="relative">
                    <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 to-purple-500">
                        <img src={barber.avatar} alt={barber.name} className="w-full h-full object-cover rounded-full border-2 border-white"/>
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                    <span className="block font-bold text-slate-800 text-sm">{barber.name}</span>
                    <span className="block text-xs text-slate-400">Barbeiro Pro</span>
                </div>
              </div>
            ))}
          </div>

          {/* Time Slots Grid */}
          <div className="divide-y divide-slate-100 bg-white">
            {timeSlots.map(time => (
              <div key={time} className="flex h-28 group/row">
                {/* Time Column */}
                <div className="w-20 border-r border-slate-100 flex items-start justify-center pt-3 text-xs font-semibold text-slate-400 bg-slate-50/30 group-hover/row:bg-slate-50 transition-colors">
                  {time}
                </div>

                {/* Slots */}
                {barbers.map(barber => {
                  const apt = getAppointmentForSlot(barber.id, time);
                  return (
                    <div key={`${barber.id}-${time}`} className="flex-1 border-r border-slate-50 p-1.5 relative min-w-[180px] group/slot transition-colors hover:bg-slate-50/50">
                      {apt ? (
                        <div className={`
                          w-full h-full rounded-xl p-3 border-l-[6px] shadow-sm flex flex-col justify-center cursor-pointer 
                          transition-all duration-200 hover:shadow-md hover:scale-[1.02] hover:z-10 relative
                          ${apt.status === 'COMPLETED' 
                            ? 'bg-gradient-to-r from-blue-50 to-white border-blue-500/80 text-blue-900' 
                            : 'bg-gradient-to-r from-emerald-50 to-white border-emerald-500/80 text-emerald-900'}
                        `}>
                          <div className="flex justify-between items-start mb-1">
                             <p className="font-bold text-sm truncate pr-2 leading-tight">{apt.customerName}</p>
                             {apt.status === 'CONFIRMED' && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                          </div>
                          <p className="text-xs opacity-70 truncate font-medium mb-1">Corte + Barba</p>
                          <div className="flex items-center gap-1 opacity-60 text-[10px] font-semibold uppercase tracking-wide mt-auto">
                             <Clock size={10} />
                             <span>{time} - {parseInt(time.split(':')[1]) + 30 === 60 ? (parseInt(time.split(':')[0]) + 1) + ":00" : time.split(':')[0] + ":" + (parseInt(time.split(':')[1]) + 30)}</span>
                          </div>
                        </div>
                      ) : (
                        // Empty Slot Interaction
                        <div 
                            onClick={() => openNewAppointment(time, barber.id)}
                            className="w-full h-full rounded-xl border-2 border-dashed border-transparent hover:border-slate-200 hover:bg-slate-50 flex items-center justify-center cursor-pointer group-hover/slot:opacity-100 transition-all duration-200"
                        >
                           <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center opacity-0 group-hover/slot:opacity-100 transform scale-75 group-hover/slot:scale-100 transition-all shadow-sm">
                                <Plus size={20} />
                           </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Appointment Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="text-lg font-bold text-slate-800">Novo Agendamento Manual</h3>
                      <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1 rounded-full transition-colors">
                          <X size={20} />
                      </button>
                  </div>
                  <form onSubmit={handleSave} className="p-6 space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 ml-1">Cliente</label>
                          <div className="relative">
                            <UserIcon size={18} className="absolute left-3 top-3 text-slate-400" />
                            <input 
                                required
                                type="text" 
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                placeholder="Nome do cliente"
                                value={newApptData.customerName}
                                onChange={e => setNewApptData({...newApptData, customerName: e.target.value})}
                            />
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 ml-1">Barbeiro</label>
                            <select 
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                                value={newApptData.barberId}
                                onChange={e => setNewApptData({...newApptData, barberId: e.target.value})}
                            >
                                {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 ml-1">Horário</label>
                            <div className="relative">
                                <Clock size={18} className="absolute left-3 top-3 text-slate-400" />
                                <select 
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                                    value={newApptData.time}
                                    onChange={e => setNewApptData({...newApptData, time: e.target.value})}
                                >
                                    {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 ml-1">Serviço</label>
                          <div className="relative">
                            <Scissors size={18} className="absolute left-3 top-3 text-slate-400" />
                            <select 
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                                value={newApptData.serviceId}
                                onChange={e => setNewApptData({...newApptData, serviceId: e.target.value})}
                            >
                                {SERVICES.map(s => <option key={s.id} value={s.id}>{s.name} - R${s.price}</option>)}
                            </select>
                          </div>
                      </div>

                      <div className="pt-4 flex gap-3">
                          <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                              Cancelar
                          </button>
                          <button type="submit" className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 hover:shadow-lg transition-all">
                              Salvar Agendamento
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

    </div>
  );
};