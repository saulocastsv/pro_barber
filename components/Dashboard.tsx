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
    colorClass: string;
    trend?: string;
    tooltipText: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, colorClass, trend, tooltipText }) => (
  <div className="group relative bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-default overflow-hidden z-10">
    
    {/* Tooltip - Exibido ao passar o mouse sobre o CARD */}
    <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-56 bg-slate-900/90 backdrop-blur-sm text-white text-xs p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:-translate-y-2 pointer-events-none shadow-xl z-50 text-center leading-relaxed border border-slate-700">
        {tooltipText}
        {/* Seta do Tooltip */}
        <div className="absolute left-1/2 top-full -translate-x-1/2 border-6 border-transparent border-t-slate-900/90"></div>
    </div>

    {/* Background Blob Effect */}
    <div className={`absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br ${colorClass} opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`} />
    
    <div className="flex justify-between items-start relative z-10">
      <div>
        <div className="flex items-center gap-2 mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-600 transition-colors">{title}</p>
            <HelpCircle size={14} className="text-slate-200 group-hover:text-blue-400 transition-colors" />
        </div>
        <h3 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">{value}</h3>
        {trend && (
            <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                <ArrowUpRight size={12} strokeWidth={3} /> {trend}
            </div>
        )}
      </div>
      <div className={`p-3.5 rounded-2xl ${colorClass} bg-opacity-10 text-opacity-100 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
        {React.cloneElement(icon as React.ReactElement<any>, { className: `w-6 h-6` })}
      </div>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 text-white p-4 rounded-xl shadow-2xl text-sm border border-slate-700 backdrop-blur-md">
        <p className="font-bold mb-1 text-slate-300">{label}</p>
        <p className="text-emerald-400 font-bold text-lg">
          R$ {payload[0].value.toLocaleString('pt-BR')}
        </p>
      </div>
    );
  }
  return null;
};

export const Dashboard: React.FC<DashboardProps> = ({ stats, onNavigate }) => {
  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h2>
            <p className="text-slate-500 mt-1">Visão geral do desempenho da sua barbearia.</p>
        </div>
        <div className="flex gap-2">
            <select className="bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl px-4 py-2.5 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer shadow-sm">
                <option>Esta Semana</option>
                <option>Este Mês</option>
                <option>Hoje</option>
            </select>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Faturamento Mensal" 
          value={`R$ ${stats.monthlyRevenue.toLocaleString('pt-BR')}`} 
          icon={<DollarSign />} 
          colorClass="text-emerald-600 bg-emerald-500"
          trend="+12%"
          tooltipText="Soma total de serviços e produtos vendidos no mês atual."
        />
        <StatCard 
          title="Agendamentos" 
          value={stats.totalAppointments.toString()} 
          icon={<Calendar />} 
          colorClass="text-blue-600 bg-blue-500"
          trend="+5%"
          tooltipText="Total de cortes agendados para este mês, incluindo confirmados e pendentes."
        />
        <StatCard 
          title="Novos Clientes" 
          value={`+${stats.newCustomers}`} 
          icon={<Users />} 
          colorClass="text-amber-600 bg-amber-500"
          tooltipText="Número de clientes que realizaram o primeiro cadastro ou visita neste mês."
        />
        <StatCard 
          title="Ticket Médio" 
          value={`R$ ${stats.avgTicket}`} 
          icon={<TrendingUp />} 
          colorClass="text-purple-600 bg-purple-500"
          trend="+2%"
          tooltipText="Média de valor gasto por cliente em cada visita no período atual."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition-shadow duration-300">
          <div className="flex justify-between items-center mb-8">
            <div>
                <h3 className="text-xl font-bold text-slate-800">Receita da Semana</h3>
                <p className="text-sm text-slate-400">Comparativo diário</p>
            </div>
            <button 
                onClick={() => onNavigate('financials')}
                className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
            >
                Ver Relatório Completo
            </button>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} 
                    dy={10}
                />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12}} 
                />
                <Tooltip content={<CustomTooltip />} cursor={{fill: '#f1f5f9', radius: 6}} />
                <Bar 
                    dataKey="revenue" 
                    fill="#3b82f6" 
                    radius={[6, 6, 0, 0]} 
                    barSize={40}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Barbers List */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition-shadow duration-300 flex flex-col">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Trophy className="text-amber-500 fill-amber-500" size={20} />
            Top Barbeiros
          </h3>
          <div className="space-y-6 flex-1">
            {[1, 2, 3].map((_, i) => {
                const colors = ['bg-amber-100 text-amber-700 ring-amber-200', 'bg-slate-100 text-slate-700 ring-slate-200', 'bg-orange-100 text-orange-800 ring-orange-200'];
                const pct = 100 - (i * 20);
                
                return (
                  <div key={i} className="group relative">
                    <div className="flex items-center gap-4 mb-2 z-10 relative">
                        <div className={`w-10 h-10 rounded-xl ${colors[i]} ring-4 ring-opacity-30 flex items-center justify-center font-bold text-sm shadow-sm transition-transform group-hover:scale-110`}>
                        {i + 1}º
                        </div>
                        <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                            <p className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">Barbeiro {String.fromCharCode(65 + i)}</p>
                            <span className="font-bold text-emerald-600 text-sm bg-emerald-50 px-2 py-0.5 rounded">R$ {(30 - (i * 5)) * 50}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{30 - (i * 5)} cortes realizados</p>
                        </div>
                    </div>
                    {/* Progress Bar background */}
                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden mt-2">
                        <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${i === 0 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-slate-300'}`} 
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                  </div>
            )})}
          </div>
          <button 
            onClick={() => onNavigate('team')}
            className="w-full mt-6 py-3.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 transition-all active:scale-[0.98]"
          >
            Ver Equipe Completa
          </button>
        </div>
      </div>
    </div>
  );
};