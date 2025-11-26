import React, { useState } from 'react';
import { MOCK_INVENTORY } from '../constants';
import { Package, AlertTriangle, Search, Plus, DollarSign, Edit, Trash2, Filter, ShoppingCart, ArrowRight } from 'lucide-react';

export const Inventory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);
  
  const totalValue = MOCK_INVENTORY.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const lowStockItems = MOCK_INVENTORY.filter(item => item.quantity <= item.minLevel);

  const filteredItems = MOCK_INVENTORY.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterLowStock ? item.quantity <= item.minLevel : true;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Gestão de Estoque</h2>
            <p className="text-slate-500 mt-1">Controle produtos de venda e consumo interno.</p>
        </div>
        <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10 flex items-center gap-2">
            <Plus size={18} /> Novo Produto
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 group hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package size={24} />
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500">Total de Itens</p>
                <h3 className="text-2xl font-bold text-slate-800">{MOCK_INVENTORY.length}</h3>
            </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 group hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <DollarSign size={24} />
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500">Valor em Estoque</p>
                <h3 className="text-2xl font-bold text-slate-800">R$ {totalValue.toFixed(2)}</h3>
            </div>
        </div>
        <div 
            className={`p-6 rounded-2xl shadow-sm border flex items-center gap-4 group hover:shadow-md transition-all cursor-pointer ${lowStockItems.length > 0 ? 'bg-amber-50 border-amber-100' : 'bg-white border-slate-100'}`}
            onClick={() => setFilterLowStock(!filterLowStock)}
        >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${lowStockItems.length > 0 ? 'bg-amber-200 text-amber-700' : 'bg-slate-100 text-slate-400'}`}>
                <AlertTriangle size={24} />
            </div>
            <div>
                <p className={`text-sm font-medium ${lowStockItems.length > 0 ? 'text-amber-800' : 'text-slate-500'}`}>Estoque Baixo</p>
                <h3 className={`text-2xl font-bold ${lowStockItems.length > 0 ? 'text-amber-900' : 'text-slate-800'}`}>{lowStockItems.length} itens</h3>
            </div>
        </div>
      </div>

      {/* Low Stock Alert Banner */}
      {lowStockItems.length > 0 && !filterLowStock && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 animate-fade-in relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-full blur-2xl -mr-10 -mt-10 opacity-50"></div>
              
              <div className="flex justify-between items-center mb-4 relative z-10">
                  <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                      <AlertTriangle size={20} className="text-amber-600" /> Alerta de Reposição
                  </h3>
                  <button 
                    onClick={() => setFilterLowStock(true)}
                    className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 hover:underline"
                  >
                      Ver todos na lista <ArrowRight size={12} />
                  </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                  {lowStockItems.slice(0, 4).map(item => (
                      <div key={item.id} className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm flex flex-col justify-between">
                          <div>
                              <div className="flex justify-between items-start mb-2">
                                  <span className="text-xs font-bold text-slate-400 uppercase bg-slate-50 px-2 py-0.5 rounded">{item.category}</span>
                                  <span className="text-xs font-bold text-red-500">Crítico</span>
                              </div>
                              <h4 className="font-bold text-slate-800 text-sm truncate" title={item.name}>{item.name}</h4>
                          </div>
                          
                          <div className="mt-3">
                              <div className="flex justify-between text-xs mb-1">
                                  <span className="text-slate-500">Restam: <b className="text-slate-800">{item.quantity}</b></span>
                                  <span className="text-slate-400">Min: {item.minLevel}</span>
                              </div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-red-500 h-full rounded-full" style={{ width: `${(item.quantity / item.minLevel) * 50}%` }}></div>
                              </div>
                              <button className="w-full mt-3 py-1.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg hover:bg-amber-200 transition-colors flex items-center justify-center gap-1">
                                  <ShoppingCart size={12} /> Repor
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* Main List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center bg-white sticky top-0 z-20">
            <div className="relative flex-1 w-full">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Buscar produtos..." 
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button 
                onClick={() => setFilterLowStock(!filterLowStock)}
                className={`px-4 py-2 text-sm font-medium border rounded-lg flex items-center gap-2 transition-colors ${
                    filterLowStock 
                    ? 'bg-amber-50 text-amber-700 border-amber-200' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
            >
                <Filter size={16} className={filterLowStock ? "fill-amber-700" : ""} /> 
                {filterLowStock ? 'Vendo Estoque Baixo' : 'Filtrar'}
            </button>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <tr>
                        <th className="px-6 py-4">Produto</th>
                        <th className="px-6 py-4">Categoria</th>
                        <th className="px-6 py-4">Quantidade</th>
                        <th className="px-6 py-4">Preço Unit.</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredItems.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-6 py-4 font-medium text-slate-800">{item.name}</td>
                            <td className="px-6 py-4 text-slate-500 text-sm">
                                <span className="bg-slate-100 px-2 py-1 rounded text-xs font-semibold">{item.category}</span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-700">{item.quantity} un</span>
                                    {item.quantity <= item.minLevel && (
                                        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden hidden sm:block">
                                            <div className="h-full bg-red-500" style={{ width: `${Math.min((item.quantity / item.minLevel) * 100, 100)}%` }}></div>
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-slate-600">R$ {item.price.toFixed(2)}</td>
                            <td className="px-6 py-4">
                                {item.quantity <= item.minLevel ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                                        <AlertTriangle size={10} /> Repor ({item.quantity}/{item.minLevel})
                                    </span>
                                ) : (
                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                                        Em dia
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                        <Edit size={16} />
                                    </button>
                                    <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {filteredItems.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                                {filterLowStock 
                                    ? "Tudo certo! Nenhum produto com estoque baixo." 
                                    : "Nenhum produto encontrado na busca."}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};