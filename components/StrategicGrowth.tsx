
import React, { useState, useEffect } from 'react';
import { MOCK_STRATEGIC_STATS, MOCK_USERS } from '../constants';
import { MembershipPlan, StrategicStats, Service, User } from '../types';
import { AvatarComponent } from './AvatarComponent';
import { 
  Award, TrendingUp, Users, Target, Activity, Zap, RefreshCw, 
  Crown, AlertTriangle, AlertCircle, ArrowUpRight, BarChart3, Clock, 
  DollarSign, Heart, CheckCircle, Plus, X, PieChart, 
  Info, ChevronLeft, ArrowRight, Wallet, Scissors, Tag, Hash, Coins, Search, History, Repeat, ShoppingCart
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  isSubscribed, subscribeCustomer, getActiveMembership, 
  countActiveMembers, getAllActiveMemberships, getCustomerMonthlyUsage
} from '../services/membershipService';
import {
  calculateRealMargin, calculateLTV, calculateMRR,
  calculateSubscriberPrice, calculatePointsEarned
} from '../services/calculationsService';

interface StrategicGrowthProps {
  services: Service[];
  plans: MembershipPlan[];
  setPlans: React.Dispatch<React.SetStateAction<MembershipPlan[]>>;
  currentUser?: User;
}

export const StrategicGrowth: React.FC<StrategicGrowthProps> = ({ services, plans, setPlans, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'membership' | 'subscribers' | 'analysis'>('membership');
    // UIKit
    import { Section, StatCard as UIKitStatCard, Button, Card, FormInput } from './UIKit';
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null);
  const [subscriberSearch, setSubscriberSearch] = useState('');
  const [activeMembers, setActiveMembers] = useState(0);
  const [allMemberships, setAllMemberships] = useState<{ [key: string]: { planId: string; startDate: string } }>({});
  
  const [simData, setSimData] = useState({
    name: '',
    price: 0,
    servicesPerMonth: 2,
    includedServiceIds: [] as string[],
    includesBeard: false,
    cac: 25
  });

  const stats = MOCK_STRATEGIC_STATS;
  const selectedPlan = plans.find(p => p.id === selectedPlanId);
  
  // Atualizar índices de assinantes
  useEffect(() => {
    const members = countActiveMembers();
    setActiveMembers(members);
    setAllMemberships(getAllActiveMemberships());
  }, []);
  
  // Mock Subscribers Report
  const activeSubscribers = MOCK_USERS.filter(u => u.membershipId || isSubscribed(u.id));

  const handleCreatePlan = () => {
    const newPlan: MembershipPlan = {
      id: `plan_${Date.now()}`,
      name: simData.name || 'Novo Plano',
      price: simData.price || 99,
      servicesPerMonth: simData.servicesPerMonth,
      includedServiceIds: simData.includedServiceIds,
      includesBeard: simData.includesBeard,
      benefits: [`${simData.servicesPerMonth}x Serviços/mês`],
      activeMembers: 0,
      utilizationRate: 0,
      revenueGenerated: 0
    };
    setPlans([newPlan, ...plans]);
    setIsPlanModalOpen(false);
  };

  const handleSubscribeToPlan = (planId: string) => {
    if (!currentUser) {
      alert('Faça login para assinar um plano');
      return;
    }
    
    const result = subscribeCustomer(currentUser.id, planId);
    if (result.success) {
      // Atualizar contadores
      const members = countActiveMembers();
      setActiveMembers(members);
      setAllMemberships(getAllActiveMemberships());
      
      // Fechar modal
      setIsCheckoutModalOpen(false);
      setCheckoutPlanId(null);
      
      alert(`✅ ${result.message}\n\nVocê agora está inscrito no plano e pode aproveitar os benefícios!`);
    } else {
      alert(`⚠️ ${result.message}`);
    }
  };

  const toggleServiceInPlan = (id: string) => {
    setSimData(prev => ({
      ...prev,
      includedServiceIds: prev.includedServiceIds.includes(id)
        ? prev.includedServiceIds.filter(sid => sid !== id)
        : [...prev.includedServiceIds, id]
    }));
  };

  const calculatePlanMetrics = () => {
    const selectedServices = services.filter(s => simData.includedServiceIds.includes(s.id));
    const avgServicePrice = selectedServices.length ? selectedServices.reduce((sum, s) => sum + s.price, 0) / selectedServices.length : 0;
    const avgServiceCost = selectedServices.length ? selectedServices.reduce((sum, s) => sum + s.cost, 0) / selectedServices.length : 0;
    const monthlyServicesCost = avgServiceCost * simData.servicesPerMonth;
    
    // Usar calculationsService para margem correta
    const margin = calculateRealMargin(simData.price, monthlyServicesCost);
    const ltv = calculateLTV(simData.price - monthlyServicesCost, 12); // 12 meses
    
    return {
      avgServicePrice,
      avgServiceCost,
      monthlyServicesCost,
      margin: Math.max(0, margin),
      ltv: Math.max(0, ltv),
      break_even_months: monthlyServicesCost > 0 ? Math.ceil(simData.price / monthlyServicesCost) : 0
    };
  };

  const metrics = calculatePlanMetrics();

  const MetricCard: React.FC<{title: string, value: string, trend: string, icon: React.ReactNode, color: string}> = ({
    title, value, trend, icon, color
  }) => (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-2xl ${color}`}>{icon}</div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-emerald-600 bg-emerald-50">{trend}</span>
      </div>
      <div className="mt-4">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
        <h3 className="text-3xl font-black text-brand-dark tracking-tighter">{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <Section
        title="Estratégia & Crescimento"
        subtitle="Gestão inteligente de planos e retenção."
        action={
          <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
            <Button variant={activeTab === 'membership' ? 'primary' : 'ghost'} size="sm" onClick={() => setActiveTab('membership')}>Clubes</Button>
            <Button variant={activeTab === 'subscribers' ? 'primary' : 'ghost'} size="sm" onClick={() => setActiveTab('subscribers')}>Relatório Assinantes</Button>
            <Button variant={activeTab === 'analysis' ? 'primary' : 'ghost'} size="sm" onClick={() => setActiveTab('analysis')}>Análise</Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <UIKitStatCard label="Receita Recorrente (MRR)" value={`R$ ${stats.mrr.toFixed(2)}`} trend="+15%" icon={<RefreshCw size={20} />} />
          <UIKitStatCard label="Churn Rate" value={`${stats.churnRate}%`} trend="-2%" icon={<Activity size={20} />} />
          <UIKitStatCard label="Membros Ativos" value={activeMembers.toString()} trend={`+${activeMembers > 0 ? activeMembers : 0}`} icon={<Users size={20} />} />
          <UIKitStatCard label="LTV Médio" value={`R$ ${stats.clv.toFixed(0)}`} trend="+R$ 20" icon={<Target size={20} />} />
        </div>
      </Section>

      {activeTab === 'membership' && (
        <Section title="Clubes de Assinatura" subtitle="Gerencie planos e clubes disponíveis">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {plans.length === 0 ? (
              <Card variant="bordered" className="flex flex-col items-center justify-center h-48">
                <div className="text-slate-400"><Crown size={32} /></div>
                <p className="text-sm font-bold mt-2">Nenhum clube disponível</p>
                <Button variant="primary" size="md" onClick={() => setIsPlanModalOpen(true)} className="mt-4">Criar Novo Clube Barvo</Button>
              </Card>
            ) : (
              <>
                {plans.map(plan => (
                  <Card key={plan.id} variant="elevated" className="relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-light/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="relative z-10 flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-black text-brand-dark tracking-tighter">{plan.name}</h3>
                        <p className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest">{plan.servicesPerMonth} serviços p/ mês</p>
                        <div className="text-3xl font-black text-brand-dark mb-6">R$ {plan.price.toFixed(2)} <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">/ mensal</span></div>
                      </div>
                      <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl font-bold text-xs uppercase border border-emerald-100">
                        {plan.activeMembers} Ativos
                      </div>
                    </div>
                    <div className="pt-6 border-t border-slate-50 flex gap-2">
                      <Button variant="primary" size="sm" className="flex-1 flex items-center gap-2" onClick={() => { setCheckoutPlanId(plan.id); setIsCheckoutModalOpen(true); }}>
                        <ShoppingCart size={16} /> Assinar Plano
                      </Button>
                      <Button variant="ghost" size="sm" className="p-3" onClick={() => setSelectedPlanId(plan.id)}><BarChart3 size={18}/></Button>
                    </div>
                  </Card>
                ))}
                <Button variant="outline" size="lg" onClick={() => setIsPlanModalOpen(true)} className="w-full mt-4 flex flex-col items-center justify-center gap-3">
                  <Plus size={32} />
                  <span className="font-bold">Criar Novo Clube Barvo</span>
                </Button>
              </>
            )}
          </div>
        </Section>
      )}

      {activeTab === 'subscribers' && (
        <Section title="Relatório de Assinantes" subtitle="Veja todos os assinantes ativos">
          <Card variant="default" className="overflow-x-auto">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Users size={20} className="text-blue-500" />
                <span className="text-xl font-bold text-brand-dark">Relatório de Assinantes</span>
              </div>
              <FormInput
                label="Filtrar por nome"
                placeholder="Digite o nome..."
                value={subscriberSearch}
                onChange={e => setSubscriberSearch(e.target.value)}
                icon={<Search size={16} />}
              />
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Assinante</th>
                  <th className="px-6 py-4">Plano</th>
                  <th className="px-6 py-4">Ativo desde</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Histórico / Migração</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeSubscribers.filter(s => s.name.toLowerCase().includes(subscriberSearch.toLowerCase())).map(sub => {
                  const plan = plans.find(p => p.id === sub.membershipId);
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <AvatarComponent url={sub.avatar} name={sub.name} size="sm" className="!w-10 !h-10" />
                          <div>
                            <p className="font-bold text-brand-dark text-sm">{sub.name}</p>
                            <p className="text-[10px] text-slate-400">{sub.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-700 text-sm">{plan?.name}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {sub.membershipStartDate || '12/10/2023'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-1 rounded uppercase">Ativo</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" className="p-2" title="Ver Migrações">
                          <History size={18} />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </Section>
      )}

      {/* MODAL DE CHECKOUT - ASSINAR PLANO */}
      {isCheckoutModalOpen && checkoutPlanId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 transition-all duration-300">
          <Card variant="elevated" className="w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden relative animate-fade-in">
            <Button variant="ghost" size="sm" className="absolute top-6 right-6 z-20" onClick={() => setIsPlanModalOpen(false)}><X size={20} strokeWidth={3} /></Button>
            <div className="p-8 md:p-10 border-b border-slate-50 bg-slate-50/50">
              <div className="flex items-center gap-2 mb-2">
                <Crown size={24} className="text-amber-500 fill-amber-500" />
                <span className="text-2xl font-black text-brand-dark tracking-tighter">Criador de Clubes Barvo</span>
              </div>
              <span className="text-slate-500 text-sm font-medium">Configure a recorrência e benefícios exclusivos para seus clientes.</span>
            </div>
            <div className="p-8 md:p-10 overflow-y-auto space-y-8 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <FormInput
                    label="Nome do Plano"
                    placeholder="Ex: Premium Mensal"
                    value={simData.name}
                    onChange={e => setSimData({ ...simData, name: e.target.value })}
                    icon={<Tag size={20} className="text-slate-400" />}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormInput
                      label="Mensalidade (R$)"
                      type="number"
                      value={simData.price.toString()}
                      onChange={e => setSimData({ ...simData, price: Number(e.target.value) })}
                      icon={<Coins size={18} className="text-slate-400" />}
                    />
                    <FormInput
                      label="Frequência / Mês"
                      type="number"
                      value={simData.servicesPerMonth.toString()}
                      onChange={e => setSimData({ ...simData, servicesPerMonth: Number(e.target.value) })}
                      icon={<Hash size={18} className="text-slate-400" />}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Scissors size={14} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Incluso no Plano</span>
                  </div>
                  <Card variant="bordered" className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {services.map(s => (
                      <Button
                        key={s.id}
                        variant={simData.includedServiceIds.includes(s.id) ? 'primary' : 'outline'}
                        size="sm"
                        className="w-full flex justify-between items-center p-3.5 mb-1"
                        onClick={() => toggleServiceInPlan(s.id)}
                      >
                        <div className="text-left">
                          <span className="text-xs font-bold mb-1 block">{s.name}</span>
                          <span className={`text-[10px] block ${simData.includedServiceIds.includes(s.id) ? 'text-brand-light/60' : 'text-slate-400'}`}>Valor avulso: R$ {s.price}</span>
                        </div>
                        {simData.includedServiceIds.includes(s.id) && <CheckCircle size={18} className="text-brand-light" fill="currentColor" />}
                      </Button>
                    ))}
                  </Card>
                </div>
              </div>
              <Card variant="default" className="bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-light/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                  <TrendingUp size={18} className="text-brand-light" />
                  <span className="font-black text-brand-light uppercase tracking-widest text-xs">Análise de Lucratividade</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                  <UIKitStatCard label="Margem" value={`${metrics.margin.toFixed(1)}%`} icon={null} />
                  <UIKitStatCard label="Custo Mensal" value={`R$ ${metrics.monthlyServicesCost.toFixed(2)}`} icon={null} />
                  <UIKitStatCard label="LTV Anual" value={`R$ ${metrics.ltv.toFixed(0)}`} icon={null} />
                </div>
              </Card>
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleCreatePlan}
                disabled={simData.includedServiceIds.length === 0 || !simData.name}
              >
                Ativar Clube de Assinatura
              </Button>
            </div>
          </Card>
              <div className="flex items-center gap-2 mb-2">
                <Crown size={24} className="text-amber-500 fill-amber-500" />
                <h3 className="text-2xl font-black text-brand-dark tracking-tighter">Criador de Clubes Barvo</h3>
              </div>
              <p className="text-slate-500 text-sm font-medium">Configure a recorrência e benefícios exclusivos para seus clientes.</p>
            </div>
            
            <div className="p-8 md:p-10 overflow-y-auto space-y-8 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Nome do Plano</label>
                      <div className="relative">
                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                          type="text" placeholder="Ex: Premium Mensal" 
                          className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-dark focus:bg-white text-slate-900 font-bold text-lg placeholder:text-slate-300 transition-all shadow-sm" 
                          value={simData.name} onChange={e => setSimData({...simData, name: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Mensalidade (R$)</label>
                        <div className="relative">
                          <Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                            type="number" 
                            className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-dark focus:bg-white text-slate-900 font-bold text-lg shadow-sm" 
                            value={simData.price || 99} onChange={e => setSimData({...simData, price: Number(e.target.value)})}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Frequência / Mês</label>
                        <div className="relative">
                          <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                            type="number" 
                            className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-dark focus:bg-white text-slate-900 font-bold text-lg shadow-sm" 
                            value={simData.servicesPerMonth} onChange={e => setSimData({...simData, servicesPerMonth: Number(e.target.value)})}
                          />
                        </div>
                      </div>
                    </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Scissors size={14} className="text-slate-400" />
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Incluso no Plano</label>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar bg-slate-50/50 p-2 rounded-2xl border border-slate-100">
                    {services.map(s => (
                      <button 
                        key={s.id} 
                        onClick={() => toggleServiceInPlan(s.id)}
                        className={`w-full flex justify-between items-center p-3.5 rounded-xl border transition-all ${simData.includedServiceIds.includes(s.id) ? 'bg-brand-dark text-white border-brand-dark' : 'bg-white text-slate-600 border-slate-200'}`}
                      >
                        <div className="text-left">
                          <p className="text-xs font-bold mb-1">{s.name}</p>
                          <p className={`text-[10px] ${simData.includedServiceIds.includes(s.id) ? 'text-brand-light/60' : 'text-slate-400'}`}>Valor avulso: R$ {s.price}</p>
                        </div>
                        {simData.includedServiceIds.includes(s.id) && <CheckCircle size={18} className="text-brand-light" fill="currentColor" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-light/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                  <TrendingUp size={18} className="text-brand-light" />
                  <h4 className="font-black text-brand-light uppercase tracking-widest text-xs">Análise de Lucratividade</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Margem</span>
                    <span className={`text-2xl font-black ${metrics.margin >= 50 ? 'text-emerald-400' : metrics.margin >= 30 ? 'text-amber-400' : 'text-red-400'}`}>
                      {metrics.margin.toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Custo Mensal</span>
                    <span className="text-2xl font-black text-slate-300">R$ {metrics.monthlyServicesCost.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">LTV Anual</span>
                    <span className="text-2xl font-black text-blue-400">R$ {metrics.ltv.toFixed(0)}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleCreatePlan} 
                disabled={simData.includedServiceIds.length === 0 || !simData.name}
                className="w-full py-5 bg-brand-dark text-white font-black text-lg rounded-2xl shadow-2xl hover:bg-black transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Ativar Clube de Assinatura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
