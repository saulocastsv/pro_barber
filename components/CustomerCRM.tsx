
import React, { useState } from 'react';
import { Service, User, TechnicalNote, Appointment } from '../types';
import { Search, FileText, History, ChevronLeft, Crown, Smartphone, CreditCard, RefreshCw, AlertTriangle } from 'lucide-react';

interface CustomerCRMProps {
  services: Service[];
  notes: TechnicalNote[];
  onSaveNote: (note: Partial<TechnicalNote>) => void;
  customers: User[];
  appointments: Appointment[];
}

export const CustomerCRM: React.FC<CustomerCRMProps> = ({ services, notes, onSaveNote, customers, appointments }) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newNote, setNewNote] = useState('');

  const getCustomerStats = (customerId: string) => {
    const customerAppts = appointments.filter(a => a.customerId === customerId);
    const completedAppts = customerAppts.filter(a => a.status === 'COMPLETED');
    const sortedHistory = [...customerAppts].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    const ltv = completedAppts.reduce((acc, curr) => {
        const service = services.find(s => s.id === curr.serviceId);
        return acc + (service?.price || 0);
    }, 0);
    return { totalVisits: completedAppts.length, ltv, history: sortedHistory };
  };

  const processedCustomers = customers
    .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone?.includes(searchTerm))
    .map(c => ({ ...c, ...getCustomerStats(c.id) }));

  const selectedCustomer = selectedCustomerId ? processedCustomers.find(c => c.id === selectedCustomerId) : null;
  const customerNotes = selectedCustomerId ? notes.filter(n => n.customerId === selectedCustomerId) : [];

  const handleSave = () => {
      if (!newNote.trim() || !selectedCustomerId) return;
      onSaveNote({ customerId: selectedCustomerId, note: newNote, tags: ['Manual'] });
      setNewNote('');
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in pb-10 h-[calc(100vh-140px)] flex flex-col">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
        <div className={`lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden ${selectedCustomerId ? 'hidden lg:flex' : 'flex'}`}>
            <div className="p-4 border-b border-slate-100 bg-white">
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Buscar cliente..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {processedCustomers.map(customer => (
                    <div key={customer.id} onClick={() => setSelectedCustomerId(customer.id)} className={`p-4 border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50 flex items-center gap-3 ${selectedCustomerId === customer.id ? 'bg-blue-50 border-blue-100' : ''}`}>
                        <img src={customer.avatar} className="w-12 h-12 rounded-full object-cover border" alt={customer.name} />
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm truncate">{customer.name}</h4>
                            <div className="flex gap-1 mt-1">
                                {customer.membershipId && <Crown size={12} className="text-amber-500" />}
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">{customer.membershipId ? 'Assinante' : 'Avulso'}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className={`lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 flex-col overflow-hidden ${selectedCustomerId ? 'flex' : 'hidden lg:flex'}`}>
            {selectedCustomer ? (
                <div className="flex flex-col h-full overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setSelectedCustomerId(null)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-200 rounded-full mr-1"><ChevronLeft size={24} /></button>
                            <img src={selectedCustomer.avatar} className="w-16 h-16 rounded-2xl shadow-md object-cover border-4 border-white" alt="Avatar" />
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-slate-800">{selectedCustomer.name}</h2>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {selectedCustomer.membershipId && (
                                        <span className="bg-amber-100 text-amber-700 text-[9px] font-black px-2 py-0.5 rounded-full border border-amber-200 uppercase tracking-tighter flex items-center gap-1">
                                            <Crown size={10}/> Barvo Club Premium
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4 bg-white p-3 rounded-xl border shadow-sm">
                            <div className="text-center px-2">
                                <p className="text-[10px] text-slate-400 font-bold uppercase">LTV</p>
                                <p className="text-lg font-bold text-slate-800">R$ {selectedCustomer.ltv}</p>
                            </div>
                            <div className="text-center px-2">
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Visitas</p>
                                <p className="text-lg font-bold text-slate-800">{selectedCustomer.totalVisits}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2"><FileText size={18} className="text-blue-500" /> Notas Técnicas</h3>
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                                <textarea className="w-full bg-transparent border-none focus:ring-0 text-sm text-slate-700 placeholder:text-slate-400 resize-none" rows={2} placeholder="Preferências do cliente (ex: Pente 2 baixo)..." value={newNote} onChange={(e) => setNewNote(e.target.value)}></textarea>
                                <div className="flex justify-end mt-2"><button onClick={handleSave} disabled={!newNote.trim()} className="bg-amber-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-600 disabled:opacity-50 transition-colors">Salvar Nota</button></div>
                            </div>
                            <div className="space-y-3">
                                {customerNotes.map(note => (
                                    <div key={note.id} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                                        <p className="text-sm text-slate-700 mb-2">{note.note}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(note.date).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100">
                             <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4"><History size={18} className="text-purple-500" /> Histórico de Visitas</h3>
                             <div className="space-y-3">
                                 {selectedCustomer.history.map(appt => (
                                     <div key={appt.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                                         <div>
                                             <div className="flex items-center gap-2 mb-1">
                                                <p className="text-sm font-bold text-slate-800">{services.find(s=>s.id===appt.serviceId)?.name}</p>
                                                {appt.paymentMethod === 'APP' ? <Smartphone size={12} className="text-emerald-500" /> : <CreditCard size={12} className="text-blue-500" />}
                                             </div>
                                             <p className="text-[10px] text-slate-400">{new Date(appt.startTime).toLocaleDateString('pt-BR')} às {new Date(appt.startTime).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</p>
                                         </div>
                                         <div className="flex flex-col items-end gap-1">
                                             <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${appt.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>{appt.status}</span>
                                             {appt.paymentMethod === 'APP' && <span className="text-[8px] font-bold text-emerald-600 uppercase">Pago via App</span>}
                                         </div>
                                     </div>
                                 ))}
                             </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <p>Selecione um cliente para ver os detalhes.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
