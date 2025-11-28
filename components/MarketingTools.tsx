
import React, { useState } from 'react';
import { MOCK_CAMPAIGNS } from '../constants';
import { Campaign, LoyaltyAutomation } from '../types';
import { Megaphone, Gift, Send, Users, BarChart2, Plus, MessageCircle, Mail, X, Zap, Check, Play, Pause } from 'lucide-react';

interface MarketingToolsProps {
    automations?: LoyaltyAutomation[];
    setAutomations?: (automations: LoyaltyAutomation[]) => void;
}

export const MarketingTools: React.FC<MarketingToolsProps> = ({ automations = [], setAutomations }) => {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'automation'>('campaigns');
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAutoModalOpen, setIsAutoModalOpen] = useState(false);
  
  // Campaign State
  const [newCampaign, setNewCampaign] = useState({ title: '', content: '', type: 'WHATSAPP' as 'WHATSAPP' | 'EMAIL' });

  // Automation State
  const [newAutomation, setNewAutomation] = useState<Partial<LoyaltyAutomation>>({
      title: '', triggerType: 'APPOINTMENT_COUNT', triggerValue: 5, message: '', active: true, channel: 'WHATSAPP'
  });

  const handleCreateCampaign = (e: React.FormEvent) => {
      e.preventDefault();
      const campaign: Campaign = {
          id: `c${Date.now()}`,
          title: newCampaign.title,
          content: newCampaign.content,
          type: newCampaign.type,
          status: 'SCHEDULED', // Mock status
          sentCount: 0,
          date: new Date().toISOString(),
      };
      setCampaigns([campaign, ...campaigns]);
      setIsModalOpen(false);
      setNewCampaign({ title: '', content: '', type: 'WHATSAPP' });
      alert('Campanha agendada com sucesso!');
  };

  const handleCreateAutomation = (e: React.FormEvent) => {
      e.preventDefault();
      if (!setAutomations) return;
      
      const automation: LoyaltyAutomation = {
          id: `auto_${Date.now()}`,
          title: newAutomation.title || 'Nova Automação',
          triggerType: newAutomation.triggerType || 'APPOINTMENT_COUNT',
          triggerValue: Number(newAutomation.triggerValue),
          message: newAutomation.message || '',
          active: true,
          channel: 'WHATSAPP'
      };
      setAutomations([...automations, automation]);
      setIsAutoModalOpen(false);
      alert('Automação ativada!');
  };

  const toggleAutomation = (id: string) => {
      if (!setAutomations) return;
      setAutomations(automations.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10 relative">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Marketing & Fidelidade</h2>
            <p className="text-slate-500 mt-1">Engaje seus clientes e aumente a recorrência.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('campaigns')}
            className={`pb-3 px-4 text-sm font-bold transition-all relative ${activeTab === 'campaigns' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Campanhas
            {activeTab === 'campaigns' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('automation')}
            className={`pb-3 px-4 text-sm font-bold transition-all relative ${activeTab === 'automation' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Automação
            {activeTab === 'automation' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
          </button>
      </div>

      {activeTab === 'automation' ? (
          <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <Zap className="text-amber-500" /> Regras de Automação
                  </h3>
                  <button 
                    onClick={() => setIsAutoModalOpen(true)}
                    className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors flex items-center gap-2"
                  >
                      <Plus size={16} /> Nova Regra
                  </button>
              </div>

              <div className="grid gap-4">
                  {automations.map(auto => (
                      <div key={auto.id} className={`bg-white p-6 rounded-xl border shadow-sm transition-all ${auto.active ? 'border-l-4 border-l-emerald-500 border-slate-100' : 'border-slate-200 opacity-70'}`}>
                          <div className="flex justify-between items-start">
                              <div className="flex gap-4">
                                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${auto.active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                      <Zap size={20} />
                                  </div>
                                  <div>
                                      <div className="flex items-center gap-2">
                                          <h4 className="font-bold text-slate-800">{auto.title}</h4>
                                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${auto.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                              {auto.active ? 'Ativo' : 'Pausado'}
                                          </span>
                                      </div>
                                      <p className="text-sm text-slate-500 mt-1">
                                          Gatilho: {auto.triggerType === 'APPOINTMENT_COUNT' ? `${auto.triggerValue}º Agendamento` : 'Aniversário'}
                                      </p>
                                      <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                          <p className="text-xs text-slate-400 font-bold uppercase mb-1 flex items-center gap-1">
                                              <MessageCircle size={10} /> Mensagem Automática:
                                          </p>
                                          <p className="text-sm text-slate-600 italic">"{auto.message}"</p>
                                      </div>
                                  </div>
                              </div>
                              <button 
                                onClick={() => toggleAutomation(auto.id)}
                                className={`p-2 rounded-lg transition-colors ${auto.active ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'}`}
                                title={auto.active ? 'Pausar' : 'Ativar'}
                              >
                                  {auto.active ? <Pause size={20} /> : <Play size={20} />}
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
          {/* Loyalty Program Config */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -mr-10 -mt-10 z-0"></div>
             <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                        <Gift size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Programa de Fidelidade</h3>
                        <p className="text-sm text-slate-500">Configuração de pontos e resgates</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                            <p className="font-bold text-slate-700">Regra de Acúmulo</p>
                            <p className="text-xs text-slate-500">Quantos pontos o cliente ganha por Real gasto.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-2xl text-slate-900">1</span>
                            <span className="text-xs font-bold text-slate-400 uppercase">Ponto / R$</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                            <p className="font-bold text-slate-700">Resgate Mínimo</p>
                            <p className="text-xs text-slate-500">Pontos necessários para trocar por prêmios.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-2xl text-slate-900">100</span>
                            <span className="text-xs font-bold text-slate-400 uppercase">Pontos</span>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <p className="font-bold text-slate-700 mb-3">Recompensas Ativas</p>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                <span className="text-slate-600">Corte de Cabelo Grátis</span>
                                <span className="font-bold text-amber-600">350 pts</span>
                            </div>
                            <div className="flex justify-between items-center text-sm p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                <span className="text-slate-600">50% na Barba</span>
                                <span className="font-bold text-amber-600">150 pts</span>
                            </div>
                            <div className="flex justify-between items-center text-sm p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                <span className="text-slate-600">Pomada Modeladora</span>
                                <span className="font-bold text-amber-600">200 pts</span>
                            </div>
                        </div>
                        <button className="w-full mt-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-50 transition-colors text-sm">
                            Gerenciar Recompensas
                        </button>
                    </div>
                </div>
             </div>
          </div>

          {/* Campaigns */}
          <div className="space-y-6">
              <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                  
                  <div className="flex justify-between items-start mb-6">
                      <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                          <Megaphone size={24} className="text-white" />
                      </div>
                      <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-white text-slate-900 px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-100 transition-colors flex items-center gap-2"
                      >
                          <Plus size={16} /> Criar Campanha
                      </button>
                  </div>

                  <h3 className="text-2xl font-bold mb-2">Disparos Automáticos</h3>
                  <p className="text-slate-300 text-sm mb-6">Envie promoções via WhatsApp ou E-mail para sua base de clientes.</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                          <p className="text-xs text-slate-400 font-bold uppercase mb-1">Taxa de Abertura</p>
                          <p className="text-2xl font-bold text-emerald-400">85%</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                          <p className="text-xs text-slate-400 font-bold uppercase mb-1">ROI (Retorno)</p>
                          <p className="text-2xl font-bold text-blue-400">12x</p>
                      </div>
                  </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-700 text-sm">
                      Últimas Campanhas
                  </div>
                  <div className="divide-y divide-slate-100">
                      {campaigns.map(campaign => (
                          <div key={campaign.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                              <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${campaign.type === 'WHATSAPP' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                                      {campaign.type === 'WHATSAPP' ? <MessageCircle size={18} /> : <Mail size={18} />}
                                  </div>
                                  <div>
                                      <p className="font-bold text-slate-800 text-sm">{campaign.title}</p>
                                      <p className="text-xs text-slate-500">{new Date(campaign.date).toLocaleDateString('pt-BR')}</p>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                                      campaign.status === 'SENT' ? 'bg-green-100 text-green-700' : 
                                      campaign.status === 'DRAFT' ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-700'
                                  }`}>
                                      {campaign.status === 'SENT' ? 'Enviado' : campaign.status === 'DRAFT' ? 'Rascunho' : 'Agendado'}
                                  </span>
                                  {campaign.sentCount > 0 && (
                                      <p className="text-xs text-slate-400 mt-1 flex items-center justify-end gap-1">
                                          <Send size={10} /> {campaign.sentCount}
                                      </p>
                                  )}
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
          
      </div>
      )}

      {/* New Campaign Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="text-lg font-bold text-slate-800">Nova Campanha</h3>
                      <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                          <X size={20} />
                      </button>
                  </div>
                  <form onSubmit={handleCreateCampaign} className="p-6 space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Título da Campanha</label>
                          <input 
                            required
                            type="text" 
                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 placeholder:text-slate-400"
                            placeholder="Ex: Promoção Relâmpago"
                            value={newCampaign.title}
                            onChange={e => setNewCampaign({...newCampaign, title: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Canal de Envio</label>
                          <select 
                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                            value={newCampaign.type}
                            onChange={e => setNewCampaign({...newCampaign, type: e.target.value as 'WHATSAPP' | 'EMAIL'})}
                          >
                              <option value="WHATSAPP">WhatsApp</option>
                              <option value="EMAIL">E-mail Marketing</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Mensagem</label>
                          <textarea 
                            required
                            rows={4}
                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 placeholder:text-slate-400 resize-none"
                            placeholder="Olá {nome}, aproveite 20% off..."
                            value={newCampaign.content}
                            onChange={e => setNewCampaign({...newCampaign, content: e.target.value})}
                          />
                      </div>
                      <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors shadow-lg mt-2 flex items-center justify-center gap-2">
                          <Send size={18} /> Agendar Disparo
                      </button>
                  </form>
              </div>
          </div>
      )}

      {/* New Automation Modal */}
      {isAutoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="text-lg font-bold text-slate-800">Nova Regra de Fidelidade</h3>
                      <button onClick={() => setIsAutoModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                          <X size={20} />
                      </button>
                  </div>
                  <form onSubmit={handleCreateAutomation} className="p-6 space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Título da Regra</label>
                          <input 
                            required
                            type="text" 
                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                            placeholder="Ex: Cupom 10º Corte"
                            value={newAutomation.title}
                            onChange={e => setNewAutomation({...newAutomation, title: e.target.value})}
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Gatilho</label>
                              <select 
                                className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                                value={newAutomation.triggerType}
                                onChange={e => setNewAutomation({...newAutomation, triggerType: e.target.value as any})}
                              >
                                  <option value="APPOINTMENT_COUNT">Nº de Agendamentos</option>
                                  <option value="BIRTHDAY">Aniversário</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Valor</label>
                              <input 
                                required
                                type="number" 
                                min="1"
                                className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                                placeholder="Ex: 5"
                                value={newAutomation.triggerValue}
                                onChange={e => setNewAutomation({...newAutomation, triggerValue: Number(e.target.value)})}
                              />
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Mensagem Automática</label>
                          <textarea 
                            required
                            rows={3}
                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 resize-none"
                            placeholder="Escreva a mensagem que será enviada..."
                            value={newAutomation.message}
                            onChange={e => setNewAutomation({...newAutomation, message: e.target.value})}
                          />
                      </div>
                      <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors shadow-lg mt-2 flex items-center justify-center gap-2">
                          <Check size={18} /> Ativar Regra
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};
