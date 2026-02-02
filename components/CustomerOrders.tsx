
import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';
import { Package, Truck, CheckCircle, Clock, ShoppingBag, ArrowRight, MessageSquare, ChevronRight, MapPin, RefreshCw, AlertCircle } from 'lucide-react';

interface CustomerOrdersProps {
  orders: Order[];
  onNavigate: (view: string) => void;
  onRepeatOrder: (order: Order) => void;
}

const statusMap: Record<OrderStatus, { label: string; color: string; step: number }> = {
    'PENDING_PAYMENT': { label: 'Aguardando Pagamento', color: 'text-amber-500', step: 0 },
    'PAID': { label: 'Pagamento Confirmado', color: 'text-blue-500', step: 1 },
    'PREPARING': { label: 'Em Preparação', color: 'text-indigo-500', step: 2 },
    'READY_FOR_PICKUP': { label: 'Pronto para Retirada', color: 'text-emerald-500', step: 3 },
    'SHIPPED': { label: 'Em Transporte', color: 'text-purple-500', step: 3 },
    'DELIVERED': { label: 'Entregue', color: 'text-emerald-600', step: 4 },
    'CANCELLED': { label: 'Cancelado', color: 'text-red-500', step: -1 },
};

export const CustomerOrders: React.FC<CustomerOrdersProps> = ({ orders, onNavigate, onRepeatOrder }) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const getStepStatus = (currentStep: number, targetStep: number) => {
    if (currentStep >= targetStep) return 'bg-brand-dark text-white';
    return 'bg-slate-100 text-slate-400';
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Meus Pedidos</h2>
          <p className="text-xs text-slate-500 font-medium">Acompanhe suas compras na loja Barvo.</p>
        </div>
        <button onClick={() => onNavigate('shop')} className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
          <ShoppingBag size={14} /> Ir para a loja
        </button>
      </div>

      <div className="grid gap-4">
        {orders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                <Package size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-400 font-medium text-sm">Você ainda não fez nenhum pedido.</p>
            </div>
        ) : orders.map(order => {
          const statusInfo = statusMap[order.status];
          const isExpanded = selectedOrderId === order.id;

          return (
            <div key={order.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
              <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer" onClick={() => setSelectedOrderId(isExpanded ? null : order.id)}>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${statusInfo.step === 4 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-brand-dark'}`}>
                    <Package size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800 text-sm">Pedido #{order.id.slice(-6).toUpperCase()}</h3>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${statusInfo.color.replace('text', 'bg')}/10 ${statusInfo.color}`}>
                            {statusInfo.label}
                        </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Realizado em {new Date(order.createdAt).toLocaleDateString('pt-BR')} • {order.items.reduce((acc, i) => acc + i.quantity, 0)} itens</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                   <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Total</p>
                      <p className="text-sm font-black text-slate-900">R$ {order.totalAmount.toFixed(2)}</p>
                   </div>
                   <ChevronRight size={20} className={`text-slate-300 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </div>
              </div>

              {isExpanded && (
                <div className="px-5 pb-6 pt-2 border-t border-slate-50 bg-slate-50/30 animate-fade-in">
                  
                  {/* Status Stepper */}
                  <div className="py-8 px-4 flex justify-between relative max-w-lg mx-auto">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
                    {[
                      { icon: Clock, label: 'Pagamento' },
                      { icon: ShoppingBag, label: 'Preparo' },
                      { icon: Truck, label: order.deliveryMethod === 'PICKUP' ? 'Retirada' : 'Transporte' },
                      { icon: CheckCircle, label: 'Concluído' }
                    ].map((step, idx) => (
                      <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-all ${getStepStatus(statusInfo.step, idx + 1)}`}>
                          <step.icon size={14} />
                        </div>
                        <span className={`text-[8px] font-black uppercase tracking-tighter ${statusInfo.step >= idx + 1 ? 'text-brand-dark' : 'text-slate-400'}`}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                    {/* Itens */}
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resumo dos Itens</p>
                      <div className="space-y-3">
                        {order.items.map(item => (
                          <div key={item.cartId} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-3">
                                <img src={item.images[0]} className="w-10 h-10 rounded-lg object-cover" />
                                <div>
                                  <p className="text-xs font-bold text-slate-800">{item.name}</p>
                                  <p className="text-[10px] text-slate-400">{item.quantity}x R$ {item.price.toFixed(2)}</p>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-slate-900">R$ {(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Entrega / Logística */}
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logística & Rastreio</p>
                      <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-4">
                        <div className="flex items-start gap-3">
                            <MapPin size={16} className="text-slate-400 mt-0.5" />
                            <div>
                                <p className="text-xs font-bold text-slate-800">{order.deliveryMethod === 'PICKUP' ? 'Retirada na Loja Augusta' : 'Entrega no Endereço'}</p>
                                <p className="text-[10px] text-slate-400 leading-relaxed">Rua Augusta, 1500 - Consolação, São Paulo - SP</p>
                            </div>
                        </div>

                        {order.trackingCode && (
                          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[9px] font-black text-blue-700 uppercase">Código de Rastreio</span>
                                <span className="text-[10px] font-bold text-blue-900">{order.trackingCode}</span>
                            </div>
                            <button className="w-full py-2 bg-blue-600 text-white text-[10px] font-bold rounded-lg hover:bg-blue-700 transition-colors uppercase tracking-widest">Ver Mapa de Entrega</button>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                           <button onClick={() => onRepeatOrder(order)} className="flex-1 py-3 bg-slate-900 text-white text-[10px] font-black uppercase rounded-lg shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all">
                              <RefreshCw size={14} /> Repetir Pedido
                           </button>
                           <button className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 text-[10px] font-black uppercase rounded-lg flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                              <MessageSquare size={14} /> Suporte
                           </button>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
