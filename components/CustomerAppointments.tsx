
import React, { useState, useEffect, useRef } from 'react';
import { Appointment, User, Service } from '../types';
import { Clock, Calendar, MapPin, Scissors, RefreshCw, XCircle, AlertTriangle, Plus, Check, FileText, CalendarDays, MoreVertical, Trash2 } from 'lucide-react';
import { MOCK_USERS } from '../constants';

interface CustomerAppointmentsProps {
  currentUser: User;
  appointments: Appointment[];
  onRebook: (appt: Appointment) => void;
  onCancel: (id: string) => void;
  onNavigate: (view: string) => void;
  // Added services to props
  services: Service[];
}

export const CustomerAppointments: React.FC<CustomerAppointmentsProps> = ({ currentUser, appointments, onRebook, onCancel, onNavigate, services }) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [cancelModalId, setCancelModalId] = useState<string | null>(null);
  const [rescheduleModalAppt, setRescheduleModalAppt] = useState<Appointment | null>(null);
  const [detailsModalAppt, setDetailsModalAppt] = useState<Appointment | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // State to track which dropdown menu is open
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId) {
        document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

  const toggleMenu = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setOpenMenuId(openMenuId === id ? null : id);
  };

  const now = new Date();
  
  // Filter appointments for the current user
  const userAppointments = appointments.filter(a => a.customerId === currentUser.id);

  const upcoming = userAppointments.filter(a => 
    new Date(a.startTime) > now && a.status !== 'CANCELLED' && a.status !== 'COMPLETED'
  ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const history = userAppointments.filter(a => 
    new Date(a.startTime) <= now || a.status === 'COMPLETED' || a.status === 'CANCELLED'
  ).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const handleConfirmCancel = () => {
      if (cancelModalId) {
          onCancel(cancelModalId);
          setCancelModalId(null);
          setToastMessage("Agendamento cancelado com sucesso.");
          setTimeout(() => setToastMessage(null), 3000);
      }
  };

  const handleConfirmReschedule = () => {
      if (rescheduleModalAppt) {
          // Logic: Cancel current -> Open Booking with same data
          onCancel(rescheduleModalAppt.id);
          onRebook(rescheduleModalAppt);
          setRescheduleModalAppt(null);
      }
  }

  const getStatusInfo = (appt: Appointment, isHistory: boolean) => {
    if (appt.status === 'CANCELLED') return { label: 'Cancelado', classes: 'bg-red-100 text-red-700' };
    if (appt.status === 'COMPLETED') return { label: 'Concluído', classes: 'bg-emerald-100 text-emerald-700' };
    
    // If it's history but status is CONFIRMED, it implies Missed or Pending Completion
    if (isHistory) return { label: 'Ausente / Pendente', classes: 'bg-amber-100 text-amber-700' };
    
    return { label: 'Confirmado', classes: 'bg-blue-100 text-blue-700' };
  };

  const renderCard = (appt: Appointment, isHistory: boolean) => {
    // Fixed: use services prop instead of constant
    const service = services.find(s => s.id === appt.serviceId);
    const barber = MOCK_USERS.find(u => u.id === appt.barberId);
    const date = new Date(appt.startTime);
    const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const status = getStatusInfo(appt, isHistory);

    return (
        <div key={appt.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col md:flex-row items-center gap-6 transition-all hover:shadow-md group relative">
            {/* Left Border Indicator - Updated to rounded-l-2xl to handle lack of overflow-hidden */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${
                appt.status === 'CANCELLED' ? 'bg-red-400' : 
                appt.status === 'COMPLETED' ? 'bg-emerald-400' : 'bg-blue-400'
            }`}></div>

            {/* Actions Menu Button (Top Right) */}
            <div className="absolute top-4 right-4 z-20">
                <button 
                    onClick={(e) => toggleMenu(e, appt.id)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <MoreVertical size={20} />
                </button>
                
                {openMenuId === appt.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in origin-top-right">
                        <div className="py-1">
                            <button 
                                onClick={() => setDetailsModalAppt(appt)}
                                className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                                <FileText size={16} className="text-slate-400" /> Ver Detalhes
                            </button>
                            
                            {/* Logic for Reschedule/Rebook */}
                            {!isHistory ? (
                                <button 
                                    onClick={() => setRescheduleModalAppt(appt)}
                                    className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                    <CalendarDays size={16} className="text-blue-500" /> Remarcar
                                </button>
                            ) : (
                                <button 
                                    onClick={() => onRebook(appt)}
                                    className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                    <RefreshCw size={16} className="text-blue-500" /> Agendar Novamente
                                </button>
                            )}

                            {/* Logic for Cancel */}
                            {(!isHistory && appt.status !== 'CANCELLED') && (
                                <button 
                                    onClick={() => setCancelModalId(appt.id)}
                                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-50"
                                >
                                    <Trash2 size={16} /> Cancelar
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Date Box */}
            <div className={`
                flex-shrink-0 w-full md:w-24 h-24 rounded-2xl flex flex-col items-center justify-center border transition-colors
                ${isHistory ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-blue-50 border-blue-100 text-blue-600 group-hover:bg-blue-100'}
            `}>
                <span className="text-2xl font-bold">{date.getDate()}</span>
                <span className="text-xs uppercase font-bold">{date.toLocaleDateString('pt-BR', { month: 'short' })}</span>
                <span className="text-sm mt-1">{timeStr}</span>
            </div>

            {/* Info */}
            <div className="flex-1 w-full text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                    <h3 className="text-lg font-bold text-slate-800">{service?.name}</h3>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide ${status.classes}`}>
                        {status.label}
                    </span>
                </div>
                
                <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 md:gap-6 text-sm text-slate-500 mb-4">
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                        <img src={barber?.avatar} className="w-5 h-5 rounded-full object-cover" alt={barber?.name} />
                        <span className="font-medium">{barber?.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock size={14} /> <span>{service?.durationMinutes} min</span>
                    </div>
                </div>

                {/* Main Action Buttons (Optional - keeping the primary one for better UX, hiding secondary) */}
                {!isHistory ? (
                     <div className="flex gap-3 justify-center md:justify-start">
                        <button 
                            onClick={() => setRescheduleModalAppt(appt)}
                            className="px-4 py-2 text-sm font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-lg shadow-slate-900/10"
                        >
                            <CalendarDays size={16} /> Remarcar
                        </button>
                     </div>
                ) : (
                    <div className="flex gap-3 justify-center md:justify-start">
                        <button 
                            onClick={() => onRebook(appt)}
                            className="px-4 py-2 text-sm font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
                        >
                            <RefreshCw size={16} /> Agendar Novamente
                        </button>
                    </div>
                )}
            </div>

            {/* Price */}
            <div className="text-right hidden md:block mr-8">
                <p className="text-xl font-bold text-slate-900">R$ {Number(service?.price || 0).toFixed(2)}</p>
                {isHistory && appt.status === 'COMPLETED' && (
                    <div className="text-xs text-emerald-600 font-bold mt-1 bg-emerald-50 px-2 py-1 rounded-full inline-block">+10 pts</div>
                )}
            </div>
        </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10 relative">
      
      {/* Toast */}
      {toastMessage && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2 animate-fade-in">
              <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center"><Check size={12} strokeWidth={4} /></div>
              {toastMessage}
          </div>
      )}

      {/* Cancel Modal */}
      {cancelModalId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 transform scale-100">
                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <AlertTriangle size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 text-center mb-2">Cancelar Agendamento?</h3>
                  <p className="text-slate-500 text-center text-sm mb-6">
                      Tem certeza? O horário será liberado para outros clientes. Essa ação não pode ser desfeita.
                  </p>
                  <div className="flex gap-3">
                      <button 
                        onClick={() => setCancelModalId(null)}
                        className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                      >
                          Não, Voltar
                      </button>
                      <button 
                        onClick={handleConfirmCancel}
                        className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20"
                      >
                          Sim, Cancelar
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModalAppt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 transform scale-100">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <CalendarDays size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 text-center mb-2">Remarcar Horário</h3>
                  <p className="text-slate-500 text-center text-sm mb-6">
                      Para mudar o horário, precisamos <b>cancelar o agendamento atual</b> e iniciar um novo. Deseja continuar?
                  </p>
                  <div className="flex gap-3">
                      <button 
                        onClick={() => setRescheduleModalAppt(null)}
                        className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                      >
                          Voltar
                      </button>
                      <button 
                        onClick={handleConfirmReschedule}
                        className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg"
                      >
                          Continuar
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Details Modal */}
      {detailsModalAppt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden transform scale-100">
                  <div className="bg-slate-900 p-6 text-white relative">
                      <button onClick={() => setDetailsModalAppt(null)} className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-full transition-colors">
                          <XCircle size={24} />
                      </button>
                      <h3 className="text-xl font-bold">Detalhes do Agendamento</h3>
                      <p className="text-slate-400 text-sm opacity-80">ID: #{detailsModalAppt.id.toUpperCase()}</p>
                  </div>
                  <div className="p-6 space-y-6">
                      {(() => {
                          // Fixed: use services prop instead of constant
                          const service = services.find(s => s.id === detailsModalAppt.serviceId);
                          const barber = MOCK_USERS.find(u => u.id === detailsModalAppt.barberId);
                          const date = new Date(detailsModalAppt.startTime);
                          const status = getStatusInfo(detailsModalAppt, true);
                          
                          return (
                              <>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                        <Scissors size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Serviço</p>
                                        <p className="font-bold text-slate-800 text-lg">{service?.name}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden">
                                        <img src={barber?.avatar} alt={barber?.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Profissional</p>
                                        <p className="font-bold text-slate-800 text-lg">{barber?.name}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                                        <Calendar size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Data e Hora</p>
                                        <p className="font-bold text-slate-800 text-lg">
                                            {date.toLocaleDateString('pt-BR')} às {date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-xl flex justify-between items-center border border-slate-100">
                                    <span className="text-sm font-medium text-slate-500">Status</span>
                                    <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${status.classes}`}>{status.label}</span>
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                    <p className="font-bold text-slate-500">Total</p>
                                    <p className="font-bold text-2xl text-slate-900">R$ {Number(service?.price || 0).toFixed(2)}</p>
                                </div>

                                <button 
                                    onClick={() => { setDetailsModalAppt(null); onRebook(detailsModalAppt); }}
                                    className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                                >
                                    <RefreshCw size={18} /> Agendar Novamente
                                </button>
                              </>
                          );
                      })()}
                  </div>
              </div>
          </div>
      )}

      <div className="flex items-center justify-between">
         <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Meus Agendamentos</h2>
            <p className="text-slate-500 mt-1">Gerencie suas visitas futuras e veja seu histórico.</p>
         </div>
         <button 
            onClick={() => onNavigate('booking')}
            className="hidden md:flex bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-colors items-center gap-2 shadow-lg hover:-translate-y-1"
         >
             <Plus size={18} /> Novo Agendamento
         </button>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('upcoming')}
            className={`pb-3 px-4 text-sm font-bold transition-all relative ${
                activeTab === 'upcoming' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Próximos ({upcoming.length})
            {activeTab === 'upcoming' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-4 text-sm font-bold transition-all relative ${
                activeTab === 'history' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Histórico ({history.length})
            {activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
          </button>
      </div>

      <div className="space-y-4 min-h-[400px]">
          {activeTab === 'upcoming' ? (
              upcoming.length > 0 ? upcoming.map(a => renderCard(a, false)) : (
                  <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                      <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
                      <p className="text-slate-500 font-medium mb-4">Você não tem agendamentos futuros.</p>
                      <button 
                        onClick={() => onNavigate('booking')}
                        className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-colors inline-flex items-center gap-2 shadow-lg hover:-translate-y-1"
                      >
                          <Plus size={18} /> Agendar Agora
                      </button>
                  </div>
              )
          ) : (
            history.length > 0 ? history.map(a => renderCard(a, true)) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                    <Clock size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-medium">Seu histórico está vazio.</p>
                </div>
            )
          )}
      </div>
    </div>
  );
};
