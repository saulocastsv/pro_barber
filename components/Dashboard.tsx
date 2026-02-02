
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Users, Calendar, TrendingUp, Trophy, ArrowUpRight, HelpCircle } from 'lucide-react';
import { BarbershopStats } from '../types';

interface DashboardProps {
  stats: BarbershopStats;
  onNavigate: (view: string) => void;
}

const data = [
  { name: 'Seg', revenue: 400 },
  { name: 'Ter', revenue: 300 },
  { name: 'Qua', revenue: 550 },
  { name: 'Qui', revenue: 450 },
  { name: 'Sex', revenue: 900 },
  { name: 'Sab', revenue: 1200 },
  { name: 'Dom', revenue: 100 },
];

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    trend?: string;
    tooltipText: string;
    type?: 'primary' | 'secondary' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, tooltipText, type = 'neutral' }) => {
    const bgIcon = type === 'primary' ? 'bg-brand-dark text-white' : type === 'secondary' ? 'bg-brand-light text-brand-dark' : 'bg-brand-gray text-brand-midGray';
    const bgTrend = type === 'primary' ? 'bg-brand-light/30 text-brand-dark' : 'bg-brand-light/20 text-brand-dark';
    
    const cardBg = type === 'primary' 
        ? 'bg-gradient-to-br from-brand-light to-brand-light/80 border-brand-light/20' 
        : 'bg-white border-slate-100';

    return (
      <div className={`group relative p-6 rounded-2xl shadow-sm border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-default overflow-visible z-10 ${cardBg}`}>
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-56 bg-brand-dark/95 backdrop-blur-sm text-white text-xs p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:-translate-y-2 pointer-events-none shadow-xl z-50 text-center leading-relaxed border border-brand-light/20">
            {tooltipText}
            <div className="absolute left-1/2 top-full -translate-x-1/2 border-6 border-transparent border-t-brand-dark/95"></div>
        </div>

        <div className="flex justify-between items-start relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
                <p className={`text-xs font-bold uppercase tracking-wider group-hover:text-brand-dark transition-colors ${type === 'primary' ? 'text-brand-dark/70' : 'text-brand-midGray'}`}>{title}</p>
                <HelpCircle size={14} className={type === 'primary' ? 'text-brand-dark/40' : 'text-brand-gray group-hover:text-brand-light transition-colors'} />
            </div>
            <h3 className="text-3xl font-bold text-brand-black tracking-tight mb-2">{value}</h3>
            {trend && (
                <div className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg border border-brand-light/30 ${bgTrend}`}>
                    <ArrowUpRight size={12} strokeWidth={3} /> {trend}
                </div>
            )}
          </div>
          <div className={`p-3.5 rounded-2xl ${bgIcon} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
            {React.cloneElement(icon as React.ReactElement<any>, { className: `w-6 h-6` })}
          </div>
        </div>
      </div>
    );
};

export const Dashboard: React.FC<DashboardProps> = ({ stats, onNavigate }) => {
  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-3xl font-bold text-brand-dark tracking-tight">Dashboard</h2>
            <p className="text-brand-midGray mt-1">Visão geral do desempenho da sua barbearia.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Faturamento" value={`R$ ${stats.monthlyRevenue.toLocaleString('pt-BR')}`} icon={<DollarSign />} type="primary" trend="+12%" tooltipText="Receita total do mês corrente." />
        <StatCard title="Agendamentos" value={stats.totalAppointments.toString()} icon={<Calendar />} type="primary" trend="+5%" tooltipText="Total de cortes realizados e agendados." />
        <StatCard title="Novos Clientes" value={`+${stats.newCustomers}`} icon={<Users />} type="secondary" tooltipText="Clientes que agendaram pela primeira vez." />
        <StatCard title="Ticket Médio" value={`R$ ${stats.avgTicket}`} icon={<TrendingUp />} type="secondary" trend="+2%" tooltipText="Média de gasto por visita." />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-xl font-bold text-brand-black mb-8">Receita Semanal</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#737373', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#737373', fontSize: 12}} />
                <Tooltip cursor={{fill: '#F2F2F2'}} />
                <Bar dataKey="revenue" fill="#081E26" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-xl font-bold text-brand-black mb-6 flex items-center gap-2">
            <Trophy className="text-brand-light fill-brand-light" size={20} /> Top Barbeiros
          </h3>
          <div className="space-y-6 flex-1">
            {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl ${i === 0 ? 'bg-brand-dark text-white' : 'bg-brand-light text-brand-dark'} flex items-center justify-center font-bold text-sm shadow-sm`}>{i + 1}º</div>
                    <div className="flex-1">
                        <div className="flex justify-between items-center">
                            <p className="font-bold text-brand-black text-sm">Barbeiro {String.fromCharCode(65 + i)}</p>
                            <span className="font-bold text-brand-dark text-sm">R$ {(30 - (i * 5)) * 50}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full mt-2"><div className="h-full bg-brand-dark rounded-full" style={{ width: `${100 - (i * 20)}%` }} /></div>
                    </div>
                </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
