import React from 'react';
import { MOCK_USERS, MOCK_STATS } from '../constants';
import { UserRole } from '../types';
import { Star, TrendingUp, Scissors, Phone, Mail, MoreHorizontal, Plus } from 'lucide-react';

export const Team: React.FC = () => {
  const barbers = MOCK_USERS.filter(u => u.role === UserRole.BARBER);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Equipe</h2>
            <p className="text-slate-500 mt-1">Gerencie seus barbeiros e visualize o desempenho individual.</p>
        </div>
        <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10 flex items-center gap-2">
            <Plus size={18} /> Novo Barbeiro
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {barbers.map((barbeiro, index) => (
            <div key={barbeiro.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="h-24 bg-gradient-to-r from-slate-800 to-slate-900 relative">
                    <button className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
                        <MoreHorizontal size={20} />
                    </button>
                </div>
                <div className="px-6 pb-6 relative">
                    <div className="flex justify-between items-end -mt-10 mb-4">
                        <div className="relative">
                            <img 
                                src={barbeiro.avatar} 
                                alt={barbeiro.name} 
                                className="w-20 h-20 rounded-2xl border-4 border-white shadow-md object-cover"
                            />
                            <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="text-right">
                             <div className="flex items-center justify-end gap-1 text-amber-500 font-bold text-sm mb-1">
                                4.9 <Star size={14} fill="currentColor" />
                             </div>
                             <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                                {120 + (index * 15)} Avaliações
                             </span>
                        </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-800">{barbeiro.name}</h3>
                    <p className="text-sm text-slate-500 mb-6">Especialista em Corte & Barba</p>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                            <p className="text-xs text-blue-500 font-bold uppercase mb-1 flex items-center gap-1">
                                <Scissors size={12} /> Cortes
                            </p>
                            <p className="text-lg font-bold text-slate-800">{45 + (index * 12)}</p>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                            <p className="text-xs text-emerald-600 font-bold uppercase mb-1 flex items-center gap-1">
                                <TrendingUp size={12} /> Comissão
                            </p>
                            <p className="text-lg font-bold text-slate-800">R$ {1200 + (index * 350)}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <button className="w-full py-2 flex items-center justify-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                            <Phone size={16} /> (11) 99999-000{index}
                        </button>
                        <button className="w-full py-2 flex items-center justify-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                            <Mail size={16} /> barber{index}@barberpro.com
                        </button>
                    </div>
                </div>
            </div>
        ))}

        {/* Card de Convite/Vaga */}
        <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer group">
            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus size={32} className="text-slate-400 group-hover:text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">Contratar Profissional</h3>
            <p className="text-sm text-slate-400 mt-2 max-w-[200px]">Adicione um novo talento à sua equipe e aumente a capacidade.</p>
        </div>
      </div>
    </div>
  );
};