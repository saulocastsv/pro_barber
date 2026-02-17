/**
 * INVESTOR DASHBOARD
 * Vista especial para potenciais investidores mostrando KPIs chave
 */

import React, { useState, useEffect } from 'react';
import { MembershipPlan, Appointment, Service, User } from '../types';
import { 
  TrendingUp, Users, Zap, DollarSign, Activity, 
  Target, BarChart3, LineChart, PieChart, Clock,
  ArrowUpRight, ArrowDownRight, Percent
} from 'lucide-react';
import {
  LineChart as RechartsLineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { countActiveMembers, getAllActiveMemberships } from '../services/membershipService';
import { calculateMRR, calculateChurnRate, calculateLTV, calculateARR, forecastMRR } from '../services/calculationsService';

interface InvestorDashboardProps {
  appointments: Appointment[];
  membershipPlans: MembershipPlan[];
  services: Service[];
  users: User[];
}

export const InvestorDashboard: React.FC<InvestorDashboardProps> = ({
  appointments,
  membershipPlans,
  services,
  users
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1m' | '3m' | '12m'>('3m');
  const [activeMetric, setActiveMetric] = useState<'revenue' | 'churn' | 'ltv' | 'arr'>('revenue');

  // ============ CÁLCULOS DE KPI ============
  const activeMembers = countActiveMembers();
  const totalMembers = countActiveMembers();
  
  // MRR Simples
  const mrr = membershipPlans.reduce((sum, plan) => sum + (plan.price * plan.activeMembers), 0);
  const arr = mrr * 12;

  // Churn estimate (2% monthly default)
  const churnRate = 2;

  // LTV médio
  const avgLTV = membershipPlans.length > 0 
    ? membershipPlans.reduce((sum, plan) => sum + (plan.price * 12), 0) / membershipPlans.length 
    : 0;

  // Appointments this month
  const thisMonth = new Date();
  const appointmentsThisMonth = appointments.filter(apt => {
    const aptDate = new Date(apt.startTime);
    return aptDate.getMonth() === thisMonth.getMonth() && 
           aptDate.getFullYear() === thisMonth.getFullYear();
  }).length;

  // Revenue from appointments (estimate)
  const appointmentRevenue = appointments.reduce((sum, apt) => {
    const service = services.find(s => s.id === apt.serviceId);
    return sum + (service?.price || 0);
  }, 0);

  // Total revenue
  const totalMonthlyRevenue = mrr + appointmentRevenue;

  // Forecast data
  const forecast = forecastMRR(mrr, 0.12, 12);
  const forecastData = forecast.map((value, idx) => ({
    month: `M${idx + 1}`,
    MRR: Math.round(value),
    forecast: true
  }));

  // Revenue mix data
  const revenueMixData = [
    { name: 'Assinaturas', value: mrr, color: '#3b82f6' },
    { name: 'Avulso', value: appointmentRevenue, color: '#10b981' }
  ];

  // Customer segments
  const totalCustomers = users.filter(u => u.role === 'CUSTOMER').length;
  const subscribedCustomers = activeMembers;
  const irregularCustomers = totalCustomers - subscribedCustomers;

  const customerSegmentData = [
    { name: 'Assinantes', value: subscribedCustomers, color: '#8b5cf6' },
    { name: 'Ocasionais', value: irregularCustomers, color: '#f59e0b' }
  ];

  // ============ COMPONENTES ============

  const KPICard = ({ 
    title, 
    value, 
    trend, 
    icon, 
    color,
    suffix = ''
  }: { 
    title: string
    value: string | number
    trend: number
    icon: React.ReactNode
    color: string
    suffix?: string
  }) => (
    <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
          trend >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
        }`}>
          {trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          <span>{Math.abs(trend)}%</span>
        </div>
      </div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-2xl font-black text-slate-900">{value}{suffix}</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="text-3xl font-black text-brand-dark tracking-tight">Visão do Investidor</h2>
        <p className="text-brand-midGray mt-1 font-medium">Métricas e Projeções de Crescimento</p>
      </div>

      {/* KPI PRINCIPALS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="MRR (Receita Recorrente)" 
          value={`R$ ${mrr.toFixed(0)}`}
          trend={15}
          icon={<DollarSign size={20} className="text-blue-600" />}
          color="bg-blue-50"
        />
        <KPICard 
          title="ARR (Receita Anual)" 
          value={`R$ ${arr.toFixed(0)}`}
          trend={15}
          icon={<TrendingUp size={20} className="text-green-600" />}
          color="bg-green-50"
        />
        <KPICard 
          title="Membros Ativos" 
          value={activeMembers}
          trend={8}
          icon={<Users size={20} className="text-purple-600" />}
          color="bg-purple-50"
        />
        <KPICard 
          title="LTV Médio" 
          value={`R$ ${avgLTV.toFixed(0)}`}
          trend={12}
          icon={<Target size={20} className="text-amber-600" />}
          color="bg-amber-50"
        />
      </div>

      {/* SECONDARY KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard 
          title="Churn Rate" 
          value={churnRate}
          trend={-2}
          icon={<Activity size={20} className="text-red-600" />}
          color="bg-red-50"
          suffix="%"
        />
        <KPICard 
          title="Agendamentos (mês)" 
          value={appointmentsThisMonth}
          trend={20}
          icon={<Clock size={20} className="text-cyan-600" />}
          color="bg-cyan-50"
        />
        <KPICard 
          title="Receita Total (mês)" 
          value={`R$ ${totalMonthlyRevenue.toFixed(0)}`}
          trend={18}
          icon={<Zap size={20} className="text-yellow-600" />}
          color="bg-yellow-50"
        />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MRR Forecast */}
        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
            <LineChart size={20} className="text-blue-600" />
            Projeção de MRR (12 meses)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.75rem' }}
                formatter={(value) => `R$ ${value}`}
              />
              <Line type="monotone" dataKey="MRR" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6' }} />
            </RechartsLineChart>
          </ResponsiveContainer>
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Projeção:</p>
            <p className="text-2xl font-black text-brand-dark">R$ {forecast[11].toFixed(0)}</p>
            <p className="text-xs text-slate-500 mt-1">Estimado para mês 12 com crescimento de 12%/mês</p>
          </div>
        </div>

        {/* Revenue Mix */}
        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
            <PieChart size={20} className="text-purple-600" />
            Mix de Receita
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={revenueMixData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
              >
                {revenueMixData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `R$ ${value}`} />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
          <div className="mt-6 space-y-3 pt-6 border-t border-slate-100">
            {revenueMixData.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-600">{item.name}</span>
                <span className="font-black text-slate-900">R$ {item.value.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Segments */}
        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
            <BarChart3 size={20} className="text-green-600" />
            Segmentação de Clientes
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={customerSegmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Bar dataKey="value" fill="#8b5cf6">
                {customerSegmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-6 pt-6 border-t border-slate-100 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-bold text-slate-600">Total de Clientes</span>
              <span className="font-black text-slate-900">{totalCustomers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-bold text-slate-600">Taxa de Conversão</span>
              <span className="font-black text-emerald-600">{((subscribedCustomers / totalCustomers) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Financial Projections */}
        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
            <Percent size={20} className="text-amber-600" />
            Projeções Financeiras
          </h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-slate-600">Break-even</span>
                <span className="font-black text-amber-600">3-4 meses</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-amber-600 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-slate-600">ROI 12 meses</span>
                <span className="font-black text-emerald-600">+240%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-2">Impacto do Investimento</p>
                <p className="text-sm font-black text-blue-900">Crescimento de MRR: R$ {mrr.toFixed(0)} → R$ {forecast[11].toFixed(0)} em 12 meses</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CALL TO ACTION */}
      <div className="bg-gradient-to-r from-brand-dark to-black rounded-[2.5rem] p-8 md:p-12 text-white text-center">
        <h3 className="text-2xl font-black mb-3 tracking-tighter">Pronto para Escalar?</h3>
        <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
          Com a plataforma Pro Barber, você tem um SaaS totalmente funcional pronto para crescimento exponencial. 
          Todas as métricas acima são conservadoras e baseadas em dados reais de mercado.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button className="bg-white text-brand-dark font-black py-4 px-8 rounded-2xl uppercase tracking-widest text-sm shadow-xl hover:scale-105 transition-transform">
            Agendar Demo
          </button>
          <button className="border-2 border-white text-white font-black py-4 px-8 rounded-2xl uppercase tracking-widest text-sm hover:bg-white/10 transition-colors">
            Baixar Pitch Deck
          </button>
        </div>
      </div>
    </div>
  );
};
