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
  <div className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default relative overflow-visible z-10">
    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colorClass} opacity-5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`} />
    
    <div className="flex justify-between items-start relative z-10">
      <div>
        <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <div className="relative group/info">
                <HelpCircle size={14} className="text-slate-400 cursor-help hover:text-blue-500 transition-colors" />
                {/* Tooltip */}
                <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-48 bg-slate-800 text-white text-xs p-2 rounded-lg opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none shadow-xl z-50 text-center leading-relaxed">
                    {tooltipText}
                    <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                </div>
            </div>
        </div>
        <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h3>
        {trend && (
            <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-full">
                <ArrowUpRight size={12} /> {trend} esta semana
            </div>
        )}
      </div>
      <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 text-opacity-100 transition-colors group-hover:bg-opacity-20`}>
        {React.cloneElement(icon as React.ReactElement<any>, { className: `w-6 h-6` })}
      </div>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 text-white p-3 rounded-lg shadow-xl text-sm border border-slate-700 backdrop-blur-md bg-opacity-90">
        <p className="font-semibold mb-1">{label}</p>
        <p className="text-emerald-400 font-medium">
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
            <p className="text-slate-500 mt-1">Bem-vindo de volta! Aqui está o resumo de hoje.</p>
        </div>
        <div className="flex gap-2">
            <select className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all cursor-pointer shadow-sm">
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
          tooltipText="Soma de todos os serviços e produtos vendidos no mês atual."
        />
        <StatCard 
          title="Agendamentos" 
          value={stats.totalAppointments.toString()} 
          icon={<Calendar />} 
          colorClass="text-blue-600 bg-blue-500"
          trend="+5%"
          tooltipText="Total de cortes e serviços agendados, incluindo os cancelados."
        />
        <StatCard 
          title="Novos Clientes" 
          value={`+${stats.newCustomers}`} 
          icon={<Users />} 
          colorClass="text-amber-600 bg-amber-500"
          tooltipText="Número de clientes que visitaram a barbearia pela primeira vez este mês."
        />
        <StatCard 
          title="Ticket Médio" 
          value={`R$ ${stats.avgTicket}`} 
          icon={<TrendingUp />} 
          colorClass="text-purple-600 bg-purple-500"
          trend="+2%"
          tooltipText="Valor médio gasto por cliente em cada visita."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-slate-800">Receita da Semana</h3>
            <button 
                onClick={() => onNavigate('financials')}
                className="text-sm text-blue-600 font-semibold hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors"
            >
                Ver Relatório
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
                    tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} 
                    dy={10}
                />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12}} 
                />
                <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
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
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300 flex flex-col">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Trophy className="text-amber-500" size={20} />
            Top Barbeiros
          </h3>
          <div className="space-y-6 flex-1">
            {[1, 2, 3].map((_, i) => {
                const colors = ['bg-amber-100 text-amber-700', 'bg-slate-100 text-slate-700', 'bg-orange-100 text-orange-800'];
                const pct = 100 - (i * 20);
                
                return (
                  <div key={i} className="group relative">
                    <div className="flex items-center gap-4 mb-2 z-10 relative">
                        <div className={`w-8 h-8 rounded-full ${colors[i]} flex items-center justify-center font-bold text-sm shadow-sm`}>
                        {i + 1}
                        </div>
                        <div className="flex-1">
                        <div className="flex justify-between items-center">
                            <p className="font-bold text-slate-800 text-sm">Barbeiro {String.fromCharCode(65 + i)}</p>
                            <span className="font-bold text-emerald-600 text-sm">R$ {(30 - (i * 5)) * 50}</span>
                        </div>
                        <p className="text-xs text-slate-400">{30 - (i * 5)} cortes realizados</p>
                        </div>
                    </div>
                    {/* Progress Bar background */}
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${i === 0 ? 'bg-amber-500' : 'bg-slate-400'}`} 
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                  </div>
            )})}
          </div>
          <button 
            onClick={() => onNavigate('team')}
            className="w-full mt-6 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            Ver Equipe Completa
          </button>
        </div>
      </div>
    </div>
  );
};