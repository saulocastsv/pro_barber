
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DollarSign, Users, Calendar, TrendingUp, Trophy, ArrowUpRight, ArrowRight } from 'lucide-react';
import { BarbershopStats } from '../types';
import { Heading, Section, StatCard as UIStatCard, UIButton } from './UIKit';

interface DashboardProps {
  stats: BarbershopStats;
  onNavigate: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, onNavigate }) => {
  const chartData = [
    { name: 'Seg', revenue: 400 },
    { name: 'Ter', revenue: 300 },
    { name: 'Qua', revenue: 550 },
    { name: 'Qui', revenue: 450 },
    { name: 'Sex', revenue: 900 },
    { name: 'Sab', revenue: 1200 },
    { name: 'Dom', revenue: 100 },
  ];

  return (
    <div className="space-y-8">
      <Section 
        title="Painel Executivo"
        subtitle="Análise de performance em tempo real"
        action={
          <UIButton onClick={() => onNavigate('financials')} variant="ghost" size="sm" className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:text-blue-700 transition-colors">
            Relatórios <ArrowRight size={14} />
          </UIButton>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <UIStatCard 
            label="Receita Mensal" 
            value={`R$ ${(stats.monthlyRevenue || 0).toLocaleString('pt-BR')}`}
            trend="+12%" 
            icon={<DollarSign size={20} className="text-blue-600" />} 
            onClick={() => onNavigate('financials')}
          />
          <UIStatCard 
            label="Atendimentos" 
            value={stats.totalAppointments || 0}
            trend="+4%" 
            icon={<Calendar size={20} className="text-emerald-600" />} 
            onClick={() => onNavigate('calendar')}
          />
          <UIStatCard 
            label="Novos Clientes" 
            value={`+${stats.newCustomers || 0}`}
            icon={<Users size={20} className="text-amber-600" />} 
            onClick={() => onNavigate('crm')}
          />
          <UIStatCard 
            label="Ticket Médio" 
            value={`R$ ${stats.avgTicket || 0}`}
            icon={<TrendingUp size={20} className="text-purple-600" />} 
          />
        </div>
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-brand-dark">Faturamento (7 Dias)</h3>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-lg">Semanal</span>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }} dy={10} />
                <YAxis hide />
                <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }} />
                <Bar dataKey="revenue" radius={[8, 8, 0, 0]} barSize={32}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 5 ? '#081E26' : '#B8D0D9'} className="hover:opacity-80 transition-opacity" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-sm font-bold text-brand-dark mb-6 flex items-center gap-2">
            <Trophy className="text-amber-500" size={18} /> Top Profissionais
          </h3>
          <div className="space-y-4 flex-1">
            {[
              { name: 'Marcos', val: 7850, color: 'bg-brand-dark' },
              { name: 'João', val: 5400, color: 'bg-brand-light' },
              { name: 'Felipe', val: 4200, color: 'bg-slate-300' }
            ].map((barber, i) => (
              <div key={i} className="space-y-2 group cursor-pointer" onClick={() => onNavigate('team')}>
                <div className="flex justify-between items-center">
                  <p className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{i + 1}° {barber.name}</p>
                  <span className="font-bold text-slate-600 text-xs">R$ {(barber.val / 100).toLocaleString('pt-BR')}</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${barber.color} rounded-full transition-all`} style={{ width: `${(barber.val / 7850) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <UIButton onClick={() => onNavigate('team')} variant="ghost" size="sm" className="mt-6 w-full text-slate-600 font-bold rounded-xl text-xs uppercase tracking-widest transition-all">
            Ver Equipe Completa
          </UIButton>
        </div>
      </div>
    </div>
  );
};

