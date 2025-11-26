import React from 'react';
import { MOCK_CAMPAIGNS } from '../constants';
import { Megaphone, Gift, Send, Users, BarChart2, Plus, MessageCircle, Mail } from 'lucide-react';

export const MarketingTools: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Marketing & Fidelidade</h2>
            <p className="text-slate-500 mt-1">Engaje seus clientes e aumente a recorrência.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                      <button className="bg-white text-slate-900 px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-100 transition-colors flex items-center gap-2">
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
                      {MOCK_CAMPAIGNS.map(campaign => (
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
    </div>
  );
};