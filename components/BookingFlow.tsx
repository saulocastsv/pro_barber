
import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_USERS, MOCK_APPOINTMENTS } from '../constants';
import { Scissors, User as UserIcon, Calendar as CalendarIcon, Check, ChevronLeft, ChevronRight, AlertCircle, Clock, Smartphone, Loader2, MessageCircle, CreditCard, Wallet, Plus, Landmark, ShieldCheck, Globe, Info } from 'lucide-react';
import { User, Service, Appointment, ShopSettings, UserPaymentMethod } from '../types';

interface BookingFlowProps {
  currentUser: User | null;
  initialData: { serviceIds: string[]; barberId: string } | null;
  services: Service[];
  onBook: (appt: Partial<Appointment>) => void;
  shopSettings: ShopSettings;
}

const Toast: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => {
    return (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl animate-fade-in border transition-all duration-300 ${
            type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-900/20' : 'bg-white border-red-100 text-red-600 shadow-red-900/10'
        }`}>
            {type === 'success' ? <Check size={20} className="text-white" /> : <AlertCircle size={20} />}
            <span className="font-medium text-sm md:text-base">{message}</span>
            <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100 p-1">×</button>
        </div>
    );
};

export const BookingFlow: React.FC<BookingFlowProps> = ({ currentUser, initialData, services, onBook, shopSettings }) => {
  const [step, setStep] = useState(1);
  const [selection, setSelection] = useState({
    serviceIds: [] as string[],
    barberId: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    paymentMethod: 'PRESENTIAL' as 'APP' | 'PRESENTIAL',
    selectedCardId: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [guestInfo, setGuestInfo] = useState({ name: '', phone: '' });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
      if (initialData) {
          setSelection(prev => ({
              ...prev,
              serviceIds: initialData.serviceIds,
              barberId: initialData.barberId
          }));
      }
      if (currentUser?.paymentMethods?.length) {
          setSelection(prev => ({ ...prev, selectedCardId: currentUser.paymentMethods?.find(m => m.isDefault)?.id || currentUser.paymentMethods![0].id }));
      }
  }, [initialData, currentUser]);

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

      if (selection.date === new Date().toISOString().split('T')[0]) {
        if (selectedStart < new Date()) return false;
      }

      const conflicts = MOCK_APPOINTMENTS.filter(apt => {
          if (apt.barberId !== selection.barberId) return false;
          if (apt.status === 'CANCELLED') return false;
          const aptStart = new Date(apt.startTime);
          const aptService = services.find(s => s.id === apt.serviceId);
          const aptDuration = aptService ? aptService.durationMinutes : 30;
          const aptEnd = new Date(aptStart);
          aptEnd.setMinutes(aptEnd.getMinutes() + aptDuration);
          return (selectedStart < aptEnd && selectedEnd > aptStart);
      });
      return conflicts.length === 0;
  };

  const handleNextStep = () => {
      setIsProcessing(true);
      setTimeout(() => {
          setStep(s => s + 1);
          setIsProcessing(false);
      }, 400);
  };

  const confirmBooking = () => {
      if (!currentUser && (!guestInfo.name || !guestInfo.phone)) {
          showToast('Por favor, preencha seus dados de contato.', 'error');
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
            customerName: currentUser?.name || guestInfo.name,
            customerId: currentUser?.id || 'guest',
            paymentMethod: selection.paymentMethod,
            paymentStatus: selection.paymentMethod === 'APP' ? 'PAID' : 'PENDING'
          });
      });

      setTimeout(() => {
          setStep(7);
          setIsProcessing(false);
          showToast('Agendamento realizado com sucesso!', 'success');
      }, 1500);
  };

  const getWhatsAppLink = () => {
      const name = currentUser?.name || guestInfo.name;
      const servicesNames = selectedServices.map(s => s.name).join(', ');
      const message = `Olá! Sou o ${name}. Confirmei meu agendamento na Barvo! ✅\n\n✂️ Serviços: ${servicesNames}\n💈 Profissional: ${selectedBarber?.name}\n📅 Data: ${selection.date} às ${selection.time}\n💰 Pagamento: ${selection.paymentMethod === 'APP' ? 'Pago via App' : 'Presencial'}\n\nAté lá!`;
      return `https://wa.me/${shopSettings.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className={`max-w-xl mx-auto bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden min-h-[650px] flex flex-col transition-all duration-500 relative ${step === 5 ? 'max-w-6xl' : ''}`}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {step !== 5 && (
          <div className="bg-brand-dark p-8 text-white text-center shadow-lg z-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-light/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <h1 className="text-2xl font-black mb-4 tracking-tighter uppercase italic">Barvo Reserva</h1>
            <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div 
                      key={i} 
                      className={`h-1.5 rounded-full transition-all duration-500 ease-out ${step >= i ? 'bg-brand-light w-10' : 'bg-white/10 w-4'}`} 
                    />
                ))}
            </div>
          </div>
      )}

      <div className={`p-8 flex-1 flex flex-col relative overflow-hidden ${step === 5 ? 'p-0' : 'bg-slate-50/30'}`}>
        
        {step === 1 && (
            <div className="space-y-6 animate-fade-in flex-1 flex flex-col">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-brand-dark flex items-center gap-2">
                        <Scissors size={22} className="text-brand-light" /> Selecione o que deseja
                    </h2>
                </div>
                <div className="grid gap-3 pb-24 overflow-y-auto custom-scrollbar pr-1">
                    {services.map(service => {
                        const isSelected = selection.serviceIds.includes(service.id);
                        return (
                            <button
                                key={service.id}
                                onClick={() => toggleService(service.id)}
                                className={`w-full text-left p-5 border-2 rounded-[1.5rem] transition-all duration-300 group relative overflow-hidden ${isSelected ? 'border-brand-dark bg-white shadow-xl scale-[1.02]' : 'border-white bg-white/50 hover:border-slate-200'}`}
                            >
                                <div className="flex justify-between items-center relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isSelected ? 'bg-brand-dark text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                                            {isSelected ? <Check size={20} strokeWidth={3} /> : <Plus size={20} />}
                                        </div>
                                        <div>
                                            <span className={`block font-black text-lg ${isSelected ? 'text-brand-dark' : 'text-slate-700'}`}>{service.name}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Clock size={10}/> {service.durationMinutes} min</span>
                                        </div>
                                    </div>
                                    <div className={`text-xl font-black ${isSelected ? 'text-brand-dark' : 'text-slate-900'}`}>R$ {Number(service.price).toFixed(0)}</div>
                                </div>
                            </button>
                        );
                    })}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-white/80 backdrop-blur-md border-t border-slate-100">
                    <div className="flex justify-between items-center">
                        <div className="text-2xl font-black text-brand-dark">R$ {totalPrice.toFixed(2)}</div>
                        <button onClick={handleNextStep} disabled={selection.serviceIds.length === 0} className="bg-brand-dark text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-black disabled:opacity-30 transition-all flex items-center gap-2">
                            Próximo <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        )}

        {step === 2 && (
             <div className="space-y-6 animate-fade-in flex-1">
                <button onClick={() => setStep(1)} className="text-xs font-black text-slate-400 flex items-center gap-1 hover:text-brand-dark transition-colors uppercase tracking-widest mb-2"><ChevronLeft size={14}/> Voltar</button>
                <h2 className="text-xl font-bold text-brand-dark flex items-center gap-2">
                  <UserIcon size={22} className="text-brand-light" /> Com quem quer cortar?
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    {barbers.map(barber => (
                        <button key={barber.id} onClick={() => { setSelection({...selection, barberId: barber.id}); handleNextStep(); }} className={`p-6 border-2 rounded-[2rem] bg-white transition-all duration-300 flex flex-col items-center group ${selection.barberId === barber.id ? 'border-brand-dark shadow-xl scale-[1.05]' : 'border-white hover:border-slate-200'}`}>
                            <div className="relative mb-4">
                                <img src={barber.avatar} className="w-24 h-24 rounded-[1.5rem] object-cover shadow-md group-hover:rotate-3 transition-transform" alt={barber.name} />
                                <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-6 h-6 rounded-full border-4 border-white"></div>
                            </div>
                            <span className="font-black text-brand-dark text-lg">{barber.name.split(' ')[0]}</span>
                        </button>
                    ))}
                </div>
            </div>
        )}

        {step === 3 && (
            <div className="space-y-6 animate-fade-in flex-1">
                <button onClick={() => setStep(2)} className="text-xs font-black text-slate-400 flex items-center gap-1 hover:text-brand-dark transition-colors uppercase tracking-widest mb-2"><ChevronLeft size={14}/> Voltar</button>
                <h2 className="text-xl font-bold text-brand-dark flex items-center gap-2">
                  <CalendarIcon size={22} className="text-brand-light" /> Que dia fica melhor?
                </h2>
                <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                    {availableDates.map(date => (
                        <button key={date.iso} onClick={() => { setSelection({...selection, date: date.iso}); handleNextStep(); }} className={`py-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center ${selection.date === date.iso ? 'bg-brand-dark border-brand-dark text-white shadow-lg' : 'bg-white border-white text-slate-600 hover:border-slate-200'}`}>
                            <span className="text-[10px] font-black uppercase opacity-60">{date.label.split(' ')[0]}</span>
                            <span className="text-xl font-black">{date.label.split(' ')[1]}</span>
                        </button>
                    ))}
                </div>
            </div>
        )}

        {step === 4 && (
            <div className="space-y-6 animate-fade-in flex-1">
                 <button onClick={() => setStep(3)} className="text-xs font-black text-slate-400 flex items-center gap-1 hover:text-brand-dark transition-colors uppercase tracking-widest mb-2"><ChevronLeft size={14}/> Voltar</button>
                 <h2 className="text-xl font-bold text-brand-dark flex items-center gap-2">
                    <Clock size={22} className="text-brand-light" /> Escolha o Horário
                 </h2>
                 <div className="grid grid-cols-3 gap-3">
                     {times.map(time => {
                        const available = isSlotAvailable(time);
                        return (
                            <button key={time} disabled={!available} onClick={() => { setSelection({...selection, time}); handleNextStep(); }} className={`py-4 border-2 rounded-2xl font-black text-lg transition-all ${available ? (selection.time === time ? 'bg-brand-dark border-brand-dark text-white' : 'bg-white border-white text-slate-600 hover:border-slate-200') : 'bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed opacity-50'}`}>
                                {time}
                            </button>
                        );
                     })}
                 </div>
            </div>
        )}

        {/* PASSO 5: CHECKOUT ESTILO STRIPE */}
        {step === 5 && (
            <div className="animate-fade-in flex flex-col md:flex-row min-h-[650px]">
                {/* Lado Esquerdo: Formulário Minimalista */}
                <div className="flex-1 p-10 md:p-16 lg:p-20 bg-white">
                    <button onClick={() => setStep(4)} className="text-slate-400 hover:text-slate-900 transition-all mb-10 flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                        <ChevronLeft size={20} /> Voltar para o horário
                    </button>
                    
                    <div className="max-w-md mx-auto">
                        <div className="flex items-center gap-2 mb-12 text-brand-dark/40 font-bold">
                            <Landmark size={24} /> <span className="tracking-tight">Checkout Seguro Barvo</span>
                        </div>

                        <h2 className="text-3xl font-bold text-slate-800 mb-10 tracking-tight">Como deseja pagar?</h2>
                        
                        <div className="space-y-8">
                            {/* OPÇÃO 1: PAGAR PELO APP (STRIPE LOOK) */}
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                    <Smartphone size={18} className="text-blue-500" /> Cartão ou Pix pelo App
                                </label>
                                
                                <div className={`p-6 border-2 rounded-[2rem] transition-all cursor-pointer group ${selection.paymentMethod === 'APP' ? 'border-brand-dark bg-slate-50 ring-4 ring-brand-dark/5' : 'border-slate-100 hover:border-slate-200'}`} onClick={() => setSelection({...selection, paymentMethod: 'APP'})}>
                                    {currentUser?.paymentMethods?.length ? (
                                        <div className="space-y-4">
                                            {currentUser.paymentMethods.map(pm => (
                                                <div key={pm.id} className="flex items-center gap-4" onClick={(e) => { e.stopPropagation(); setSelection({...selection, paymentMethod: 'APP', selectedCardId: pm.id}); }}>
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selection.selectedCardId === pm.id ? 'bg-brand-dark border-brand-dark' : 'border-slate-300'}`}>
                                                        {selection.selectedCardId === pm.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                                    </div>
                                                    <div className="bg-white p-2 rounded-lg border border-slate-100">
                                                        <img src={`https://img.icons8.com/color/48/${pm.brand}.png`} className="h-6" alt={pm.brand} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <span className="font-bold text-slate-700 text-sm">•••• {pm.last4}</span>
                                                        <span className="text-[10px] text-slate-400 ml-2 uppercase font-bold">Exp: {pm.expiry}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            <button className="text-xs font-black text-blue-600 flex items-center gap-1 hover:underline pt-2">
                                                <Plus size={14} /> Usar outro cartão
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                                <div className="flex items-center px-4 py-3 border-b border-slate-100">
                                                    <input type="text" placeholder="Número do cartão" className="w-full outline-none text-slate-800 text-sm" />
                                                    <div className="flex gap-1">
                                                        <img src="https://img.icons8.com/color/48/visa.png" className="h-5" />
                                                        <img src="https://img.icons8.com/color/48/mastercard.png" className="h-5" />
                                                    </div>
                                                </div>
                                                <div className="flex divide-x divide-slate-100">
                                                    <input type="text" placeholder="MM / AA" className="w-1/2 px-4 py-3 outline-none text-slate-800 text-sm" />
                                                    <input type="text" placeholder="CVC" className="w-1/2 px-4 py-3 outline-none text-slate-800 text-sm" />
                                                </div>
                                            </div>
                                            <input type="text" placeholder="Nome no cartão" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none text-sm uppercase font-bold" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* OPÇÃO 2: PAGAR NA BARBEARIA */}
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                    <CreditCard size={18} className="text-emerald-500" /> Na Barbearia
                                </label>
                                <div className={`p-6 border-2 rounded-[2rem] transition-all cursor-pointer flex items-center justify-between group ${selection.paymentMethod === 'PRESENTIAL' ? 'border-brand-dark bg-slate-50 ring-4 ring-brand-dark/5' : 'border-slate-100 hover:border-slate-200'}`} onClick={() => setSelection({...selection, paymentMethod: 'PRESENTIAL'})}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selection.paymentMethod === 'PRESENTIAL' ? 'bg-brand-dark border-brand-dark' : 'border-slate-300'}`}>
                                            {selection.paymentMethod === 'PRESENTIAL' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                        </div>
                                        <span className="font-bold text-slate-700">Pagar após o serviço</span>
                                    </div>
                                    <Wallet className="text-slate-300 group-hover:text-slate-400" />
                                </div>
                            </div>
                        </div>

                        <button onClick={handleNextStep} className="w-full mt-12 bg-brand-dark text-white py-5 rounded-[1.5rem] font-black text-lg shadow-2xl hover:bg-black transition-all transform active:scale-95 flex items-center justify-center gap-3">
                            Confirmar Agendamento <ArrowRight size={20} />
                        </button>
                        
                        <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest mt-8 flex items-center justify-center gap-2">
                            <ShieldCheck size={14} /> Ambiente Seguro & Criptografado
                        </p>
                    </div>
                </div>

                {/* Lado Direito: Resumo Stripe Style */}
                <div className="w-full md:w-[400px] lg:w-[480px] bg-slate-50 p-10 md:p-16 border-l border-slate-100 flex flex-col justify-center">
                    <div className="max-w-xs mx-auto w-full">
                        <div className="flex items-center gap-3 mb-12">
                            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center">
                                <Scissors className="text-brand-dark" size={24} />
                            </div>
                            <span className="text-xl font-black text-brand-dark tracking-tighter uppercase italic">{shopSettings.shopName}</span>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Serviços Selecionados</p>
                                {selectedServices.map(s => (
                                    <div key={s.id} className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-800">{s.name}</p>
                                            <p className="text-xs text-slate-400">{s.durationMinutes} min • Com {selectedBarber?.name}</p>
                                        </div>
                                        <span className="font-bold text-slate-900">R$ {Number(s.price).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-8 border-t border-slate-200 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 font-medium">Subtotal</span>
                                    <span className="text-slate-700 font-bold">R$ {totalPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 font-medium">Taxas</span>
                                    <span className="text-slate-700 font-bold">R$ 0,00</span>
                                </div>
                                <div className="flex justify-between items-center pt-4">
                                    <span className="text-2xl font-black text-slate-900">Total</span>
                                    <span className="text-3xl font-black text-slate-900">R$ {totalPrice.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="bg-white/50 p-6 rounded-3xl border border-slate-100 mt-10">
                                <div className="flex items-center gap-3 text-slate-600 mb-2">
                                    <CalendarIcon size={18} />
                                    <span className="text-sm font-bold">{new Date(selection.date).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Clock size={18} />
                                    <span className="text-sm font-bold">{selection.time}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {step === 6 && (
            <div className="space-y-6 animate-fade-in flex-1 flex flex-col pb-24 max-w-xl mx-auto w-full pt-10">
                <button onClick={() => setStep(5)} className="text-xs font-black text-slate-400 flex items-center gap-1 hover:text-brand-dark transition-colors uppercase tracking-widest mb-2"><ChevronLeft size={14}/> Voltar para o Checkout</button>
                <h2 className="text-2xl font-bold text-brand-dark flex items-center gap-2">
                    <Check size={28} className="text-emerald-500" /> Último Passo
                </h2>
                
                <p className="text-slate-500 font-medium">Confirme os detalhes finais do seu agendamento na Barvo.</p>

                <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-8 space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Serviços</span>
                        <span className="font-bold text-brand-dark">{selectedServices.map(s => s.name).join(', ')}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Barbeiro</span>
                        <span className="font-bold text-brand-dark">{selectedBarber?.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pagamento</span>
                        <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl ${selection.paymentMethod === 'APP' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                            {selection.paymentMethod === 'APP' ? 'MÉTODO: VIA APLICATIVO' : 'MÉTODO: NA BARBEARIA'}
                        </span>
                    </div>
                </div>

                {!currentUser && (
                    <div className="space-y-4 bg-brand-light/10 p-8 rounded-[2rem] border-2 border-brand-light/20">
                        <div className="flex items-center gap-2 text-brand-dark font-bold text-sm mb-2"><Info size={16}/> Informe seus dados de contato</div>
                        <input type="text" placeholder="Seu Nome Completo" className="w-full px-5 py-4 border-2 border-white rounded-2xl outline-none focus:border-brand-dark transition-all text-sm font-bold" value={guestInfo.name} onChange={e => setGuestInfo({...guestInfo, name: e.target.value})} />
                        <input type="tel" placeholder="WhatsApp" className="w-full px-5 py-4 border-2 border-white rounded-2xl outline-none focus:border-brand-dark transition-all text-sm font-bold" value={guestInfo.phone} onChange={e => setGuestInfo({...guestInfo, phone: e.target.value})} />
                    </div>
                )}

                <div className="pt-10 flex flex-col items-center">
                    <button onClick={confirmBooking} disabled={isProcessing} className="w-full bg-brand-dark text-white py-5 rounded-[1.5rem] font-black text-xl shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3">
                        {isProcessing ? <Loader2 className="animate-spin" size={24} /> : 'Finalizar Agendamento'}
                    </button>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-6">Ao confirmar, você concorda com nossas políticas de cancelamento.</p>
                </div>
            </div>
        )}

        {step === 7 && (
            <div className="text-center space-y-8 animate-fade-in my-auto flex flex-col items-center justify-center flex-1 py-20">
                <div className="w-32 h-32 bg-emerald-100 rounded-[2.5rem] flex items-center justify-center text-emerald-600 shadow-inner rotate-6 animate-bounce">
                    <Check size={64} strokeWidth={4} />
                </div>
                <div>
                    <h2 className="text-4xl font-black text-brand-dark tracking-tighter uppercase italic">Reserva Confirmada!</h2>
                    <p className="text-slate-500 mt-2 font-medium max-w-sm mx-auto leading-relaxed">
                        Tudo certo para o seu atendimento em <b>{new Date(selection.date).toLocaleDateString('pt-BR')}</b> às <b>{selection.time}</b>.
                    </p>
                </div>
                <div className="w-full max-w-xs space-y-4">
                    <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-3 bg-emerald-600 text-white font-black py-5 rounded-[1.5rem] shadow-xl hover:bg-emerald-700 transition-all transform hover:-translate-y-1">
                        <MessageCircle size={24} /> Enviar p/ WhatsApp
                    </a>
                    <button onClick={() => { setStep(1); setSelection({serviceIds: [], barberId: '', time: '', date: new Date().toISOString().split('T')[0], paymentMethod: 'PRESENTIAL', selectedCardId: ''}); }} className="text-slate-400 font-bold hover:text-brand-dark transition-all text-sm uppercase tracking-widest">Agendar outro serviço</button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
