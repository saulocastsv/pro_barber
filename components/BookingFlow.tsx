import React, { useState, useEffect } from 'react';
import { SERVICES, MOCK_USERS, MOCK_APPOINTMENTS } from '../constants';
import { Scissors, User as UserIcon, Calendar, Check, ChevronLeft, ChevronRight, AlertCircle, Clock, Smartphone, Loader2, MessageCircle, ExternalLink } from 'lucide-react';
import { User } from '../types';

interface BookingFlowProps {
  currentUser: User | null; // Can be null if Guest
  initialData?: {
      serviceIds: string[];
      barberId: string;
  } | null;
}

// Toast Component Local
const Toast: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => {
    return (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl animate-fade-in border ${
            type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-white border-red-100 text-red-600'
        }`}>
            {type === 'success' ? <Check size={20} className="text-white" /> : <AlertCircle size={20} />}
            <span className="font-medium">{message}</span>
            <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><span className="sr-only">Fechar</span>×</button>
        </div>
    );
};

export const BookingFlow: React.FC<BookingFlowProps> = ({ currentUser, initialData }) => {
  const [step, setStep] = useState(1);
  const [selection, setSelection] = useState({
    serviceIds: [] as string[],
    barberId: '',
    time: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Effect to load initial data (Rebook)
  useEffect(() => {
      if (initialData) {
          setSelection(prev => ({
              ...prev,
              serviceIds: initialData.serviceIds,
              barberId: initialData.barberId
          }));
      }
  }, [initialData]);

  // Guest Info State
  const [guestInfo, setGuestInfo] = useState({ name: '', phone: '' });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const barbers = MOCK_USERS.filter(u => u.role === 'BARBER');
  const times = ['09:00', '10:00', '10:30', '11:00', '13:00', '14:00', '14:30', '16:00', '17:30'];

  const selectedServices = SERVICES.filter(s => selection.serviceIds.includes(s.id));
  const totalDuration = selectedServices.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalPrice = selectedServices.reduce((acc, s) => acc + s.price, 0);
  const selectedBarber = barbers.find(b => b.id === selection.barberId);

  const showToast = (message: string, type: 'success' | 'error') => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3000);
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
      
      const duration = totalDuration || 30;
      const [hours, minutes] = time.split(':').map(Number);
      
      // Assume "Today" for booking context
      const today = new Date();
      
      const selectedStart = new Date(today);
      selectedStart.setHours(hours, minutes, 0, 0);
      
      const selectedEnd = new Date(selectedStart);
      selectedEnd.setMinutes(selectedEnd.getMinutes() + duration);

      const conflicts = MOCK_APPOINTMENTS.filter(apt => {
          if (apt.barberId !== selection.barberId) return false;
          if (apt.status === 'CANCELLED') return false;

          const aptDate = new Date(apt.startTime);
          // Only check appointments for "today"
          const isSameDay = aptDate.getDate() === today.getDate() && 
                            aptDate.getMonth() === today.getMonth() && 
                            aptDate.getFullYear() === today.getFullYear();

          if (!isSameDay) return false;

          const aptStart = new Date(apt.startTime);
          const aptService = SERVICES.find(s => s.id === apt.serviceId);
          const aptDuration = aptService ? aptService.durationMinutes : 30;
          
          const aptEnd = new Date(aptStart);
          aptEnd.setMinutes(aptEnd.getMinutes() + aptDuration);

          // Check overlap: (StartA < EndB) and (EndA > StartB)
          return (selectedStart < aptEnd && selectedEnd > aptStart);
      });
      
      return conflicts.length === 0;
  };

  const handleTimeSelection = (time: string) => {
      const available = isSlotAvailable(time);
      
      if (available) {
          setSelection({...selection, time});
          handleNextStep(); 
      } else {
          // Calculate end time to give better feedback
          const [h, m] = time.split(':').map(Number);
          const endDate = new Date();
          endDate.setHours(h, m + totalDuration);
          const endTime = endDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

          showToast(`Indisponível! O serviço terminaria às ${endTime} e conflita com outro cliente.`, 'error');
      }
  };

  // Generate WhatsApp Link for manual sending/testing
  const getWhatsAppLink = () => {
      const name = currentUser?.name || guestInfo.name;
      const servicesNames = selectedServices.map(s => s.name).join(', ');
      
      const message = `Olá ${name}! 👋\n\nSeu agendamento na BarberPro está confirmado! ✅\n\n✂️ Serviços: ${servicesNames}\n💈 Profissional: ${selectedBarber?.name}\n📅 Data: Hoje, ${selection.time}\n📍 Local: Rua da Barbearia, 123\n\n🔔 Lembrete: Enviaremos um alerta um dia antes do seu próximo corte.\n\nAté lá!`;
      
      return `https://wa.me/?text=${encodeURIComponent(message)}`;
  };

  const confirmBooking = () => {
      if (!currentUser && (!guestInfo.name || !guestInfo.phone)) {
          showToast('Por favor, preencha seus dados de contato.', 'error');
          return;
      }
      
      setIsProcessing(true);

      // Simulate API call delay & WhatsApp Sending
      setTimeout(() => {
          // Advance to success step
          setStep(5);
          setIsProcessing(false);

          // Trigger success toast
          setTimeout(() => {
            showToast('Agendamento realizado com sucesso!', 'success');
          }, 400);
      }, 1500);
  };

  const handleNextStep = () => {
      setIsProcessing(true);
      setTimeout(() => {
          setStep(s => s + 1);
          setIsProcessing(false);
      }, 500); // Subtle transition delay
  };

  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden min-h-[600px] flex flex-col transition-all duration-500 relative">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Progress Header */}
      <div className="bg-slate-900 p-6 text-white text-center shadow-md z-10">
        <h1 className="text-xl font-bold mb-3 tracking-tight">BarberPro Agendamento</h1>
        <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map(i => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-500 ease-out ${step >= i ? 'bg-amber-400 w-8' : 'bg-slate-700 w-4'}`} 
                />
            ))}
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col relative overflow-hidden">
        {step === 1 && (
            <div key="step1" className="space-y-5 animate-fade-in flex-1 flex flex-col">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Scissors size={20} /></div>
                  Escolha os Serviços
                </h2>
                
                <div className="grid gap-4 pb-20">
                    {SERVICES.map(service => {
                        const isSelected = selection.serviceIds.includes(service.id);
                        return (
                            <button
                                key={service.id}
                                onClick={() => toggleService(service.id)}
                                className={`
                                  w-full text-left p-5 border rounded-xl cursor-pointer bg-white relative overflow-hidden group
                                  transition-all duration-300 ease-out outline-none select-none
                                  hover:shadow-lg hover:border-blue-400 
                                  transform hover:scale-[1.02]
                                  ${isSelected ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50/50' : 'border-slate-200'}
                                `}
                            >
                                <div className="flex justify-between items-center relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-slate-300 bg-white'}`}>
                                            {isSelected && <Check size={14} className="text-white" />}
                                        </div>
                                        <span className={`font-bold text-lg transition-colors ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>{service.name}</span>
                                    </div>
                                    <span className="font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">R$ {service.price}</span>
                                </div>
                                <div className="flex items-center gap-1 mt-3 ml-9 text-xs font-semibold text-slate-400">
                                    <Clock size={12} /> {service.durationMinutes} min
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide font-bold">Total Estimado</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-slate-900">R$ {totalPrice}</span>
                                <span className="text-sm text-slate-500">({totalDuration} min)</span>
                            </div>
                        </div>
                        <button 
                            onClick={handleNextStep}
                            disabled={selection.serviceIds.length === 0 || isProcessing}
                            className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all hover:-translate-y-1 min-w-[150px] justify-center"
                        >
                            {isProcessing ? (
                                <span className="flex items-center gap-2 animate-pulse text-white/90">
                                    <Loader2 size={18} className="animate-spin" /> Processando
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Continuar <ChevronRight size={18} />
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {step === 2 && (
             <div key="step2" className="space-y-5 animate-fade-in flex-1">
                <button onClick={prevStep} className="text-sm text-slate-400 flex items-center gap-1 hover:text-slate-700 transition-colors font-medium mb-2 group">
                  <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> Voltar
                </button>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><UserIcon size={20} /></div>
                  Escolha o Profissional
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    {barbers.map(barber => {
                        const isSelected = selection.barberId === barber.id;
                        return (
                            <button 
                                key={barber.id}
                                onClick={() => { setSelection({...selection, barberId: barber.id}); handleNextStep(); }}
                                disabled={isProcessing}
                                className={`
                                  relative p-6 border rounded-xl cursor-pointer bg-white outline-none flex flex-col items-center text-center group transition-all duration-300 ease-out 
                                  hover:shadow-xl hover:scale-[1.02] hover:border-blue-300
                                  ${isSelected ? 'border-blue-500 ring-2 ring-blue-100 scale-[1.02] bg-blue-50/30' : 'border-slate-200'}
                                  ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                            >
                                {isProcessing && isSelected && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10 rounded-xl">
                                        <Loader2 className="animate-spin text-blue-600" size={32} />
                                    </div>
                                )}
                                <img src={barber.avatar} className="w-20 h-20 rounded-full group-hover:ring-4 ring-blue-100 transition-all duration-300 object-cover shadow-sm mb-3" alt={barber.name} />
                                <span className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">{barber.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        )}

        {step === 3 && (
            <div key="step3" className="space-y-5 animate-fade-in flex-1">
                 <button onClick={prevStep} className="text-sm text-slate-400 flex items-center gap-1 hover:text-slate-700 transition-colors font-medium mb-2 group">
                  <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> Voltar
                 </button>
                 <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Calendar size={20} /></div>
                        Escolha o Horário
                    </h2>
                 </div>
                 <p className="text-sm text-slate-500 -mt-2">Duração total: <span className="font-bold">{totalDuration} min</span></p>
                 
                 <div className="grid grid-cols-3 gap-3 mt-2">
                     {times.map(time => {
                         const available = isSlotAvailable(time);
                         const isSelected = selection.time === time;
                         return (
                            <button
                                key={time}
                                onClick={() => handleTimeSelection(time)}
                                disabled={!available || isProcessing}
                                className={`
                                py-4 border rounded-xl font-semibold text-base transition-all duration-200 outline-none relative overflow-hidden
                                ${!available 
                                    ? 'bg-slate-50 text-slate-300 border-slate-100 opacity-60 cursor-pointer hover:bg-slate-100' 
                                    : 'border-slate-200 text-slate-600 bg-white hover:border-slate-900 hover:shadow-lg hover:scale-105 active:scale-95'
                                }
                                ${isSelected ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : ''}
                                `}
                            >
                                <span className={isProcessing && isSelected ? 'opacity-0' : 'opacity-100'}>{time}</span>
                                {isProcessing && isSelected && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Loader2 size={20} className="animate-spin text-white" />
                                    </div>
                                )}
                            </button>
                         )
                     })}
                 </div>
            </div>
        )}

        {step === 4 && (
            <div key="step4" className="space-y-6 animate-fade-in flex-1 flex flex-col">
                <button onClick={prevStep} disabled={isProcessing} className="text-sm text-slate-400 flex items-center gap-1 hover:text-slate-700 transition-colors font-medium mb-2 group disabled:opacity-50">
                  <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> Voltar
                </button>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Check size={20} /></div>
                    Revisar Agendamento
                </h2>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 relative hover:shadow-2xl hover:scale-[1.01] transition-all duration-300">
                    <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500"></div>
                    <div className="p-8">
                        {/* Summary Details */}
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0"><Scissors size={28} /></div>
                                <div className="flex-1">
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Serviços</p>
                                    <div className="font-medium text-slate-800">{selectedServices.map(s => s.name).join(', ')}</div>
                                    <div className="text-xs text-slate-500 mt-1">Duração: {totalDuration} min</div>
                                </div>
                            </div>
                            <div className="h-px bg-slate-100 w-full"></div>
                            <div className="flex gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex-shrink-0 overflow-hidden"><img src={selectedBarber?.avatar} className="w-full h-full object-cover" /></div>
                                <div className="flex-1">
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Profissional</p>
                                    <div className="font-bold text-slate-800 text-lg">{selectedBarber?.name}</div>
                                </div>
                            </div>
                            <div className="h-px bg-slate-100 w-full"></div>
                            <div className="flex gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0"><Calendar size={28} /></div>
                                <div className="flex-1">
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Data e Hora</p>
                                    <div className="font-bold text-slate-800 text-lg">Hoje, {selection.time}</div>
                                </div>
                            </div>
                        </div>

                        {/* Guest Identity Input (Only if not logged in) */}
                        {!currentUser && (
                            <div className="mt-8 pt-6 border-t border-slate-100 animate-fade-in bg-slate-50 p-4 rounded-xl">
                                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    <Smartphone size={18} /> Seus Dados
                                </h4>
                                <div className="grid gap-3">
                                    <input 
                                        type="text" 
                                        placeholder="Seu Nome Completo"
                                        className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                                        value={guestInfo.name}
                                        onChange={e => setGuestInfo({...guestInfo, name: e.target.value})}
                                        disabled={isProcessing}
                                    />
                                    <input 
                                        type="tel" 
                                        placeholder="WhatsApp para contato"
                                        className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                                        value={guestInfo.phone}
                                        onChange={e => setGuestInfo({...guestInfo, phone: e.target.value})}
                                        disabled={isProcessing}
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2">
                                    Para pagar pelo app e ganhar pontos, <span className="font-bold underline cursor-pointer text-blue-600">faça login</span>.
                                </p>
                            </div>
                        )}
                        
                        {currentUser && (
                            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                                    <img src={currentUser.avatar} alt="User" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">Agendando como</p>
                                    <p className="text-sm font-bold text-slate-800">{currentUser.name}</p>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="bg-slate-50 p-6 flex justify-between items-center border-t border-slate-100">
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Total a Pagar</p>
                            {!currentUser && <p className="text-[10px] text-amber-600 font-bold">PAGAMENTO NO LOCAL</p>}
                        </div>
                        <span className="text-3xl font-bold text-slate-900">R$ {totalPrice.toFixed(2)}</span>
                    </div>
                </div>

                <div className="flex-1"></div>
                <button 
                    onClick={confirmBooking}
                    disabled={isProcessing}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait min-h-[56px]"
                >
                    {isProcessing ? (
                        <span className="flex items-center gap-2 animate-pulse text-white/90">
                            <Loader2 size={20} className="animate-spin" /> Confirmando...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            Confirmar Agendamento <ChevronRight size={20} />
                        </span>
                    )}
                </button>
            </div>
        )}

        {step === 5 && (
            <div key="step5" className="text-center space-y-6 animate-fade-in my-auto flex flex-col items-center justify-center flex-1">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-inner mb-2 animate-[bounce_1s_infinite]">
                    <Check size={48} strokeWidth={3} />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Agendamento Confirmado!</h2>
                    <p className="text-slate-500 mt-2">
                        {currentUser 
                            ? `Obrigado, ${currentUser.name.split(' ')[0]}! Te esperamos lá.`
                            : `Obrigado, ${guestInfo.name.split(' ')[0]}! Te esperamos lá.`}
                    </p>
                </div>
                
                {/* WhatsApp Notification Card */}
                <div className="bg-emerald-50 w-full p-4 rounded-xl border border-emerald-100 text-left animate-fade-in">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                            <MessageCircle size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-emerald-800 text-sm">Confirmação Enviada</h4>
                            <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                                Enviamos os detalhes para seu WhatsApp. <br/>
                                <span className="font-semibold">Lembrete ativado:</span> Avisaremos 1 dia antes do seu corte.
                            </p>
                            <a 
                                href={getWhatsAppLink()} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-wide mt-2 hover:underline"
                            >
                                Não recebeu? Clique aqui <ExternalLink size={10} />
                            </a>
                        </div>
                    </div>
                </div>

                {currentUser ? (
                     <div className="bg-blue-50 p-4 rounded-xl text-blue-800 text-sm border border-blue-100 w-full">
                        <p className="font-bold">+10 Pontos BarberPro</p>
                        <p className="text-xs mt-1">Acumule para ganhar cortes grátis.</p>
                     </div>
                ) : (
                    <div className="bg-amber-50 p-4 rounded-xl text-amber-800 text-sm border border-amber-100 w-full">
                        <p className="font-bold">Dica:</p>
                        <p className="text-xs mt-1">Crie uma conta para pagar pelo app e acumular pontos!</p>
                    </div>
                )}

                <button 
                    onClick={() => { setStep(1); setSelection({serviceIds: [], barberId: '', time: ''}); setGuestInfo({name:'', phone:''}); }}
                    className="text-blue-600 font-semibold hover:text-blue-800 hover:bg-blue-50 px-6 py-2 rounded-lg transition-all"
                >
                    Fazer outro agendamento
                </button>
            </div>
        )}
      </div>
    </div>
  );
};