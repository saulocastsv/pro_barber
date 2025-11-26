import React, { useState } from 'react';
import { MOCK_USERS, MOCK_NOTES, MOCK_APPOINTMENTS, SERVICES } from '../constants';
import { UserRole, User } from '../types';
import { Search, Phone, User as UserIcon, Calendar, FileText, Plus, Save, Clock, Scissors, MessageCircle, Filter, ArrowUpDown, History, ChevronLeft } from 'lucide-react';

export const CustomerCRM: React.FC = () => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'lastVisit' | 'totalVisits'>('name');
  const [newNote, setNewNote] = useState('');

  // Filter only customers
  const customers = MOCK_USERS.filter(u => u.role === UserRole.CUSTOMER);

  // Helper to get stats for sorting and display
  const getCustomerStats = (customerId: string) => {
    const customerAppts = MOCK_APPOINTMENTS.filter(a => a.customerId === customerId);
    const completedAppts = customerAppts.filter(a => a.status === 'COMPLETED');
    
    // Sort by date desc
    const sortedHistory = [...customerAppts].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    const lastVisit = sortedHistory.length > 0 ? new Date(sortedHistory[0].startTime) : null;
    
    // Calculate LTV (Lifetime Value) - Mock based on services
    const ltv = completedAppts.reduce((acc, curr) => {
        const service = SERVICES.find(s => s.id === curr.serviceId);
        return acc + (service?.price || 0);
    }, 0);

    return { totalVisits: completedAppts.length, lastVisit, ltv, history: sortedHistory };
  };

  // Filter and Sort Logic
  const processedCustomers = customers
    .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone?.includes(searchTerm))
    .map(c => ({ ...c, ...getCustomerStats(c.id) }))
    .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'totalVisits') return b.totalVisits - a.totalVisits;
        if (sortBy === 'lastVisit') {
            if (!a.lastVisit) return 1;
            if (!b.lastVisit) return -1;
            return b.lastVisit.getTime() - a.lastVisit.getTime();
        }
        return 0;
    });

  const selectedCustomer = selectedCustomerId 
    ? processedCustomers.find(c => c.id === selectedCustomerId) 
    : null;

  const customerNotes = selectedCustomerId 
    ? MOCK_NOTES.filter(n => n.customerId === selectedCustomerId) 
    : [];

  const handleSaveNote = () => {
      if (!newNote.trim()) return;
      alert('Nota salva com sucesso! (Simulação)');
      setNewNote('');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex justify-between items-center flex-shrink-0">
        <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Fichas de Clientes</h2>
            <p className="text-slate-500 mt-1">Histórico técnico, preferências e CRM.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden min-h-0">
        
        {/* Left Column: List */}
        {/* Mobile Logic: Hide if customer selected. Desktop: Always show (lg:flex) */}
        <div className={`lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex-col overflow-hidden ${selectedCustomerId ? 'hidden lg:flex' : 'flex'}`}>
            {/* Search & Filter Header */}
            <div className="p-4 border-b border-slate-100 space-y-3 bg-white z-10">
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Buscar por nome ou telefone..." 
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                        <Filter size={12} /> Ordenar por:
                    </span>
                    <select 
                        className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:ring-blue-500 outline-none cursor-pointer"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                    >
                        <option value="name">Nome (A-Z)</option>
                        <option value="lastVisit">Mais Recentes</option>
                        <option value="totalVisits">Mais Fiéis (Visitas)</option>
                    </select>
                </div>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {processedCustomers.map(customer => (
                    <div 
                        key={customer.id}
                        onClick={() => setSelectedCustomerId(customer.id)}
                        className={`p-4 border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50 flex items-center gap-3 ${selectedCustomerId === customer.id ? 'bg-blue-50 border-blue-100' : ''}`}
                    >
                        <img src={customer.avatar} alt={customer.name} className="w-12 h-12 rounded-full object-cover border border-slate-100" />
                        <div className="flex-1 min-w-0">
                            <h4 className={`font-bold text-sm truncate ${selectedCustomerId === customer.id ? 'text-blue-700' : 'text-slate-800'}`}>
                                {customer.name}
                            </h4>
                            <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                                <Phone size={10} /> {customer.phone || 'Sem telefone'}
                            </div>
                        </div>
                        <div className="text-right">
                             {customer.lastVisit ? (
                                <div className="text-[10px] text-slate-400 font-medium">
                                    {sortBy === 'lastVisit' ? 'Última vez:' : ''} <br/>
                                    <span className="text-slate-600">{customer.lastVisit.toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})}</span>
                                </div>
                             ) : (
                                <span className="text-[10px] bg-slate-100 px-2 py-1 rounded-full text-slate-500">Novo</span>
                             )}
                             {sortBy === 'totalVisits' && (
                                 <div className="mt-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                                     {customer.totalVisits} cortes
                                 </div>
                             )}
                        </div>
                    </div>
                ))}
                {processedCustomers.length === 0 && (
                    <div className="p-10 text-center text-slate-400 text-sm">Nenhum cliente encontrado.</div>
                )}
            </div>
        </div>

        {/* Right Column: Details */}
        {/* Mobile Logic: Show if customer selected. Desktop: Show if selected (lg:flex), hide if not. */}
        <div className={`lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 flex-col overflow-hidden ${selectedCustomerId ? 'flex' : 'hidden lg:flex'}`}>
            {selectedCustomer ? (
                <div className="flex flex-col h-full overflow-hidden">
                    {/* Header Details */}
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            {/* Mobile Back Button */}
                            <button 
                                onClick={() => setSelectedCustomerId(null)}
                                className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors"
                            >
                                <ChevronLeft size={24} />
                            </button>

                            <img src={selectedCustomer.avatar} className="w-16 h-16 md:w-20 md:h-20 rounded-2xl shadow-md object-cover border-4 border-white" alt="Avatar" />
                            <div className="flex-1 md:flex-none">
                                <h2 className="text-xl md:text-2xl font-bold text-slate-800">{selectedCustomer.name}</h2>
                                <p className="text-slate-500 text-sm flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                                    <span className="flex items-center gap-1"><Phone size={12} /> {selectedCustomer.phone}</span>
                                    <span className="hidden md:inline text-slate-300">|</span>
                                    <span className="text-slate-500 break-all">{selectedCustomer.email}</span>
                                </p>
                            </div>
                        </div>
                        
                        {/* Actions & Stats Row */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-2 md:mt-0">
                            <div className="flex gap-2">
                                <button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm shadow-emerald-200">
                                    <MessageCircle size={14} /> WhatsApp
                                </button>
                                <button className="flex-1 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors">
                                    <Calendar size={14} /> Agendar
                                </button>
                            </div>

                            <div className="flex gap-4 bg-white p-3 rounded-xl border border-slate-100 shadow-sm justify-center sm:justify-start">
                                <div className="text-center px-2">
                                    <p className="text-xs text-slate-400 font-bold uppercase">LTV Total</p>
                                    <p className="text-lg font-bold text-slate-800">R$ {selectedCustomer.ltv}</p>
                                </div>
                                <div className="w-px bg-slate-100 h-10"></div>
                                <div className="text-center px-2">
                                    <p className="text-xs text-slate-400 font-bold uppercase">Visitas</p>
                                    <p className="text-lg font-bold text-slate-800">{selectedCustomer.totalVisits}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        {/* Technical Notes Section */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <FileText size={18} className="text-blue-500" /> Notas Técnicas
                            </h3>
                            
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                                <textarea 
                                    className="w-full bg-transparent border-none focus:ring-0 text-sm text-slate-700 placeholder:text-slate-400 resize-none"
                                    rows={2}
                                    placeholder="Adicionar nova observação (ex: Pente 2 na lateral, prefere barba quadrada...)"
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                ></textarea>
                                <div className="flex justify-between items-center mt-2 border-t border-amber-100/50 pt-2">
                                    <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wide">Visível apenas para equipe</span>
                                    <button 
                                        onClick={handleSaveNote}
                                        disabled={!newNote.trim()}
                                        className="bg-amber-500 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-amber-600 disabled:opacity-50 transition-colors flex items-center gap-1"
                                    >
                                        <Save size={12} /> Salvar Nota
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {customerNotes.map(note => (
                                    <div key={note.id} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm relative group hover:shadow-md transition-all">
                                        <p className="text-sm text-slate-700 leading-relaxed mb-2">{note.note}</p>
                                        <div className="flex items-center gap-2">
                                            {note.tags.map(tag => (
                                                <span key={tag} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-medium border border-slate-200">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50 text-xs text-slate-400">
                                            <span className="flex items-center gap-1"><UserIcon size={10} /> {MOCK_USERS.find(u => u.id === note.barberId)?.name}</span>
                                            <span className="flex items-center gap-1"><Clock size={10} /> {new Date(note.date).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                    </div>
                                ))}
                                {customerNotes.length === 0 && (
                                    <p className="text-center text-slate-400 text-sm py-4 italic">Nenhuma nota técnica registrada.</p>
                                )}
                            </div>
                        </div>

                        {/* History Timeline */}
                        <div className="pt-6 border-t border-slate-100">
                             <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                                <History size={18} className="text-purple-500" /> Histórico de Visitas
                            </h3>
                            <div className="space-y-4">
                                {selectedCustomer.history.map(appt => {
                                    const service = SERVICES.find(s => s.id === appt.serviceId);
                                    const barber = MOCK_USERS.find(u => u.id === appt.barberId);
                                    return (
                                        <div key={appt.id} className="flex gap-4 relative">
                                            {/* Timeline Line */}
                                            <div className="absolute top-0 bottom-0 left-[1