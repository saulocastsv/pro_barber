
import React, { useState } from 'react';
import { Service } from '../types';
import { Scissors, Plus, DollarSign, Clock, Trash2, Edit, Save, X, Search, TrendingUp, AlertCircle } from 'lucide-react';

interface ServicesManagementProps {
  services: Service[];
  onUpdateServices: (services: Service[]) => void;
}

export const ServicesManagement: React.FC<ServicesManagementProps> = ({ services, onUpdateServices }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState<Partial<Service>>({
    name: '',
    durationMinutes: 30,
    price: 0,
    cost: 0,
    margin: 0,
    description: ''
  });

  const calculateMargin = (price: number, cost: number) => {
    if (!price || price === 0) return 0;
    return Math.round(((price - cost) / price) * 100);
  };

  const handleInputChange = (field: keyof Service, value: any) => {
    const updated = { ...formData, [field]: value };
    if (field === 'price' || field === 'cost') {
      updated.margin = calculateMargin(Number(updated.price), Number(updated.cost));
    }
    setFormData(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Converte explicitamente para número para evitar erros de toFixed()
    const numericData = {
      ...formData,
      price: Number(formData.price || 0),
      cost: Number(formData.cost || 0),
      durationMinutes: Number(formData.durationMinutes || 0),
      margin: Number(formData.margin || 0)
    };

    if (editingId) {
      onUpdateServices(services.map(s => s.id === editingId ? { ...s, ...numericData } as Service : s));
    } else {
      const newService: Service = {
        ...numericData,
        id: `s_${Date.now()}`,
      } as Service;
      onUpdateServices([...services, newService]);
    }
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', durationMinutes: 30, price: 0, cost: 0, margin: 0, description: '' });
  };

  const startEdit = (service: Service) => {
    setEditingId(service.id);
    setFormData(service);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Excluir este serviço? Isso afetará novos agendamentos.')) {
      onUpdateServices(services.filter(s => s.id !== id));
    }
  };

  const filtered = services.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Helper para cores da margem
  const getMarginStyle = (margin: number) => {
    if (margin < 30) return { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
    if (margin <= 50) return { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
    return { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' };
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-brand-dark tracking-tight">Serviços</h2>
          <p className="text-brand-midGray mt-1 font-medium">Configure seu catálogo e margens de lucro.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-dark text-white px-5 py-2.5 rounded-xl font-bold hover:bg-black transition-all shadow-lg flex items-center gap-2"
        >
          <Plus size={18} /> Novo Serviço
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2">
          <Search size={18} className="text-slate-400 ml-2" />
          <input 
            type="text" 
            placeholder="Buscar serviço..." 
            className="flex-1 border-none focus:ring-0 text-sm outline-none"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Nome / Descrição</th>
                <th className="px-6 py-4">Duração</th>
                <th className="px-6 py-4">Preço (R$)</th>
                <th className="px-6 py-4">Margem</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(service => {
                const styles = getMarginStyle(service.margin);
                return (
                  <tr key={service.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-brand-dark text-sm">{service.name}</p>
                      <p className="text-xs text-slate-400 line-clamp-1">{service.description}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      <span className="flex items-center gap-1"><Clock size={14}/> {service.durationMinutes} min</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-brand-dark">R$ {Number(service.price).toFixed(2)}</p>
                      <p className="text-[10px] text-slate-400">Custo: R$ {Number(service.cost).toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${styles.bg} ${styles.text}`}>
                        {service.margin}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(service)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16}/></button>
                        <button onClick={() => handleDelete(service.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-2xl font-black text-brand-dark tracking-tighter">
                {editingId ? 'Editar Serviço' : 'Novo Serviço'}
              </h3>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X/></button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nome do Serviço</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-dark font-bold text-lg"
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Preço Venda (R$)</label>
                    <input 
                      required 
                      type="number" 
                      step="0.01"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-dark font-bold"
                      value={formData.price}
                      onChange={e => handleInputChange('price', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Custo Insumo (R$)</label>
                    <input 
                      required 
                      type="number" 
                      step="0.01"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-dark font-bold"
                      value={formData.cost}
                      onChange={e => handleInputChange('cost', e.target.value)}
                    />
                  </div>
                </div>

                {/* Seção de Margem com Validação em Tempo Real */}
                <div className={`p-4 rounded-2xl border transition-all flex justify-between items-center ${formData.margin !== undefined && formData.margin < 30 ? 'bg-red-50 border-red-200' : 'bg-brand-light/10 border-brand-light/20'}`}>
                  <div className="flex items-center gap-2 text-brand-dark">
                    <TrendingUp size={18} />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase">Margem Calculada</span>
                      {formData.margin !== undefined && formData.margin < 30 && (
                        <span className="text-[9px] font-bold text-red-600 uppercase">Rentabilidade Baixa</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {formData.margin !== undefined && formData.margin < 30 && (
                      <AlertCircle size={20} className="text-red-600 animate-pulse" />
                    )}
                    <span className={`text-xl font-black ${formData.margin !== undefined ? getMarginStyle(formData.margin).text : ''}`}>
                      {formData.margin}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Duração (Min)</label>
                    <input 
                      required 
                      type="number" 
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-dark font-bold"
                      value={formData.durationMinutes}
                      onChange={e => handleInputChange('durationMinutes', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Descrição Curta</label>
                  <textarea 
                    rows={2}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-dark font-medium text-sm resize-none"
                    value={formData.description}
                    onChange={e => handleInputChange('description', e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-4 bg-brand-dark text-white font-bold rounded-2xl shadow-xl hover:bg-black transition-all">
                {editingId ? 'Salvar Alterações' : 'Criar Serviço'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
