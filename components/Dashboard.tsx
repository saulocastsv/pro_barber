
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DollarSign, Users, Calendar, TrendingUp, Trophy, HelpCircle, ArrowUpRight } from 'lucide-react';
import { BarbershopStats } from '../types';

interface DashboardProps {
  stats: BarbershopStats;
  onNavigate: (view: string) => void;
}

const data = [
  { name: 'S', revenue: 400 },
  { name: 'T', revenue: 300 },
  { name: 'Q', revenue: 550 },
  { name: 'Q', revenue: 450 },
  { name: 'S', revenue: 900 },
  { name: 'S', revenue: 1200 },
  { name: 'D', revenue: 100 },
];

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    trend?: string;
    type?: 'primary' | 'secondary' | 'neutral';
    onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, type = 'neutral', onClick }) => {
    const isPrimary = type === 'primary';
    
    return (
      <div 
        onClick={onClick}
        className={`
        group relative p-4 md:p-5 rounded-2xl border transition-all duration-300 overflow-hidden
        ${onClick ? 'cursor-pointer hover:-translate-y-1' : 'cursor-default'}
        ${isPrimary ? 'bg-brand-dark text-white border-brand-dark shadow-lg' : 'bg-white border-slate-100 shadow-sm hover:shadow-md'}
      `}>
        <div className="flex justify-between items-start relative z-10">
          <div className="space-y-1">
            <p className={`text-[9px] font-bold uppercase tracking-widest ${isPrimary ? 'text-brand-light/60' : 'text-brand-midGray'}`}>{title}</p>
            <h3 className={`text-xl md:text-2xl font-black tracking-tight ${isPrimary ? 'text-white' : 'text-brand-black'}`}>{value}</h3>
            {trend && (
                <div className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${isPrimary ? 'bg-white/10 border-white/10 text-brand-light' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                    <TrendingUp size={10} strokeWidth={3} /> {trend}
                </div>
            )}
          </div>
          <div className={`p-2 rounded-xl transition-all ${isPrimary ? 'bg-white/10 text-brand-light group-hover:bg-white/20' : 'bg-brand-gray text-brand-dark group-hover:bg-brand-light/20'}`}>
            {onClick ? <ArrowUpRight size={18} strokeWidth={2.5} /> : React.cloneElement(icon as React.ReactElement<any>, { size: 18, strokeWidth: 2.5 })}
          </div>
        </div>
      </div>
    );
};

export const Dashboard: React.FC<DashboardProps> = ({ stats, onNavigate }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2 border-b border-slate-100 pb-4">
        <div>
            <h2 className="text-xl md:text-2xl font-black text-brand-black tracking-tight">Painel Executivo</h2>
            <p className="text-brand-midGray text-xs font-medium">Análise de performance em tempo real.</p>
        </div>
        <button onClick={() => onNavigate('financials')} className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
          Relatórios completos <ArrowUpRight size={14} />
        </button>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Receita Bruta" value={`R$ ${stats.monthlyRevenue.toLocaleString('pt-BR')}`} icon={<DollarSign />} type="primary" trend="+12%" onClick={() => onNavigate('financials')} />
        <StatCard title="Atendimentos" value={stats.totalAppointments.toString()} icon={<Calendar />} trend="+4%" onClick={() => onNavigate('calendar')} />
        <StatCard title="Novos Clientes" value={`+${stats.newCustomers}`} icon={<Users />} onClick={() => onNavigate('crm')} />
        <StatCard title="Ticket Médio" value={`R$ ${stats.avgTicket}`} icon={<TrendingUp />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-brand-black uppercase tracking-wider">Faturamento (7 Dias)</h3>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">Visualização Semanal</span>
          </div>
          <div className="h-[200px] md:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 600}} dy={10} />
                <YAxis hide />
                <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }} />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]} barSize={28}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 5 ? '#081E26' : '#B8D0D9'} className="hover:opacity-80 transition-opacity cursor-pointer" />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-sm font-bold text-brand-black uppercase tracking-wider mb-6 flex items-center gap-2">
            <Trophy className="text-amber-400" size={16} /> Melhores do Mês
          </h3>
          <div className="space-y-5 flex-1">
            {[
                { name: 'Marcos', val: 7850, color: 'bg-brand-dark' },
                { name: 'João', val: 5400, color: 'bg-brand-light' },
                { name: 'Felipe', val: 4200, color: 'bg-slate-200' }
            ].map((b, i) => (
                <div key={i} className="space-y-1.5 group cursor-pointer" onClick={() => onNavigate('team')}>
                    <div className="flex justify-between items-end">
                        <p className="font-bold text-brand-black text-xs group-hover:text-blue-600 transition-colors">{i+1}º {b.name}</p>
                        <span className="font-bold text-brand-dark text-xs">R$ {b.val.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-50">
                        <div className={`h-full ${b.color} rounded-full transition-all duration-700 ease-out`} style={{ width: `${(b.val / 7850) * 100}%` }} />
                    </div>
                </div>
            ))}
          </div>
          <button onClick={() => onNavigate('team')} className="mt-6 w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold rounded-xl text-[10px] uppercase tracking-widest transition-all active:scale-95">Gerenciar Equipe</button>
        </div>
      </div>
    </div>
  );
};
