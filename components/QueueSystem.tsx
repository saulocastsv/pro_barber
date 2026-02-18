
import React, { useState } from 'react';
import { QueueItem, Service } from '../types';
// Fixed: Added List to the imported icons from lucide-react
import { Clock, User, Scissors, Play, CheckCircle, Smartphone, AlertCircle, Users, List } from 'lucide-react';
import { UIButton, Section, EmptyState } from './UIKit';

interface QueueSystemProps {
  initialQueue: QueueItem[];
  services: Service[];
}

export const QueueSystem: React.FC<QueueSystemProps> = ({ initialQueue, services }) => {
  const [queue, setQueue] = useState<QueueItem[]>(initialQueue);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [selectedService, setSelectedService] = useState<string>(services[0].id);

  const addToQueue = () => {
    if (!newCustomerName) return;
    const estimatedWait = queue.reduce((acc, item) => acc + (item.status === 'WAITING' ? 20 : 0), 10);
    
    const newItem: QueueItem = {
      id: Math.random().toString(36).substr(2, 9),
      customerName: newCustomerName,
      serviceId: selectedService,
      joinedAt: new Date(),
      estimatedWaitMinutes: estimatedWait,
      status: 'WAITING' as const
    };
    
    setQueue([...queue, newItem]);
    setNewCustomerName('');
  };

  const advanceStatus = (id: string) => {
    setQueue(queue.map(item => {
      if (item.id === id) {
        if (item.status === 'WAITING') return { ...item, status: 'IN_CHAIR' as const };
        if (item.status === 'IN_CHAIR') return { ...item, status: 'COMPLETED' as const };
      }
      return item;
    }).filter(item => item.status !== 'COMPLETED'));
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12">
      {/* Mobile Stats Banner */}
            <Section title="Fila Walk-in" className="md:hidden bg-brand-dark text-white p-5 rounded-[1.5rem] shadow-xl flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
                <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-light/60 mb-1">Pessoas na Fila</p>
                    <h3 className="text-3xl font-black tracking-tighter">{queue.length} <span className="text-sm font-bold opacity-40 ml-1">esperando</span></h3>
                </div>
                <div className="relative z-10 text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-light/60 mb-1">Espera Média</p>
                    <div className="flex items-center gap-1.5 justify-end">
                        <Clock size={14} className="text-amber-400" />
                        <span className="text-xl font-black">{queue.length * 20} min</span>
                    </div>
                </div>
            </Section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Section - Left column on Desktop, stacks on Mobile */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 h-fit">
                <h2 className="text-xl font-black text-brand-dark mb-6 flex items-center gap-2 uppercase tracking-tighter">
                    <Smartphone className="text-brand-dark" size={24} /> Novo Walk-in
                </h2>
                <div className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nome do Cliente</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-light focus:bg-white focus:outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
                            placeholder="Ex: João da Silva"
                            value={newCustomerName}
                            onChange={e => setNewCustomerName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Serviço Desejado</label>
                        <div className="relative">
                            <select 
                                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-light focus:bg-white focus:outline-none transition-all font-bold text-slate-800 appearance-none"
                                value={selectedService}
                                onChange={e => setSelectedService(e.target.value)}
                            >
                                {services.map(s => <option key={s.id} value={s.id}>{s.name} - R${s.price}</option>)}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <Scissors size={18} />
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={addToQueue}
                        disabled={!newCustomerName}
                        className="w-full bg-brand-dark text-white font-black py-4 rounded-2xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-widest disabled:opacity-30 active:scale-95"
                    >
                        <Users size={18} /> Adicionar à Fila
                    </button>
                </div>
            </div>

            {/* Hint Box */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex gap-4">
                <AlertCircle className="text-blue-500 flex-shrink-0" size={24} />
                <p className="text-xs text-blue-700 font-medium leading-relaxed">
                    A fila walk-in é ideal para clientes que chegam sem agendamento. O tempo é calculado automaticamente com base no serviço.
                </p>
            </div>
        </div>

        {/* Queue Display - Fluid on all screens */}
        <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-black text-brand-dark uppercase tracking-tighter flex items-center gap-2">
                    <List size={22} /> Ordem de Chamada
                </h2>
                <span className="hidden md:inline-flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
                    Tempo Médio: {queue.length * 20} min
                </span>
            </div>

            <div className="space-y-3">
                {queue.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock size={32} className="text-slate-200" />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">A fila está livre agora</p>
                    </div>
                ) : queue.map((item, index) => {
                    const service = services.find(s => s.id === item.serviceId);
                    const isWaiting = item.status === 'WAITING';
                    const isInChair = item.status === 'IN_CHAIR';
                    
                    return (
                        <div key={item.id} className={`
                            flex items-center justify-between p-4 md:p-6 rounded-[2rem] border transition-all active:scale-[0.98]
                            ${isWaiting ? 'bg-white border-slate-100 shadow-sm' : 'bg-brand-dark border-brand-dark text-white shadow-xl scale-[1.02]'}
                            animate-fade-in
                        `}>
                            <div className="flex items-center gap-4 md:gap-6">
                                <div className={`
                                    w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center font-black text-base
                                    ${isWaiting ? 'bg-slate-100 text-slate-400' : 'bg-brand-light text-brand-dark shadow-inner'}
                                `}>
                                    {index + 1}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className={`font-black text-base md:text-xl tracking-tight truncate ${!isWaiting && 'text-white'}`}>{item.customerName}</h3>
                                        {isInChair && <span className="bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase animate-pulse">Na Cadeira</span>}
                                    </div>
                                    <p className={`text-[10px] md:text-xs font-bold uppercase tracking-widest ${isWaiting ? 'text-slate-400' : 'text-brand-light opacity-80'}`}>{service?.name}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                 <div className="text-right hidden sm:block">
                                    {isWaiting && (
                                        <>
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Espera</p>
                                            <p className="text-sm font-black text-slate-600">~{item.estimatedWaitMinutes} min</p>
                                        </>
                                    )}
                                    {isInChair && (
                                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Atendendo...</p>
                                    )}
                                 </div>
                                 
                                 <button 
                                    onClick={() => advanceStatus(item.id)}
                                    title={isWaiting ? "Chamar para cadeira" : "Finalizar atendimento"}
                                    className={`
                                        w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-90
                                        ${isWaiting ? 'bg-brand-dark text-brand-light hover:bg-black' : 'bg-white text-brand-dark hover:bg-slate-50'}
                                    `}
                                 >
                                    {isWaiting ? <Play size={20} fill="currentColor" /> : <CheckCircle size={24} strokeWidth={3} />}
                                 </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
};
