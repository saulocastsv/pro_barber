
import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { AvatarComponent } from './AvatarComponent';
import { Star, TrendingUp, Scissors, Phone, Mail, MoreHorizontal, Plus, X, Trash2, Edit } from 'lucide-react';

interface TeamProps {
  barbers: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

export const Team: React.FC<TeamProps> = ({ barbers, setUsers }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBarber, setNewBarber] = useState({ name: '', email: '', phone: '' });
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const handleAddBarber = (e: React.FormEvent) => {
      e.preventDefault();
      const barber: User = {
          id: `u${Date.now()}`,
          name: newBarber.name,
          email: newBarber.email,
          phone: newBarber.phone,
          role: UserRole.BARBER,
          avatar: `https://picsum.photos/seed/${Date.now()}/100/100`
      };
      setUsers(prev => [...prev, barber]);
      setIsModalOpen(false);
      setNewBarber({ name: '', email: '', phone: '' });
  };

  const handleDeleteBarber = (id: string) => {
      if (window.confirm('Remover este barbeiro da equipe?')) {
          setUsers(prev => prev.filter(b => b.id !== id));
      }
      setActiveMenuId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in relative pb-10">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Equipe</h2>
            <p className="text-slate-500 mt-1">Gerencie seus barbeiros e visualize o desempenho individual.</p>
        </div>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-lg flex items-center gap-2"
        >
            <Plus size={18} /> Novo Barbeiro
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {barbers.map((barbeiro, index) => (
            <div key={barbeiro.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-visible group hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative">
                <div className="h-24 bg-brand-dark relative rounded-t-2xl">
                    <div className="absolute top-4 right-4 z-10">
                        <button onClick={() => setActiveMenuId(activeMenuId === barbeiro.id ? null : barbeiro.id)} className="text-white/70 hover:text-white transition-colors p-1">
                            <MoreHorizontal size={20} />
                        </button>
                        {activeMenuId === barbeiro.id && (
                            <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-20">
                                <button onClick={() => handleDeleteBarber(barbeiro.id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                    <Trash2 size={14} /> Remover
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="px-6 pb-6 relative">
                    <div className="flex justify-between items-end -mt-10 mb-4">
                        <AvatarComponent url={barbeiro.avatar} name={barbeiro.name} size="lg" className="!w-20 !h-20 border-4 border-white shadow-md" />
                        <div className="text-right">
                             <div className="flex items-center justify-end gap-1 text-amber-500 font-bold text-sm mb-1">
                                4.9 <Star size={14} fill="currentColor" />
                             </div>
                        </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-800">{barbeiro.name}</h3>
                    <p className="text-sm text-slate-500 mb-6">Barbeiro Especialista</p>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                            <p className="text-[10px] text-blue-500 font-bold uppercase mb-1">Cortes</p>
                            <p className="text-lg font-bold text-slate-800">{45 + (index * 2)}</p>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                            <p className="text-[10px] text-emerald-600 font-bold uppercase mb-1">Score</p>
                            <p className="text-lg font-bold text-slate-800">98%</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="w-full py-2 flex items-center gap-2 text-sm font-medium text-slate-600">
                            <Phone size={14} className="text-slate-400"/> {barbeiro.phone || '(11) 99999-0000'}
                        </div>
                        <div className="w-full py-2 flex items-center gap-2 text-sm font-medium text-slate-600">
                            <Mail size={14} className="text-slate-400"/> {barbeiro.email}
                        </div>
                    </div>
                </div>
            </div>
        ))}
      </div>

      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="text-lg font-bold text-slate-800">Novo Barbeiro</h3>
                      <button onClick={() => setIsModalOpen(false)} className="text-slate-400"><X size={20} /></button>
                  </div>
                  <form onSubmit={handleAddBarber} className="p-6 space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                          <input required type="text" className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Lucas Mendes" value={newBarber.name} onChange={e => setNewBarber({...newBarber, name: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                          <input required type="email" className="w-full p-2.5 border border-slate-200 rounded-lg outline-none" placeholder="barbeiro@email.com" value={newBarber.email} onChange={e => setNewBarber({...newBarber, email: e.target.value})} />
                      </div>
                      <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors shadow-lg mt-2">Contratar Barbeiro</button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};
