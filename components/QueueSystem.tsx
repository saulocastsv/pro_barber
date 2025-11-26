import React, { useState } from 'react';
import { QueueItem, Service } from '../types';
import { Clock, User, Scissors, Play, CheckCircle } from 'lucide-react';
import { SERVICES } from '../constants';

interface QueueSystemProps {
  initialQueue: QueueItem[];
}

export const QueueSystem: React.FC<QueueSystemProps> = ({ initialQueue }) => {
  const [queue, setQueue] = useState<QueueItem[]>(initialQueue);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [selectedService, setSelectedService] = useState<string>(SERVICES[0].id);

  const addToQueue = () => {
    if (!newCustomerName) return;
    const service = SERVICES.find(s => s.id === selectedService);
    const estimatedWait = queue.reduce((acc, item) => acc + (item.status === 'WAITING' ? 20 : 0), 10); // Simple mock logic
    
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
    }).filter(item => item.status !== 'COMPLETED')); // Remove completed for demo cleanliness
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      {/* Input Section */}
      <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <User className="text-blue-500" /> Novo Walk-in
        </h2>
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Nome do Cliente</label>
                <input 
                    type="text" 
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Ex: João da Silva"
                    value={newCustomerName}
                    onChange={e => setNewCustomerName(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Serviço</label>
                <select 
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={selectedService}
                    onChange={e => setSelectedService(e.target.value)}
                >
                    {SERVICES.map(s => <option key={s.id} value={s.id}>{s.name} - R${s.price}</option>)}
                </select>
            </div>
            <button 
                onClick={addToQueue}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
                <Scissors size={18} /> Entrar na Fila
            </button>
        </div>
      </div>

      {/* Queue Display */}
      <div className="lg:col-span-2 bg-slate-900 rounded-xl shadow-lg p-6 text-white overflow-hidden relative flex flex-col">
        <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <Clock className="text-amber-400" /> Fila Digital
            </h2>
            <div className="text-slate-400 text-sm">
                Tempo médio de espera: <span className="text-white font-bold">{queue.length * 20} min</span>
            </div>
        </div>

        <div className="flex-1 overflow-auto space-y-3">
            {queue.length === 0 && (
                <div className="text-center text-slate-500 mt-20">A fila está vazia.</div>
            )}
            {queue.map((item, index) => {
                const service = SERVICES.find(s => s.id === item.serviceId);
                const isWaiting = item.status === 'WAITING';
                return (
                    <div key={item.id} className={`
                        flex items-center justify-between p-4 rounded-lg border 
                        ${isWaiting ? 'bg-slate-800 border-slate-700' : 'bg-emerald-900/30 border-emerald-500/50'}
                        animate-fade-in
                    `}>
                        <div className="flex items-center gap-4">
                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                                ${index === 0 && isWaiting ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-300'}
                            `}>
                                {index + 1}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{item.customerName}</h3>
                                <p className="text-sm text-slate-400">{service?.name}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                             <div className="text-right">
                                <span className={`text-xs px-2 py-1 rounded uppercase font-bold tracking-wider ${isWaiting ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                    {item.status === 'IN_CHAIR' ? 'CORTANDO' : 'AGUARDANDO'}
                                </span>
                                {isWaiting && (
                                    <p className="text-xs text-slate-500 mt-1">~{item.estimatedWaitMinutes} min</p>
                                )}
                             </div>
                             
                             <button 
                                onClick={() => advanceStatus(item.id)}
                                className={`
                                    p-2 rounded-full transition-colors
                                    ${isWaiting ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}
                                `}
                             >
                                {isWaiting ? <Play size={20} fill="currentColor" /> : <CheckCircle size={20} />}
                             </button>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};