
import React, { useState } from 'react';
import { Section, StatCard, Card, Button, FormInput } from './UIKit';
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

    return (
        <div className="space-y-8 animate-fade-in pb-10 relative">
            <Section
                title="Marketing & Fidelidade"
                subtitle="Engaje seus clientes e aumente a recorrência."
                action={
                    <div className="flex gap-2">
                        <Button variant={activeTab === 'campaigns' ? 'primary' : 'ghost'} size="sm" onClick={() => setActiveTab('campaigns')}>Campanhas</Button>
                        <Button variant={activeTab === 'automation' ? 'primary' : 'ghost'} size="sm" onClick={() => setActiveTab('automation')}>Automação</Button>
                    </div>
                }
            >
                {activeTab === 'automation' ? (
                    <Section title="Regras de Automação" subtitle="Automatize campanhas e fidelidade" action={<Button variant="primary" size="sm" onClick={() => setIsAutoModalOpen(true)}><Plus size={16} /> Nova Regra</Button>}>
                        <div className="grid gap-4">
                            {automations.length === 0 ? (
                                <Card variant="bordered" className="text-center text-slate-400">Nenhuma automação ativa</Card>
                            ) : (
                                automations.map(auto => (
                                    <Card key={auto.id} variant="default" className={`transition-all ${auto.active ? 'border-l-4 border-l-emerald-500' : 'opacity-70'}`}>...existing code...
                                    </Card>
                                ))
                            )}
                        </div>
                    </Section>
                ) : (
                    <Section title="Campanhas e Fidelidade" subtitle="Dispare promoções e configure pontos">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">...existing code...
                        </div>
                    </Section>
                )}
            </Section>

            {/* New Campaign Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">...existing code...
                </div>
            )}

            {/* New Automation Modal */}
            {isAutoModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">...existing code...
                </div>
            )}
        </div>
    );
                title="Marketing & Fidelidade"
                subtitle="Engaje seus clientes e aumente a recorrência."
                action={
                    <div className="flex gap-2">
                        <Button variant={activeTab === 'campaigns' ? 'primary' : 'ghost'} size="sm" onClick={() => setActiveTab('campaigns')}>Campanhas</Button>
                        <Button variant={activeTab === 'automation' ? 'primary' : 'ghost'} size="sm" onClick={() => setActiveTab('automation')}>Automação</Button>
                    </div>
                }
            >

      {activeTab === 'automation' ? (
                <Section title="Regras de Automação" subtitle="Automatize campanhas e fidelidade" action={<Button variant="primary" size="sm" onClick={() => setIsAutoModalOpen(true)}><Plus size={16} /> Nova Regra</Button>}>
                    <div className="grid gap-4">
                        {automations.length === 0 ? (
                            <Card variant="bordered" className="text-center text-slate-400">Nenhuma automação ativa</Card>
                        ) : (
                            automations.map(auto => (
                                <Card key={auto.id} variant="default" className={`transition-all ${auto.active ? 'border-l-4 border-l-emerald-500' : 'opacity-70'}`}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${auto.active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                <Zap size={20} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-800">{auto.title}</span>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${auto.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{auto.active ? 'Ativo' : 'Pausado'}</span>
                                                </div>
                                                <span className="text-sm text-slate-500 mt-1 block">Gatilho: {auto.triggerType === 'APPOINTMENT_COUNT' ? `${auto.triggerValue}º Agendamento` : 'Aniversário'}</span>
                                                <Card variant="bordered" className="mt-3">
                                                    <span className="text-xs text-slate-400 font-bold uppercase mb-1 flex items-center gap-1"><MessageCircle size={10} /> Mensagem Automática:</span>
                                                    <span className="text-sm text-slate-600 italic">"{auto.message}"</span>
                                                </Card>
                                            </div>
                                        </div>
                                        <Button variant={auto.active ? 'primary' : 'outline'} size="sm" className="p-2" onClick={() => toggleAutomation(auto.id)} title={auto.active ? 'Pausar' : 'Ativar'}>{auto.active ? <Pause size={20} /> : <Play size={20} />}</Button>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </Section>
      ) : (
                <Section title="Campanhas e Fidelidade" subtitle="Dispare promoções e configure pontos">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
          {/* Loyalty Program Config */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
                        <Card variant="default" className="relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -mr-10 -mt-10 z-0"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <Card variant="bordered" className="p-3 bg-amber-100 text-amber-600 rounded-xl"><Gift size={24} /></Card>
                                    <div>
                                        <span className="text-xl font-bold text-slate-800">Programa de Fidelidade</span>
                                        <span className="text-sm text-slate-500 block">Configuração de pontos e resgates</span>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <StatCard label="Regra de Acúmulo" value="1" unit="Ponto / R$" />
                                    <StatCard label="Resgate Mínimo" value="100" unit="Pontos" />
                                    <div className="pt-4 border-t border-slate-100">
                                        <span className="font-bold text-slate-700 mb-3 block">Recompensas Ativas</span>
                                        <div className="space-y-2">
                                            <Card variant="bordered" className="flex justify-between items-center text-sm p-2">
                                                <span className="text-slate-600">Corte de Cabelo Grátis</span>
                                                <span className="font-bold text-amber-600">350 pts</span>
                                            </Card>
                                            <Card variant="bordered" className="flex justify-between items-center text-sm p-2">
                                                <span className="text-slate-600">50% na Barba</span>
                                                <span className="font-bold text-amber-600">150 pts</span>
                                            </Card>
                                            <Card variant="bordered" className="flex justify-between items-center text-sm p-2">
                                                <span className="text-slate-600">Pomada Modeladora</span>
                                                <span className="font-bold text-amber-600">200 pts</span>
                                            </Card>
                                        </div>
                                        <Button variant="outline" size="sm" className="w-full mt-4">Gerenciar Recompensas</Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
          </div>

          {/* Campaigns */}
          <div className="space-y-6">
                        <Card variant="elevated" className="bg-slate-900 text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                            <div className="flex justify-between items-start mb-6">
                                <Card variant="bordered" className="p-3 bg-white/10 rounded-xl backdrop-blur-sm"><Megaphone size={24} className="text-white" /></Card>
                                <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}><Plus size={16} /> Criar Campanha</Button>
                            </div>
                            <span className="text-2xl font-bold mb-2 block">Disparos Automáticos</span>
                            <span className="text-slate-300 text-sm mb-6 block">Envie promoções via WhatsApp ou E-mail para sua base de clientes.</span>
                            <div className="grid grid-cols-2 gap-4">
                                <StatCard label="Taxa de Abertura" value="85%" />
                                <StatCard label="ROI (Retorno)" value="12x" />
                            </div>
                        </Card>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <Card variant="default" className="overflow-hidden">
                            <span className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-700 text-sm block">Últimas Campanhas</span>
                            <div className="divide-y divide-slate-100">
                                {campaigns.length === 0 ? (
                                    <span className="block text-center text-slate-400 py-6">Nenhuma campanha criada</span>
                                ) : (
                                    campaigns.map(campaign => (
                                        <div key={campaign.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Card variant="bordered" className={`p-2 rounded-lg ${campaign.type === 'WHATSAPP' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>{campaign.type === 'WHATSAPP' ? <MessageCircle size={18} /> : <Mail size={18} />}</Card>
                                                <div>
                                                    <span className="font-bold text-slate-800 text-sm block">{campaign.title}</span>
                                                    <span className="text-xs text-slate-500 block">{new Date(campaign.date).toLocaleDateString('pt-BR')}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                                                    campaign.status === 'SENT' ? 'bg-green-100 text-green-700' : 
                                                    campaign.status === 'DRAFT' ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-700'
                                                }`}>{campaign.status === 'SENT' ? 'Enviado' : campaign.status === 'DRAFT' ? 'Rascunho' : 'Agendado'}</span>
                                                {campaign.sentCount > 0 && (
                                                    <span className="text-xs text-slate-400 mt-1 flex items-center justify-end gap-1 block"><Send size={10} /> {campaign.sentCount}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
              </div>
          </div>
          
      </div>
      )}

      {/* New Campaign Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
                        <Card variant="elevated" className="w-full max-w-md overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <span className="text-lg font-bold text-slate-800">Nova Campanha</span>
                                <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}><X size={20} /></Button>
                            </div>
                            <form onSubmit={handleCreateCampaign} className="p-6 space-y-4">
                                <FormInput
                                    label="Título da Campanha"
                                    required
                                    value={newCampaign.title}
                                    onChange={e => setNewCampaign({ ...newCampaign, title: e.target.value })}
                                    placeholder="Ex: Promoção Relâmpago"
                                />
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Canal de Envio</label>
                                    <select
                                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                                        value={newCampaign.type}
                                        onChange={e => setNewCampaign({ ...newCampaign, type: e.target.value as 'WHATSAPP' | 'EMAIL' })}
                                    >
                                        <option value="WHATSAPP">WhatsApp</option>
                                        <option value="EMAIL">E-mail Marketing</option>
                                    </select>
                                </div>
                                <FormInput
                                    label="Mensagem"
                                    required
                                    value={newCampaign.content}
                                    onChange={e => setNewCampaign({ ...newCampaign, content: e.target.value })}
                                    placeholder="Olá {nome}, aproveite 20% off..."
                                    type="textarea"
                                />
                                <Button variant="primary" size="lg" type="submit" className="w-full mt-2 flex items-center justify-center gap-2"><Send size={18} /> Agendar Disparo</Button>
                            </form>
                        </Card>
                    </div>
                )}
      )}

      {/* New Automation Modal */}
                {isAutoModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
                        <Card variant="elevated" className="w-full max-w-md overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <span className="text-lg font-bold text-slate-800">Nova Regra de Fidelidade</span>
                                <Button variant="ghost" size="sm" onClick={() => setIsAutoModalOpen(false)}><X size={20} /></Button>
                            </div>
                            <form onSubmit={handleCreateAutomation} className="p-6 space-y-4">
                                <FormInput
                                    label="Título da Regra"
                                    required
                                    value={newAutomation.title}
                                    onChange={e => setNewAutomation({ ...newAutomation, title: e.target.value })}
                                    placeholder="Ex: Cupom 10º Corte"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Gatilho</label>
                                        <select
                                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                                            value={newAutomation.triggerType}
                                            onChange={e => setNewAutomation({ ...newAutomation, triggerType: e.target.value as any })}
                                        >
                                            <option value="APPOINTMENT_COUNT">Nº de Agendamentos</option>
                                            <option value="BIRTHDAY">Aniversário</option>
                                        </select>
                                    </div>
                                    <FormInput
                                        label="Valor"
                                        required
                                        type="number"
                                        value={newAutomation.triggerValue?.toString() || ''}
                                        onChange={e => setNewAutomation({ ...newAutomation, triggerValue: Number(e.target.value) })}
                                        placeholder="Ex: 5"
                                    />
                                </div>
                                <FormInput
                                    label="Mensagem Automática"
                                    required
                                    value={newAutomation.message}
                                    onChange={e => setNewAutomation({ ...newAutomation, message: e.target.value })}
                                    placeholder="Escreva a mensagem que será enviada..."
                                    type="textarea"
                                />
                                <Button variant="primary" size="lg" type="submit" className="w-full mt-2 flex items-center justify-center gap-2"><Check size={18} /> Ativar Regra</Button>
                            </form>
                        </Card>
                    </div>
                )}
            </Section>
        </div>
      )}
    </div>
  );
};
