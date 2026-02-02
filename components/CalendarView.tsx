
import React, { useState } from 'react';
import { Appointment, User, Service } from '../types';
import { Clock, Plus, X, Calendar, User as UserIcon, Scissors } from 'lucide-react';

interface CalendarViewProps {
  appointments: Appointment[];
  barbers: User[];
  services: Service[];
  onAddAppointment: (appt: Partial<Appointment>) => boolean;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ appointments, barbers, services, onAddAppointment }) => {
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
      return apt.barberId === barberId && aptTime === time && apt.status !== 'CANCELLED';
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
      const start = new Date();
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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-140px)] animate-fade-in relative">
      
      {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2 animate-fade-in">
              <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center"><Plus size={12} strokeWidth={4} /></div>
              {toastMessage}
          </div>
      )}

      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-20">
        <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-slate-800">Agenda Diária</h2>
        </div>
        
        <button 
          onClick={() => openNewAppointment()}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-lg flex items-center gap-2"
        >
          <Plus size={16} /> Novo Agendamento
        </button>
      </div>
      
      <div className="flex-1 overflow-auto bg-slate-50/50 relative custom-scrollbar">
        <div className="min-w-[700px]">
          <div className="flex border-b border-slate-200 sticky top-0 bg-white/90 backdrop-blur-md z-10 shadow-sm">
            <div className="w-20 p-4 border-r border-slate-100 font-semibold text-slate-400 text-xs uppercase tracking-wider text-center flex items-center justify-center">
                Horário
            </div>
            {barbers.map(barber => (
              <div key={barber.id} className="flex-1 p-3 border-r border-slate-100 flex items-center justify-center gap-3 min-w-[180px]">
                <img src={barber.avatar} alt={barber.name} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"/>
                <div>
                    <span className="block font-bold text-slate-800 text-sm">{barber.name.split(' ')[0]}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="divide-y divide-slate-100 bg-white">
            {timeSlots.map(time => (
              <div key={time} className="flex h-28 group/row">
                <div className="w-20 border-r border-slate-100 flex items-start justify-center pt-3 text-xs font-semibold text-slate-400 bg-slate-50/30 group-hover/row:bg-slate-50 transition-colors">
                  {time}
                </div>

                {barbers.map(barber => {
                  const apt = getAppointmentForSlot(barber.id, time);
                  return (
                    <div key={`${barber.id}-${time}`} className="flex-1 border-r border-slate-50 p-1.5 relative min-w-[180px] group/slot transition-colors hover:bg-slate-50/50">
                      {apt ? (
                        <div className={`
                          w-full h-full rounded-xl p-3 border-l-[6px] shadow-sm flex flex-col justify-center cursor-pointer 
                          transition-all duration-200 hover:shadow-md hover:scale-[1.02] hover:z-10 relative
                          ${apt.status === 'COMPLETED' 
                            ? 'bg-blue-50 border-blue-500 text-blue-900' 
                            : 'bg-emerald-50 border-emerald-500 text-emerald-900'}
                        `}>
                          <p className="font-bold text-sm truncate leading-tight">{apt.customerName}</p>
                          <p className="text-[10px] opacity-70 truncate font-medium uppercase mt-1">
                             {services.find(s => s.id === apt.serviceId)?.name || 'Serviço'}
                          </p>
                        </div>
                      ) : (
                        <div 
                            onClick={() => openNewAppointment(time, barber.id)}
                            className="w-full h-full rounded-xl border-2 border-dashed border-transparent hover:border-slate-200 hover:bg-slate-50 flex items-center justify-center cursor-pointer transition-all duration-200"
                        >
                           <Plus size={20} className="text-slate-300 opacity-0 group-hover/slot:opacity-100" />
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

      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="text-lg font-bold text-slate-800">Novo Agendamento</h3>
                      <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                  </div>
                  <form onSubmit={handleSave} className="p-6 space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cliente</label>
                          <input required type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nome do cliente" value={newApptData.customerName} onChange={e => setNewApptData({...newApptData, customerName: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Barbeiro</label>
                            <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={newApptData.barberId} onChange={e => setNewApptData({...newApptData, barberId: e.target.value})}>
                                {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Horário</label>
                            <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={newApptData.time} onChange={e => setNewApptData({...newApptData, time: e.target.value})}>
                                {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </div>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Serviço</label>
                          <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={newApptData.serviceId} onChange={e => setNewApptData({...newApptData, serviceId: e.target.value})}>
                              {services.map(s => <option key={s.id} value={s.id}>{s.name} - R${s.price}</option>)}
                          </select>
                      </div>
                      <button type="submit" className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg mt-4">Salvar Agendamento</button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};
