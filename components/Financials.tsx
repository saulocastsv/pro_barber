
import React, { useState } from 'react';
import { MOCK_TRANSACTIONS } from '../constants';
import { DollarSign, TrendingDown, TrendingUp, Wallet, Download, Loader2 } from 'lucide-react';

export const Financials: React.FC = () => {
  const [loadingMore, setLoadingMore] = useState(false);
  const [displayedTransactions, setDisplayedTransactions] = useState(MOCK_TRANSACTIONS.slice(0, 5));

  const handleExportCSV = () => {
      const headers = ['ID', 'Data', 'Descricao', 'Tipo', 'Valor', 'Barbeiro'];
      const rows = MOCK_TRANSACTIONS.map(t => [t.id, t.date, t.description, t.type, t.amount.toString(), t.barberId || '-']);
      
      let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `financeiro_barberpro_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleLoadMore = () => {
      setLoadingMore(true);
      setTimeout(() => {
          setDisplayedTransactions(MOCK_TRANSACTIONS); // Load all mock
          setLoadingMore(false);
      }, 1000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
       <div className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Financeiro</h2>
            <p className="text-slate-500 mt-1">Controle total do fluxo de caixa e comissões.</p>
        </div>
        <div className="flex gap-2">
             <button 
                onClick={handleExportCSV}
                className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 active:scale-95"
             >
                <Download size={16} /> Exportar CSV
             </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Receita Total</p>
                <h3 className="text-2xl font-bold text-slate-800">R$ 15.450,00</h3>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-2 inline-block">+12% vs mês anterior</span>
            </div>
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                <TrendingUp size={24} />
            </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Despesas Operacionais</p>
                <h3 className="text-2xl font-bold text-slate-800">R$ 4.230,00</h3>
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full mt-2 inline-block">+5% vs mês anterior</span>
            </div>
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                <TrendingDown size={24} />
            </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Lucro Líquido</p>
                <h3 className="text-2xl font-bold text-slate-800">R$ 11.220,00</h3>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mt-2 inline-block">Margem de 72%</span>
            </div>
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <Wallet size={24} />
            </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">Histórico de Transações</h3>
            <select className="bg-slate-50 border-none text-sm text-slate-600 rounded-lg px-3 py-1 focus:ring-0 cursor-pointer">
                <option>Todos os tipos</option>
                <option>Serviços</option>
                <option>Produtos</option>
            </select>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <tr>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Responsável</th>
                <th className="px-6 py-4 text-right">Valor</th>
                <th className="px-6 py-4 text-right">Status</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {displayedTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-600 text-sm">{t.date}</td>
                    <td className="px-6 py-4 font-medium text-slate-800 text-sm">{t.description}</td>
                    <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${t.type === 'SERVICE' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                        {t.type === 'SERVICE' ? 'Serviço' : 'Produto'}
                    </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                        {t.barberId ? 'Barbeiro ' + t.barberId.replace('u', '') : '-'}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-700 text-sm">R$ {t.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 uppercase">Pago</span>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        
        {displayedTransactions.length < MOCK_TRANSACTIONS.length && (
            <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
                <button 
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="text-sm text-blue-600 font-medium hover:text-blue-800 transition-colors flex items-center gap-2 mx-auto disabled:opacity-50"
                >
                    {loadingMore ? <Loader2 size={16} className="animate-spin" /> : 'Carregar mais transações'}
                </button>
            </div>
        )}
      </div>
    </div>
  );
};
