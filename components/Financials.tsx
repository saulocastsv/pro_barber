
import React, { useState, useMemo } from 'react';
import { Transaction, PaymentMethod } from '../types';
import { DollarSign, TrendingDown, TrendingUp, Wallet, Download, Loader2, PieChart as PieChartIcon, CreditCard, Landmark, Smartphone, Zap, List } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface FinancialsProps {
  transactions: Transaction[];
}

export const Financials: React.FC<FinancialsProps> = ({ transactions }) => {
  const [activeTab, setActiveTab] = useState<'history' | 'report'>('report');
  const [loadingMore, setLoadingMore] = useState(false);
  const [displayedTransactions, setDisplayedTransactions] = useState(transactions.slice(0, 10));

  const paymentStats = useMemo(() => {
    const stats: Record<PaymentMethod, { count: number; total: number }> = {
      CREDIT_CARD: { count: 0, total: 0 },
      DEBIT_CARD: { count: 0, total: 0 },
      PIX: { count: 0, total: 0 },
      PRESENTIAL: { count: 0, total: 0 },
    };

    transactions.forEach((t) => {
      if (stats[t.paymentMethod]) {
        stats[t.paymentMethod].count += 1;
        stats[t.paymentMethod].total += t.amount;
      }
    });

    return stats;
  }, [transactions]);

  const chartData = [
    { name: 'Crédito', value: paymentStats.CREDIT_CARD.total, color: '#081E26' },
    { name: 'Débito', value: paymentStats.DEBIT_CARD.total, color: '#3B82F6' },
    { name: 'Pix', value: paymentStats.PIX.total, color: '#10B981' },
    { name: 'Presencial', value: paymentStats.PRESENTIAL.total, color: '#F59E0B' },
  ].filter(d => d.value > 0);

  const handleExportCSV = () => {
      const headers = ['ID', 'Data', 'Descricao', 'Tipo', 'Metodo', 'Valor', 'Barbeiro'];
      const rows = transactions.map(t => [t.id, t.date, t.description, t.type, t.paymentMethod, t.amount.toString(), t.barberId || '-']);
      
      let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `financeiro_barvo_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleLoadMore = () => {
      setLoadingMore(true);
      setTimeout(() => {
          setDisplayedTransactions(transactions); 
          setLoadingMore(false);
      }, 1000);
  };

  const SummaryCard: React.FC<{ label: string; value: number; count: number; icon: React.ReactNode; color: string }> = ({ label, value, count, icon, color }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{count} transações</span>
        </div>
        <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
            <h4 className="text-2xl font-black text-slate-900 tracking-tight">R$ {value.toLocaleString('pt-BR')}</h4>
        </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Financeiro & Recebíveis</h2>
            <p className="text-slate-500 mt-1">Visão estratégica de faturamento por modalidade.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
            <button onClick={() => setActiveTab('report')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'report' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>
                <PieChartIcon size={14} /> Relatório de Pagamentos
            </button>
            <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>
                <List size={14} /> Histórico Geral
            </button>
        </div>
      </div>

      {activeTab === 'report' && (
          <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <SummaryCard label="Cartão de Crédito" value={paymentStats.CREDIT_CARD.total} count={paymentStats.CREDIT_CARD.count} icon={<CreditCard size={20}/>} color="bg-slate-900 text-white" />
                  <SummaryCard label="Cartão de Débito" value={paymentStats.DEBIT_CARD.total} count={paymentStats.DEBIT_CARD.count} icon={<Landmark size={20}/>} color="bg-blue-50 text-blue-600" />
                  <SummaryCard label="Pagamento via Pix" value={paymentStats.PIX.total} count={paymentStats.PIX.count} icon={<Zap size={20}/>} color="bg-emerald-50 text-emerald-600" />
                  <SummaryCard label="Feito Presencial" value={paymentStats.PRESENTIAL.total} count={paymentStats.PRESENTIAL.count} icon={<Wallet size={20}/>} color="bg-amber-50 text-amber-600" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                      <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-2"><PieChartIcon size={20} className="text-blue-500" /> Mix de Pagamento</h3>
                      <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                  <Pie
                                      data={chartData}
                                      innerRadius={60}
                                      outerRadius={80}
                                      paddingAngle={5}
                                      dataKey="value"
                                  >
                                      {chartData.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={entry.color} />
                                      ))}
                                  </Pie>
                                  <RechartsTooltip />
                              </PieChart>
                          </ResponsiveContainer>
                      </div>
                      <div className="mt-6 space-y-3">
                          {chartData.map(item => (
                              <div key={item.name} className="flex justify-between items-center text-sm">
                                  <div className="flex items-center gap-2">
                                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                      <span className="font-medium text-slate-600">{item.name}</span>
                                  </div>
                                  <span className="font-bold text-slate-900">R$ {item.value.toFixed(2)}</span>
                              </div>
                          ))}
                      </div>
                  </div>

                  <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col">
                      <div className="flex justify-between items-center mb-8">
                          <h3 className="text-lg font-bold text-slate-800">Volume por Modalidade</h3>
                          <button onClick={handleExportCSV} className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
                              <Download size={14} /> Exportar Detalhado
                          </button>
                      </div>
                      <div className="flex-1 h-64">
                          <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={chartData}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold'}} />
                                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                                  <RechartsTooltip cursor={{fill: '#f8fafc'}} />
                                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                      {chartData.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={entry.color} />
                                      ))}
                                  </Bar>
                              </BarChart>
                          </ResponsiveContainer>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'history' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800">Todas as Transações</h3>
                <div className="flex gap-2">
                    <select className="bg-slate-50 border-none text-xs font-bold text-slate-600 rounded-lg px-3 py-2 focus:ring-0 cursor-pointer uppercase tracking-widest">
                        <option>Filtrar por Período</option>
                        <option>Hoje</option>
                        <option>Últimos 7 dias</option>
                        <option>Este Mês</option>
                    </select>
                    <button onClick={handleExportCSV} className="p-2 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-lg transition-colors"><Download size={18}/></button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                    <tr>
                    <th className="px-6 py-4">Data</th>
                    <th className="px-6 py-4">Descrição</th>
                    <th className="px-6 py-4">Método</th>
                    <th className="px-6 py-4">Responsável</th>
                    <th className="px-6 py-4 text-right">Valor</th>
                    <th className="px-6 py-4 text-right">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {displayedTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-slate-600 text-sm font-medium">{t.date}</td>
                        <td className="px-6 py-4 font-bold text-slate-800 text-sm">{t.description}</td>
                        <td className="px-6 py-4">
                            <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tighter ${
                                t.paymentMethod === 'CREDIT_CARD' ? 'text-slate-900' : 
                                t.paymentMethod === 'PIX' ? 'text-emerald-600' : 
                                t.paymentMethod === 'DEBIT_CARD' ? 'text-blue-600' : 'text-amber-600'
                            }`}>
                                {t.paymentMethod === 'CREDIT_CARD' && <CreditCard size={10}/>}
                                {t.paymentMethod === 'PIX' && <Zap size={10}/>}
                                {t.paymentMethod === 'DEBIT_CARD' && <Landmark size={10}/>}
                                {t.paymentMethod === 'PRESENTIAL' && <Smartphone size={10}/>}
                                {t.paymentMethod.replace('_CARD', '').replace('CREDIT', 'CRÉDITO').replace('DEBIT', 'DÉBITO')}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs font-bold">
                            {t.barberId ? 'Barbeiro ' + t.barberId.replace('u', '') : '-'}
                        </td>
                        <td className="px-6 py-4 text-right font-black text-slate-900 text-sm">R$ {t.amount.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right">
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 uppercase">Aprovado</span>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            
            {displayedTransactions.length < transactions.length && (
                <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
                    <button 
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="text-xs font-black text-blue-600 uppercase tracking-widest hover:text-blue-800 transition-colors flex items-center gap-2 mx-auto disabled:opacity-50"
                    >
                        {loadingMore ? <Loader2 size={16} className="animate-spin" /> : 'Ver mais registros'}
                    </button>
                </div>
            )}
          </div>
      )}
    </div>
  );
};
