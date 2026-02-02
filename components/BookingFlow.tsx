
import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_USERS } from '../constants';
import { 
  Scissors, Check, ChevronLeft, ChevronRight, AlertCircle, Clock, 
  Loader2, MessageCircle, CreditCard, Wallet, Copy, Timer, Zap, 
  ArrowRight, Smartphone, CheckCircle 
} from 'lucide-react';
import { User, UserRole, Service, Appointment, ShopSettings, PaymentMethod, BarberAvailabilityException } from '../types';

interface BookingFlowProps {
  currentUser: User | null;
  initialData: {
    serviceIds?: string[];
    barberId?: string;
    customerId?: string;
    customerName?: string;
  } | null;
  services: Service[];
  // Fix: changed from returning boolean to allowing Promise/void for async compatibility
  onBook: (appt: Partial<Appointment>) => boolean | Promise<boolean> | void;
  shopSettings: ShopSettings;
  allAppointments: Appointment[];
  availabilityExceptions: BarberAvailabilityException[];
}

const Toast: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => {
    return (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl animate-fade-in border ${
            type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-white border-red-100 text-red-600'
        }`}>
            {type === 'success' ? <Check size={16} className="text-white" /> : <AlertCircle size={16} />}
            <span className="font-semibold text-xs">{message}</span>
            <button onClick={onClose} className="ml-2 text-sm opacity-70">×</button>
        </div>
    );
};

export const BookingFlow: React.FC<BookingFlowProps> = ({ 
  currentUser, 
  initialData, 
  services, 
  onBook, 
  shopSettings,
  allAppointments,
  availabilityExceptions 
}) => {
  const [step, setStep] = useState(1);
  const [selection, setSelection] = useState({
    serviceIds: [] as string[],
    barberId: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    paymentMethod: 'PRESENTIAL' as PaymentMethod,
    selectedCardId: currentUser?.paymentMethods?.find(m => m.isDefault)?.id || currentUser?.paymentMethods?.[0]?.id || ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [guestInfo, setGuestInfo] = useState({ name: '', phone: '' });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const [pixMode, setPixMode] = useState<'IDLE' | 'GENERATING' | 'DISPLAY'>('IDLE');
  const [pixTimer, setPixTimer] = useState(300);

  useEffect(() => {
      if (initialData) {
          setSelection(prev => ({
              ...prev,
              serviceIds: initialData.serviceIds || [],
              barberId: initialData.barberId || ''
          }));
          if (initialData.customerName) {
              setGuestInfo(prev => ({ ...prev, name: initialData.customerName || '' }));
          }
      }
  }, [initialData]);

  useEffect(() => {
    if (pixMode === 'DISPLAY' && pixTimer > 0) {
      const timer = setInterval(() => setPixTimer(t => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [pixMode, pixTimer]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const barbers = MOCK_USERS.filter(u => u.role === 'BARBER');

  const times = useMemo(() => {
    const slots = [];
    const [startHour] = shopSettings.openingHours.start.split(':').map(Number);
    const [endHour] = shopSettings.openingHours.end.split(':').map(Number);
    for (let h = startHour; h < endHour; h++) {
        slots.push(`${h.toString().padStart(2, '0')}:00`);
        slots.push(`${h.toString().padStart(2, '0')}:30`);
    }
    return slots;
  }, [shopSettings]);

  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        dates.push({
            iso: d.toISOString().split('T')[0],
            label: d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }),
            isToday: i === 0
        });
    }
    return dates;
  }, []);

  const selectedServices = services.filter(s => selection.serviceIds.includes(s.id));
  const totalDuration = selectedServices.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalPrice = selectedServices.reduce((acc, s) => acc + Number(s.price), 0);
  const selectedBarber = barbers.find(b => b.id === selection.barberId);

  const showToast = (message: string, type: 'success' | 'error') => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 4000);
  };

  const toggleService = (id: string) => {
    setSelection(prev => {
        const isSelected = prev.serviceIds.includes(id);
        const newIds = isSelected 
            ? prev.serviceIds.filter(sId => sId !== id)
            : [...prev.serviceIds, id];
        return { ...prev, serviceIds: newIds };
    });
  };

  const isSlotAvailable = (time: string) => {
      if (!selection.barberId || selection.serviceIds.length === 0) return true;
      const [hours, minutes] = time.split(':').map(Number);
      const selectedStart = new Date(selection.date);
      selectedStart.setHours(hours, minutes, 0, 0);
      const selectedEnd = new Date(selectedStart);
      selectedEnd.setMinutes(selectedEnd.getMinutes() + totalDuration);

      // 1. Validação de horário passado
      if (selection.date === new Date().toISOString().split('T')[0]) {
        if (selectedStart < new Date()) return false;
      }

      // 2. Validação de horário de fechamento da loja
      const [endH, endM] = shopSettings.openingHours.end.split(':').map(Number);
      const shopEnd = new Date(selection.date);
      shopEnd.setHours(endH, endM, 0, 0);
      if (selectedEnd > shopEnd) return false;

      // 3. Validação de conflitos com outros agendamentos
      const conflicts = allAppointments.filter(apt => {
          if (apt.barberId !== selection.barberId) return false;
          if (apt.status === 'CANCELLED') return false;
          const aptStart = new Date(apt.startTime);
          const aptService = services.find(s => s.id === apt.serviceId);
          const aptDuration = aptService ? aptService.durationMinutes : 30;
          const aptEnd = new Date(aptStart);
          aptEnd.setMinutes(aptEnd.getMinutes() + aptDuration);
          
          return (selectedStart < aptEnd && selectedEnd > aptStart);
      });
      if (conflicts.length > 0) return false;

      // 4. Validação de bloqueios manuais
      const isBlocked = availabilityExceptions.some(ex => {
          if (ex.barberId !== selection.barberId || ex.date !== selection.date) return false;
          const [exH, exM] = ex.startTime.split(':').map(Number);
          const blockStart = new Date(selection.date);
          blockStart.setHours(exH, exM, 0, 0);
          const blockEnd = new Date(blockStart);
          blockEnd.setMinutes(blockEnd.getMinutes() + 30); 

          return (selectedStart < blockEnd && selectedEnd > blockStart);
      });

      return !isBlocked;
  };

  // Efeito para invalidar o horário caso a duração mude e gere conflito
  useEffect(() => {
    if (selection.time && !isSlotAvailable(selection.time)) {
        setSelection(prev => ({ ...prev, time: '' }));
        if (step > 4) {
            setStep(4);
            showToast('O horário não comporta mais a duração total dos serviços.', 'error');
        }
    }
  }, [selection.serviceIds, totalDuration]);

  const handleNextStep = () => {
      if (step === 4 && selection.time && !isSlotAvailable(selection.time)) {
          showToast('Conflito de agenda. Escolha outro horário.', 'error');
          return;
      }

      if (step === 5 && selection.paymentMethod === 'PIX' && pixMode === 'IDLE') {
        setPixMode('GENERATING');
        setTimeout(() => setPixMode('DISPLAY'), 1500);
        return;
      }
      setIsProcessing(true);
      setTimeout(() => {
          setStep(s => s + 1);
          setIsProcessing(false);
      }, 300);
  };

  const confirmBooking = () => {
      const finalCustomerId = initialData?.customerId || currentUser?.id || 'guest';
      const finalCustomerName = currentUser?.id === finalCustomerId ? currentUser.name : (guestInfo.name || 'Cliente');

      if (finalCustomerId === 'guest' && !guestInfo.name) {
          showToast('Nome do cliente é obrigatório.', 'error');
          return;
      }

      if (!isSlotAvailable(selection.time)) {
          showToast('Este horário acabou de ser ocupado. Por favor, mude o horário.', 'error');
          setStep(4);
          return;
      }

      setIsProcessing(true);
      const [h, m] = selection.time.split(':').map(Number);
      const startTime = new Date(selection.date);
      startTime.setHours(h, m, 0, 0);

      selection.serviceIds.forEach(sId => {
          onBook({
            barberId: selection.barberId,
            serviceId: sId,
            startTime,
            customerName: finalCustomerName,
            customerId: finalCustomerId,
            paymentMethod: selection.paymentMethod,
            paymentStatus: selection.paymentMethod !== 'PRESENTIAL' ? 'PAID' : 'PENDING'
          });
      });

      setTimeout(() => {
          setStep(7);
          setIsProcessing(false);
          showToast('Horário Confirmado!', 'success');
      }, 1000);
  };

  const getWhatsAppLink = () => {
      const finalCustomerName = initialData?.customerName || currentUser?.name || guestInfo.name;
      const servicesNames = selectedServices.map(s => s.name).join(', ');
      const methodLabel = selection.paymentMethod === 'PIX' ? 'Pix (Pago)' : selection.paymentMethod === 'PRESENTIAL' ? 'Pagamento Local' : 'Pago via App';
      
      const [year, month, day] = selection.date.split('-');
      const formattedDate = `${day}/${month}/${year}`;

      const message = `Olá! Sou o ${finalCustomerName}. Acabei de confirmar meu agendamento na Barvo! 💈✂️\n\n✅ *Detalhes:*\n\n✂️ *Serviço:* ${servicesNames}\n💈 *Barbeiro:* ${selectedBarber?.name}\n📅 *Data:* ${formattedDate} às ${selection.time}\n💰 *Status:* ${methodLabel}\n💵 *Total:* R$ ${totalPrice.toFixed(2)}\n\n📌 *Lembrete:* Fique atento! Enviaremos uma confirmação para você no dia anterior ao seu serviço para garantir que seu horário esteja ok. 😉`;
      
      return `https://wa.me/${shopSettings.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className={`max-w-md mx-auto bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden min-h-[550px] flex flex-col transition-all duration-300 relative ${step === 5 ? 'max-w-5xl' : ''}`}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {step !== 5 && step !== 7 && (
          <div className="bg-brand-dark py-8 px-8 text-white text-center relative overflow-hidden">
            <h1 className="text-xl font-black tracking-tighter uppercase italic mb-4">Novo Agendamento</h1>
            <div className="flex justify-center gap-1.5">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div 
                      key={i} 
                      className={`h-1.5 rounded-full transition-all duration-300 ${step >= i ? 'bg-brand-light w-8' : 'bg-white/10 w-2'}`} 
                    />
                ))}
            </div>
          </div>
      )}

      <div className={`p-6 md:p-8 flex-1 flex flex-col relative overflow-hidden ${step === 5 ? 'p-0' : 'bg-slate-50/20'}`}>
        
        {step === 1 && (
            <div className="space-y-4 animate-fade-in flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-black text-brand-dark uppercase tracking-tighter">Serviços</h2>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedServices.length} selecionado</span>
                </div>
                <div className="grid gap-2 pb-24 overflow-y-auto custom-scrollbar">
                    {services.map(service => {
                        const isSelected = selection.serviceIds.includes(service.id);
                        return (
                            <button
                                key={service.id}
                                onClick={() => toggleService(service.id)}
                                className={`w-full text-left p-4 md:p-5 border-2 rounded-2xl transition-all ${isSelected ? 'border-brand-dark bg-white shadow-md ring-4 ring-brand-dark/5' : 'border-slate-100 bg-white'}`}
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isSelected ? 'bg-brand-dark text-white' : 'bg-slate-100 text-slate-400'}`}>
                                            {isSelected ? <Check size={20} strokeWidth={4} /> : <Scissors size={20} />}
                                        </div>
                                        <div>
                                            <span className={`block font-black text-sm md:text-base ${isSelected ? 'text-brand-dark' : 'text-slate-800'}`}>{service.name}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{service.durationMinutes} min</span>
                                        </div>
                                    </div>
                                    <div className={`text-base font-black ${isSelected ? 'text-brand-dark' : 'text-slate-900'}`}>R$ {Number(service.price).toFixed(0)}</div>
                                </div>
                            </button>
                        );
                    })}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5 bg-white/95 backdrop-blur-md border-t border-slate-100 flex items-center justify-between shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Total</span>
                        <span className="text-xl font-black text-brand-dark leading-none">R$ {totalPrice.toFixed(2)}</span>
                    </div>
                    <button onClick={handleNextStep} disabled={selection.serviceIds.length === 0} className="bg-brand-dark text-white px-8 py-3.5 rounded-2xl font-black shadow-2xl disabled:opacity-20 transition-all flex items-center gap-2 text-sm uppercase tracking-widest active:scale-95">
                        Avançar <ChevronRight size={18} strokeWidth={3} />
                    </button>
                </div>
            </div>
        )}

        {step === 2 && (
             <div className="space-y-6 animate-fade-in flex-1">
                <button onClick={() => setStep(1)} className="text-[10px] font-black text-slate-400 flex items-center gap-1 uppercase tracking-widest hover:text-brand-dark"><ChevronLeft size={16}/> Voltar</button>
                <h2 className="text-xl font-black text-brand-dark tracking-tighter">Escolha o Barbeiro</h2>
                <div className="grid grid-cols-2 gap-4">
                    {barbers.map(barber => (
                        <button key={barber.id} onClick={() => { setSelection({...selection, barberId: barber.id}); handleNextStep(); }} className={`p-6 border-2 rounded-[2rem] bg-white transition-all flex flex-col items-center gap-3 active:scale-95 ${selection.barberId === barber.id ? 'border-brand-dark shadow-xl ring-4 ring-brand-dark/5' : 'border-slate-100'}`}>
                            <img src={barber.avatar} className="w-20 h-20 rounded-2xl object-cover shadow-lg border-2 border-white" alt={barber.name} />
                            <span className="font-black text-brand-dark text-sm uppercase tracking-tighter">{barber.name.split(' ')[0]}</span>
                        </button>
                    ))}
                </div>
            </div>
        )}

        {step === 3 && (
            <div className="space-y-6 animate-fade-in flex-1">
                <button onClick={() => setStep(2)} className="text-[10px] font-black text-slate-400 flex items-center gap-1 uppercase tracking-widest"><ChevronLeft size={16}/> Voltar</button>
                <h2 className="text-xl font-black text-brand-dark text-center tracking-tighter">Para quando?</h2>
                <div className="grid grid-cols-4 gap-3">
                    {availableDates.map(date => (
                        <button key={date.iso} onClick={() => { setSelection({...selection, date: date.iso}); handleNextStep(); }} className={`py-5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center active:scale-90 ${selection.date === date.iso ? 'bg-brand-dark border-brand-dark text-white shadow-xl' : 'bg-white border-slate-100 text-slate-600'}`}>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{date.label.split(' ')[0]}</span>
                            <span className="text-2xl font-black tracking-tighter">{date.label.split(' ')[1]}</span>
                        </button>
                    ))}
                </div>
            </div>
        )}

        {step === 4 && (
            <div className="space-y-6 animate-fade-in flex-1">
                 <button onClick={() => setStep(3)} className="text-[10px] font-black text-slate-400 flex items-center gap-1 uppercase tracking-widest"><ChevronLeft size={16}/> Voltar</button>
                 <h2 className="text-xl font-black text-brand-dark text-center tracking-tighter">Qual horário?</h2>
                 <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-center gap-2 mb-2">
                    <Clock size={16} className="text-blue-500" />
                    <p className="text-[10px] font-bold text-blue-700 uppercase">Estimado: {totalDuration} min de atendimento</p>
                 </div>
                 <div className="grid grid-cols-3 gap-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                     {times.map(time => {
                        const available = isSlotAvailable(time);
                        return (
                            <button key={time} disabled={!available} onClick={() => { setSelection({...selection, time}); handleNextStep(); }} className={`py-4 border-2 rounded-xl font-black text-sm tracking-tighter transition-all active:scale-95 ${available ? (selection.time === time ? 'bg-brand-dark border-brand-dark text-white shadow-lg' : 'bg-white border-slate-100 text-slate-700') : 'bg-slate-50 text-slate-200 border-slate-50 cursor-not-allowed opacity-40'}`}>
                                {time}
                            </button>
                        );
                     })}
                 </div>
            </div>
        )}

        {step === 5 && (
            <div className="animate-fade-in flex flex-col md:flex-row min-h-[500px]">
                <div className="flex-1 p-8 md:p-12 bg-white">
                    <button onClick={() => { if (pixMode !== 'IDLE') setPixMode('IDLE'); else setStep(4); }} className="text-slate-400 hover:text-brand-dark mb-8 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest">
                        <ChevronLeft size={16} /> Voltar
                    </button>
                    
                    <div className="max-w-sm mx-auto">
                        <h2 className="text-3xl font-black text-slate-800 mb-8 tracking-tighter">Checkout</h2>
                        
                        {pixMode === 'GENERATING' && (
                             <div className="text-center py-20 animate-pulse">
                                <Loader2 className="animate-spin mx-auto text-emerald-500 mb-4" size={48} />
                                <p className="text-sm font-black text-slate-600 uppercase tracking-widest">Gerando Pix...</p>
                            </div>
                        )}

                        {pixMode === 'DISPLAY' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-emerald-100 flex flex-col items-center">
                                    <div className="bg-white p-4 rounded-[2rem] shadow-2xl mb-4">
                                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=BARVO_BOOKING_PIX" className="w-40 h-40" alt="QR Pix" />
                                    </div>
                                    <div className="flex items-center gap-2 text-emerald-600 font-black mb-2">
                                        <Timer size={20} /> <span className="text-xl">{formatTimer(pixTimer)}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest text-center">Pagamento Instantâneo</p>
                                </div>
                                <button onClick={handleNextStep} className="w-full bg-emerald-600 text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-emerald-500/20 active:scale-95 transition-all">Confirmar Pagamento</button>
                            </div>
                        )}

                        {pixMode === 'IDLE' && (
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Meios de Pagamento</label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {currentUser?.paymentMethods?.map(method => (
                                            <button 
                                                key={method.id} 
                                                onClick={() => setSelection({...selection, paymentMethod: 'CREDIT_CARD', selectedCardId: method.id})} 
                                                className={`p-5 border-2 rounded-2xl transition-all flex items-center gap-4 text-left active:scale-[0.98] ${selection.selectedCardId === method.id ? 'border-brand-dark bg-slate-50 ring-4 ring-brand-dark/5 shadow-md' : 'border-slate-100 bg-white'}`}
                                            >
                                                <div className={`p-2 rounded-lg ${selection.selectedCardId === method.id ? 'bg-brand-dark text-white' : 'bg-slate-50 text-slate-400'}`}>
                                                    <CreditCard size={20} />
                                                </div>
                                                <div className="flex-1"><p className="font-black text-slate-800 text-sm tracking-tight">Cartão Final {method.last4}</p></div>
                                                {selection.selectedCardId === method.id && <Check size={18} className="text-brand-dark" strokeWidth={4} />}
                                            </button>
                                        ))}
                                        <button onClick={() => setSelection({...selection, paymentMethod: 'PIX', selectedCardId: ''})} className={`p-5 border-2 rounded-2xl transition-all flex items-center gap-4 text-left active:scale-[0.98] ${selection.paymentMethod === 'PIX' ? 'border-emerald-600 bg-emerald-50 ring-4 ring-emerald-600/5 shadow-md' : 'border-slate-100 bg-white'}`}>
                                            <div className={`p-2 rounded-lg ${selection.paymentMethod === 'PIX' ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                                                <Zap size={20} />
                                            </div>
                                            <div className="flex-1"><p className="font-black text-slate-800 text-sm tracking-tight">Pix (5% Desconto)</p></div>
                                            {selection.paymentMethod === 'PIX' && <Check size={18} className="text-emerald-600" strokeWidth={4} />}
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pagar Localmente</label>
                                    <button onClick={() => setSelection({...selection, paymentMethod: 'PRESENTIAL', selectedCardId: ''})} className={`w-full p-6 border-2 border-dashed rounded-2xl transition-all flex items-center gap-4 text-left active:scale-[0.98] ${selection.paymentMethod === 'PRESENTIAL' ? 'border-slate-800 bg-slate-50' : 'border-slate-100 bg-white'}`}>
                                        <Wallet size={24} className="text-slate-400" />
                                        <div className="flex-1">
                                            <p className="font-black text-slate-800 text-sm tracking-tight">Pagar na Barbearia</p>
                                        </div>
                                    </button>
                                </div>

                                <button onClick={handleNextStep} className={`w-full mt-4 ${selection.paymentMethod === 'PIX' ? 'bg-emerald-600' : 'bg-brand-dark'} text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3`}>
                                    Revisar Reserva <ArrowRight size={20} strokeWidth={3} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-full md:w-96 bg-slate-50 p-8 md:p-12 border-l border-slate-100 flex flex-col justify-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 text-center md:text-left">Resumo</p>
                    <div className="space-y-4 mb-10">
                        {selectedServices.map(s => (
                            <div key={s.id} className="flex justify-between items-start">
                                <div className="flex-1 pr-4">
                                    <p className="font-black text-slate-800 text-sm tracking-tight leading-tight">{s.name}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{s.durationMinutes} min</p>
                                </div>
                                <span className="font-black text-slate-900 text-sm">R$ {Number(s.price).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="pt-6 border-t-2 border-slate-200/50 flex justify-between items-center">
                        <span className="text-xl font-black text-slate-900 tracking-tighter uppercase">Total</span>
                        <span className="text-3xl font-black text-slate-900 tracking-tighter">R$ {totalPrice.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        )}

        {step === 6 && (
            <div className="space-y-6 animate-fade-in flex-1 flex flex-col">
                <button onClick={() => setStep(5)} className="text-[10px] font-black text-slate-400 flex items-center gap-1 uppercase tracking-widest"><ChevronLeft size={16}/> Voltar</button>
                <h2 className="text-2xl font-black text-brand-dark tracking-tighter">Confirmação</h2>
                
                <div className="bg-white rounded-[2rem] border border-slate-100 p-8 space-y-6 shadow-xl relative overflow-hidden">
                    <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-4">
                        <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Agendamento</span>
                        <span className="font-black text-right pl-4">{selectedServices.map(s => s.name).join(', ')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-4">
                        <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Data e Hora</span>
                        <span className="font-black">{new Date(selection.date).toLocaleDateString('pt-BR')} às {selection.time}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-4">
                        <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Barbeiro</span>
                        <span className="font-black">{selectedBarber?.name}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Pagamento</span>
                        <span className={`font-black uppercase text-[10px] px-3 py-1 rounded-full ${selection.paymentMethod === 'PRESENTIAL' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {selection.paymentMethod === 'PIX' ? 'Pix' : selection.paymentMethod === 'PRESENTIAL' ? 'Presencial' : 'App'}
                        </span>
                    </div>
                </div>

                {(!currentUser || (currentUser.role !== UserRole.CUSTOMER && !initialData?.customerId)) && (
                    <div className="space-y-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Seu Nome</p>
                        <div className="relative">
                            <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input type="text" placeholder="Como quer ser chamado?" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-black" value={guestInfo.name} onChange={e => setGuestInfo({...guestInfo, name: e.target.value})} />
                        </div>
                    </div>
                )}

                <div className="mt-auto pt-8">
                    <button onClick={confirmBooking} disabled={isProcessing} className="w-full bg-brand-dark text-white py-5 rounded-[2rem] font-black text-base uppercase tracking-widest shadow-2xl active:scale-95 flex items-center justify-center gap-3">
                        {isProcessing ? <Loader2 className="animate-spin" size={24} /> : 'Finalizar Agendamento'}
                    </button>
                </div>
            </div>
        )}

        {step === 7 && (
            <div className="text-center space-y-8 animate-fade-in my-auto flex flex-col items-center justify-center flex-1">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-inner">
                    <CheckCircle size={48} strokeWidth={3} className="animate-bounce" />
                </div>
                <div className="px-4">
                    <h2 className="text-3xl font-black text-brand-dark tracking-tighter uppercase italic">Agendado!</h2>
                    <p className="text-slate-500 mt-2 text-sm font-medium max-w-xs mx-auto leading-relaxed">
                        Tudo certo, <b>{currentUser?.name.split(' ')[0] || guestInfo.name.split(' ')[0]}</b>! Seu horário está garantido para dia <b>{new Date(selection.date).toLocaleDateString('pt-BR')}</b> às <b>{selection.time}</b>.
                    </p>
                </div>
                
                <div className="w-full max-w-xs space-y-3">
                    <a 
                      href={getWhatsAppLink()} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-full flex items-center justify-center gap-3 bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-600/20 active:scale-95 transition-all text-xs uppercase tracking-widest"
                    >
                        <MessageCircle size={18} /> Notificar no WhatsApp
                    </a>
                    <button onClick={() => { setStep(1); setPixMode('IDLE'); }} className="text-slate-400 font-bold text-[10px] uppercase tracking-widest pt-2">Fazer outra reserva</button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
