
import React, { useState } from 'react';
import { Order, OrderStatus, User } from '../types';
import { 
  Search, Filter, Package, Truck, CheckCircle, Clock, AlertTriangle, 
  ChevronRight, X, User as UserIcon, DollarSign, ExternalLink, 
  MoreVertical, Plus, Phone, Mail, Award, History, MapPin, 
  ShoppingBag, ClipboardList, Zap 
} from 'lucide-react';

interface OrderManagementProps {
  orders: Order[];
  users: User[];
  onUpdateStatus: (orderId: string, status: OrderStatus, trackingCode?: string) => void;
  onNavigate: (view: string) => void;
}

export const OrderManagement: React.FC<OrderManagementProps> = ({ orders, users, onUpdateStatus, onNavigate }) => {
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newTrackingCode, setNewTrackingCode] = useState('');

  const filteredOrders = orders.filter(o => {
    const matchesFilter = filter === 'ALL' || o.status === filter;
    const matchesSearch = o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || o.id.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: OrderStatus, method: 'PICKUP' | 'DELIVERY') => {
    switch(status) {
        case 'PAID': return <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded uppercase">Pago</span>;
        case 'PREPARING': return <span className="bg-blue-100 text-blue-700 text-[9px] font-black px-2 py-0.5 rounded uppercase">Preparando</span>;
        case 'READY_FOR_PICKUP': return <span className="bg-indigo-100 text-indigo-700 text-[9px] font-black px-2 py-0.5 rounded uppercase">Pronto p/ Retirada</span>;
        case 'SHIPPED': return <span className="bg-purple-100 text-purple-700 text-[9px] font-black px-2 py-0.5 rounded uppercase">{method === 'DELIVERY' ? 'Saiu p/ Entrega' : 'Despachado'}</span>;
        case 'DELIVERED': return <span className="bg-slate-100 text-slate-500 text-[9px] font-black px-2 py-0.5 rounded uppercase">Concluído</span>;
        case 'CANCELLED': return <span className="bg-red-100 text-red-700 text-[9px] font-black px-2 py-0.5 rounded uppercase">Cancelado</span>;
        default: return <span className="bg-slate-100 text-slate-400 text-[9px] font-black px-2 py-0.5 rounded uppercase">Pendente</span>;
    }
  };

  const handleUpdate = (status: OrderStatus) => {
      if (selectedOrder) {
          onUpdateStatus(selectedOrder.id, status, newTrackingCode || undefined);
          setSelectedOrder(null);
          setNewTrackingCode('');
      }
  };

  const getCustomerData = (customerId: string) => {
      return users.find(u => u.id === customerId);
  };

  const getCustomerOrderCount = (customerId: string) => {
      return orders.filter(o => o.customerId === customerId).length;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-100 pb-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <Package className="text-blue-500" /> Gestão de Pedidos
            </h2>
            <p className="text-xs text-slate-500 font-medium">Controle de faturamento e logística da loja.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por cliente ou ID..." 
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
          </div>
          <select 
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 outline-none cursor-pointer"
            value={filter}
            onChange={e => setFilter(e.target.value as any)}
          >
              <option value="ALL">Todos Status</option>
              <option value="PAID">Pagos (Novos)</option>
              <option value="PREPARING">Em Preparo</option>
              <option value="SHIPPED">Em Rota / Enviados</option>
              <option value="DELIVERED">Entregues</option>
          </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                      <tr>
                          <th className="px-6 py-4 text-center w-20">ID</th>
                          <th className="px-6 py-4">Cliente</th>
                          <th className="px-6 py-4">Itens</th>
                          <th className="px-6 py-4">Tipo</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Valor</th>
                          <th className="px-6 py-4 text-center">Ações</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {filteredOrders.length === 0 ? (
                          <tr><td colSpan={7} className="px-6 py-10 text-center text-slate-400 text-sm font-medium italic">Nenhum pedido encontrado no momento.</td></tr>
                      ) : filteredOrders.map(order => (
                          <tr key={order.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => setSelectedOrder(order)}>
                              <td className="px-6 py-4 text-center font-mono text-[10px] text-slate-400">#{order.id.slice(-6).toUpperCase()}</td>
                              <td className="px-6 py-4">
                                  <p className="font-bold text-slate-800 text-sm">{order.customerName}</p>
                                  <p className="text-[10px] text-slate-400">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
                              </td>
                              <td className="px-6 py-4">
                                  <div className="flex -space-x-2">
                                      {order.items.slice(0, 3).map((item, idx) => (
                                          <img key={idx} src={item.images[0]} className="w-7 h-7 rounded-lg border-2 border-white object-cover shadow-sm" title={item.name} />
                                      ))}
                                      {order.items.length > 3 && (
                                          <div className="w-7 h-7 rounded-lg bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-500">+{order.items.length - 3}</div>
                                      )}
                                  </div>
                              </td>
                              <td className="px-6 py-4">
                                  <span className={`text-[10px] font-bold uppercase tracking-tighter flex items-center gap-1 ${order.deliveryMethod === 'DELIVERY' ? 'text-amber-600' : 'text-slate-500'}`}>
                                      {order.deliveryMethod === 'PICKUP' ? <ShoppingBag size={12}/> : <Truck size={12}/>}
                                      {order.deliveryMethod === 'PICKUP' ? 'Retirada' : 'Entrega'}
                                  </span>
                              </td>
                              <td className="px-6 py-4">{getStatusBadge(order.status, order.deliveryMethod)}</td>
                              <td className="px-6 py-4 text-right font-black text-slate-900 text-sm">R$ {order.totalAmount.toFixed(2)}</td>
                              <td className="px-6 py-4 text-center">
                                  <button onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-90">
                                      <MoreVertical size={16} />
                                  </button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>

      {/* Modal Detalhes e Ação */}
      {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-100 animate-slide-in flex flex-col md:flex-row h-full md:h-auto max-h-[90vh]">
                  
                  {/* Sidebar Esquerda: Info do Cliente */}
                  <div className="w-full md:w-72 bg-slate-50 border-r border-slate-100 p-6 flex flex-col">
                      <div className="flex justify-between items-center mb-6">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Informações do Cliente</span>
                          <button onClick={() => setSelectedOrder(null)} className="md:hidden p-2"><X size={20}/></button>
                      </div>

                      {(() => {
                          const customer = getCustomerData(selectedOrder.customerId);
                          const totalOrders = getCustomerOrderCount(selectedOrder.customerId);
                          return (
                              <div className="space-y-6">
                                  <div className="flex items-center gap-4">
                                      <img src={customer?.avatar || 'https://picsum.photos/100/100'} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm" alt="Avatar" />
                                      <div>
                                          <p className="font-bold text-slate-800 text-sm leading-tight">{selectedOrder.customerName}</p>
                                          <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase">{customer?.membershipId ? 'Clube Barvo' : 'Cliente Avulso'}</p>
                                      </div>
                                  </div>

                                  <div className="space-y-3">
                                      <div className="flex items-center gap-3 text-xs text-slate-600">
                                          <Phone size={14} className="text-slate-400" />
                                          <span className="font-medium">{customer?.phone || '(11) 99999-0000'}</span>
                                      </div>
                                      <div className="flex items-center gap-3 text-xs text-slate-600">
                                          <Mail size={14} className="text-slate-400" />
                                          <span className="truncate font-medium">{customer?.email || 'cliente@email.com'}</span>
                                      </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2">
                                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                          <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Pontos</p>
                                          <p className="text-sm font-black text-amber-600 flex items-center gap-1">
                                              <Award size={12}/> {customer?.points || 0}
                                          </p>
                                      </div>
                                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                          <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Pedidos</p>
                                          <p className="text-sm font-black text-slate-800 flex items-center gap-1">
                                              <History size={12}/> {totalOrders}
                                          </p>
                                      </div>
                                  </div>

                                  {selectedOrder.deliveryMethod === 'DELIVERY' && (
                                      <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                                          <p className="text-[9px] font-black text-amber-700 uppercase mb-2 flex items-center gap-1"><MapPin size={10}/> Endereço p/ Entrega</p>
                                          <p className="text-[10px] text-amber-900 leading-relaxed font-bold">Rua das Flores, 123 - Ap 42<br/>Jardim Paulista, São Paulo - SP</p>
                                      </div>
                                  )}
                              </div>
                          );
                      })()}

                      <div className="mt-auto pt-6 border-t border-slate-200 hidden md:block">
                          <button 
                            onClick={() => { onNavigate('crm'); setSelectedOrder(null); }}
                            className="w-full py-3 bg-brand-dark text-white rounded-xl text-[10px] font-black uppercase hover:bg-black transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg"
                          >
                              <ClipboardList size={14}/> Ver CRM Completo
                          </button>
                      </div>
                  </div>

                  {/* Lado Direito: Detalhes do Pedido & Ações */}
                  <div className="flex-1 flex flex-col bg-white">
                      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                          <div>
                              <h3 className="text-lg font-bold text-slate-800">Pedido #{selectedOrder.id.slice(-6).toUpperCase()}</h3>
                              <p className="text-xs text-slate-500 font-medium">Logística e Controle Financeiro</p>
                          </div>
                          <button onClick={() => setSelectedOrder(null)} className="p-2 text-slate-400 hover:text-slate-800 transition-colors hidden md:block"><X/></button>
                      </div>

                      <div className="p-6 flex-1 overflow-y-auto space-y-8 custom-scrollbar">
                          {/* Status Indicator */}
                          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                              <div className="p-3 bg-brand-dark text-white rounded-xl">
                                  <Package size={20}/>
                              </div>
                              <div className="flex-1">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado Atual</p>
                                  <div className="mt-1">{getStatusBadge(selectedOrder.status, selectedOrder.deliveryMethod)}</div>
                              </div>
                              <div className="text-right">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pagamento</p>
                                  <p className="text-xs font-black text-slate-800 uppercase">{selectedOrder.paymentMethod === 'PIX' ? 'Instantâneo' : 'Crédito'}</p>
                              </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              {/* Gestão Logística */}
                              <div className="space-y-4">
                                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Processamento</h4>
                                  <div className="grid grid-cols-1 gap-2">
                                      <button onClick={() => handleUpdate('PREPARING')} className="w-full py-3.5 bg-white border border-slate-200 rounded-xl text-[11px] font-black uppercase text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-all flex items-center justify-center gap-2">
                                          <Clock size={14}/> Iniciar Preparo
                                      </button>
                                      
                                      {selectedOrder.deliveryMethod === 'PICKUP' ? (
                                          <button onClick={() => handleUpdate('READY_FOR_PICKUP')} className="w-full py-3.5 bg-indigo-600 text-white rounded-xl text-[11px] font-black uppercase hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/10">
                                              <ShoppingBag size={14}/> Pronto p/ Retirada
                                          </button>
                                      ) : (
                                          <button onClick={() => handleUpdate('SHIPPED')} className="w-full py-3.5 bg-purple-600 text-white rounded-xl text-[11px] font-black uppercase hover:bg-purple-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-purple-500/10">
                                              <Truck size={14}/> Saiu para Entrega
                                          </button>
                                      )}

                                      <button onClick={() => handleUpdate('DELIVERED')} className="w-full py-3.5 bg-emerald-600 text-white rounded-xl text-[11px] font-black uppercase hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                                          <CheckCircle size={14}/> Confirmar Conclusão
                                      </button>
                                      
                                      <button onClick={() => handleUpdate('CANCELLED')} className="w-full py-3 bg-white border border-red-100 text-red-500 rounded-xl text-[11px] font-black uppercase hover:bg-red-50 transition-all flex items-center justify-center gap-2">
                                          <AlertTriangle size={14}/> Cancelar Pedido
                                      </button>
                                  </div>

                                  {selectedOrder.deliveryMethod === 'DELIVERY' && (
                                      <div className="pt-4 space-y-2">
                                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Código de Rastreio</label>
                                          <div className="flex gap-2">
                                              <input 
                                                type="text" 
                                                placeholder="Ex: BR123..." 
                                                className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-blue-500"
                                                value={newTrackingCode}
                                                onChange={e => setNewTrackingCode(e.target.value)}
                                              />
                                              <button onClick={() => handleUpdate(selectedOrder.status)} className="p-3 bg-slate-900 text-white rounded-xl hover:bg-black transition-all">
                                                  <Zap size={16}/>
                                              </button>
                                          </div>
                                      </div>
                                  )}
                              </div>

                              {/* Resumo Financeiro & Itens */}
                              <div className="space-y-6">
                                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Análise Financeira</p>
                                      <div className="space-y-2">
                                          <div className="flex justify-between text-xs font-bold text-slate-500"><span>Venda Bruta</span><span>R$ {selectedOrder.totalAmount.toFixed(2)}</span></div>
                                          <div className="flex justify-between text-xs font-bold text-slate-500"><span>Taxa Adquirente</span><span>- R$ {(selectedOrder.totalAmount * 0.05).toFixed(2)}</span></div>
                                          <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-slate-900">
                                              <span className="font-black text-[10px] uppercase">Líquido Estimado</span>
                                              <span className="text-xl font-black">R$ {(selectedOrder.totalAmount * 0.95).toFixed(2)}</span>
                                          </div>
                                      </div>
                                  </div>

                                  <div className="space-y-3">
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Carrinho ({selectedOrder.items.length})</p>
                                      <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                          {selectedOrder.items.map(item => (
                                              <div key={item.cartId} className="flex justify-between items-center p-2.5 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100">
                                                  <div className="flex items-center gap-3">
                                                      <img src={item.images[0]} className="w-10 h-10 rounded-lg object-cover shadow-sm" />
                                                      <div>
                                                          <p className="text-xs font-black text-slate-800">{item.quantity}x {item.name}</p>
                                                          <p className="text-[9px] text-slate-400 uppercase font-bold">{item.category}</p>
                                                      </div>
                                                  </div>
                                                  <span className="font-black text-slate-900 text-xs">R$ {(item.price * item.quantity).toFixed(2)}</span>
                                              </div>
                                          ))}
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
