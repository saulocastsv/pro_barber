
import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_STORE_PRODUCTS, LOYALTY_RULES } from '../constants';
import { StoreProduct, CartItem, User, InventoryItem } from '../types';
import { 
  ShoppingBag, Plus, Minus, ShoppingCart, X, Gift, 
  Trash2, Check, CreditCard, Loader2, ArrowRight, CheckCircle, 
  ShieldCheck, Zap, Copy, Timer, Star 
} from 'lucide-react';

interface ShopProps {
  currentUser: User;
  inventory: InventoryItem[];
  onPurchase: (cartItems: CartItem[], totalPaid: number, pointsUsed: boolean, pointsDiscount: number) => boolean;
}

export const Shop: React.FC<ShopProps> = ({ currentUser, inventory, onPurchase }) => {
  const CART_STORAGE_KEY = `barberpro_cart_${currentUser.id}`;

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart, CART_STORAGE_KEY]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastOrderDetails, setLastOrderDetails] = useState<{total: number, pointsEarned: number} | null>(null);
  
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [usePoints, setUsePoints] = useState(false);

  // --- CHECKOUT STATE ---
  const [paymentMode, setPaymentMode] = useState<'SAVED_CARD' | 'NEW_CARD' | 'PIX' | 'GENERATING_PIX' | 'PIX_DISPLAY'>('SAVED_CARD');
  const [selectedCardId, setSelectedCardId] = useState<string>(currentUser.paymentMethods?.find(m => m.isDefault)?.id || currentUser.paymentMethods?.[0]?.id || '');
  const [newCardData, setNewCardData] = useState({ number: '', expiry: '', cvc: '', name: '' });
  const [pixTimer, setPixTimer] = useState(300);

  useEffect(() => {
    if (paymentMode === 'PIX_DISPLAY' && pixTimer > 0) {
      const timer = setInterval(() => setPixTimer(t => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [paymentMode, pixTimer]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const allProducts = useMemo(() => {
    const internalCategories = ['Lavatório', 'Bar']; 
    const inventoryAsStoreProducts: StoreProduct[] = inventory
        .filter(item => !internalCategories.includes(item.category))
        .map(item => ({
            id: `inv_${item.id}`,
            name: item.name,
            description: `Produto premium disponível para retirada imediata na Barvo.`,
            price: item.price,
            category: item.category,
            images: ['https://images.unsplash.com/photo-1585232561307-3f8d407c95b4?auto=format&fit=crop&q=80&w=600'], 
            rating: 5.0,
            reviewsCount: 0,
            inStock: item.quantity > 0,
            variations: ['Padrão'] 
        }));
    return [...MOCK_STORE_PRODUCTS, ...inventoryAsStoreProducts];
  }, [inventory]);

  const categories = ['Todos', ...Array.from(new Set(allProducts.map(p => p.category)))];
  const filteredProducts = categoryFilter === 'Todos' ? allProducts : allProducts.filter(p => p.category === categoryFilter);

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const currentPoints = currentUser.points || 0;
  const maxDiscount = currentPoints / LOYALTY_RULES.DISCOUNT_CONVERSION_RATE;
  const discount = usePoints ? Math.min(maxDiscount, cartTotal * 0.5) : 0; 
  const finalTotal = cartTotal - discount;

  const addToCart = (product: StoreProduct) => {
    const existingIndex = cart.findIndex(c => c.id === product.id);
    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      setCart(newCart);
    } else {
      const newItem: CartItem = {
        ...product,
        cartId: `${product.id}-${Date.now()}`,
        selectedVariation: 'Padrão',
        quantity: 1
      };
      setCart([...cart, newItem]);
    }
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.cartId === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMode === 'PIX') {
      setPaymentMode('GENERATING_PIX');
      setTimeout(() => setPaymentMode('PIX_DISPLAY'), 1500);
    } else {
      handleFinalizePurchase();
    }
  };

  const handleFinalizePurchase = () => {
      setIsProcessingCheckout(true);
      const pointsDiscount = usePoints ? discount : 0;
      const success = onPurchase(cart, finalTotal, usePoints, pointsDiscount);

      if (!success) {
          setIsProcessingCheckout(false);
          return;
      }

      const pointsEarned = !usePoints ? Math.floor(finalTotal * LOYALTY_RULES.POINTS_PER_CURRENCY) : 0;

      setTimeout(() => {
          setIsProcessingCheckout(false);
          setIsCheckoutModalOpen(false);
          setLastOrderDetails({ total: finalTotal, pointsEarned });
          setShowSuccessModal(true);
          setCart([]); 
          setUsePoints(false);
          setPaymentMode('SAVED_CARD');
      }, 2000);
  };

  return (
    <div className="relative h-full pb-20">
      {/* Header Loja - Otimizado Mobile */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 animate-fade-in">
        <div className="px-1">
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                <ShoppingBag className="text-brand-dark" size={26} /> Loja Barvo
            </h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1 opacity-60">Cuidados Premium</p>
        </div>
        <button 
          onClick={() => setIsCartOpen(true)} 
          className="w-full md:w-auto flex bg-brand-dark text-white px-5 py-3.5 rounded-2xl hover:bg-black transition-all shadow-xl items-center justify-center gap-3 relative active:scale-95"
        >
            <ShoppingCart size={20} />
            <span className="font-bold text-sm uppercase tracking-widest">Carrinho</span>
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-lg">
                {cart.reduce((acc, i) => acc + i.quantity, 0)}
              </span>
            )}
        </button>
      </div>

      {/* Categorias - Estilo Scroll Horizontal Touch Friendly */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar scroll-smooth">
          {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => setCategoryFilter(cat)} 
                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-2 ${categoryFilter === cat ? 'bg-brand-dark text-white border-brand-dark shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}
              >
                {cat}
              </button>
          ))}
      </div>

      {/* Grade de Produtos - 2 colunas Mobile para melhor densidade */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 animate-fade-in">
          {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-2xl md:rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl transition-all group flex flex-col active:scale-[0.98]">
                  <div className="relative aspect-square overflow-hidden bg-slate-50">
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
                          <span className="bg-slate-800 text-white px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest">Esgotado</span>
                        </div>
                      )}
                      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm">
                        <Star size={10} className="text-amber-500 fill-amber-500" />
                        <span className="text-[9px] font-black text-slate-800">{product.rating}</span>
                      </div>
                  </div>
                  <div className="p-3 md:p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-slate-800 text-xs md:text-base mb-2 leading-tight line-clamp-2 min-h-[2rem]">{product.name}</h3>
                      
                      <div className="flex items-center justify-between mt-auto">
                          <span className="text-sm md:text-lg font-black text-brand-dark leading-none">R$ {product.price.toFixed(2)}</span>
                          <button 
                            onClick={() => addToCart(product)} 
                            disabled={!product.inStock} 
                            className="bg-slate-100 text-brand-dark p-2 md:p-3 rounded-xl active:bg-brand-dark active:text-white transition-all disabled:opacity-30"
                          >
                            <Plus size={18} />
                          </button>
                      </div>
                  </div>
              </div>
          ))}
      </div>

      {/* Cart Drawer Otimizado p/ Mobile */}
      {isCartOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
              <div className="relative w-full md:max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                      <div>
                        <h3 className="text-lg font-black text-slate-800 tracking-tighter flex items-center gap-2">
                          <ShoppingCart size={22} className="text-brand-dark" /> Carrinho
                        </h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{cart.length} itens</p>
                      </div>
                      <button onClick={() => setIsCartOpen(false)} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                        <X size={22} />
                      </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
                      {cart.length === 0 ? (
                        <div className="text-center py-20 flex flex-col items-center">
                          <ShoppingBag size={48} className="text-slate-200 mb-4" />
                          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Seu carrinho está vazio</p>
                        </div>
                      ) : cart.map(item => (
                          <div key={item.cartId} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex gap-3 items-center">
                              <img src={item.images[0]} className="w-16 h-16 rounded-xl object-cover border border-slate-50" />
                              <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-slate-800 text-[11px] truncate leading-tight mb-1">{item.name}</h4>
                                  <p className="text-sm font-black text-brand-dark mb-2">R$ {item.price.toFixed(2)}</p>
                                  
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                                      <button onClick={() => updateCartQuantity(item.cartId, -1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm active:scale-90"><Minus size={14} /></button>
                                      <span className="w-8 text-center text-xs font-black text-slate-800">{item.quantity}</span>
                                      <button onClick={() => updateCartQuantity(item.cartId, 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm active:scale-90"><Plus size={14} /></button>
                                    </div>
                                    <button 
                                      onClick={() => setCart(cart.filter(c => c.cartId !== item.cartId))} 
                                      className="p-2 text-slate-300 hover:text-red-500"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>

                  <div className="p-5 bg-white border-t border-slate-100 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] pb-10 md:pb-5">
                      <div className="flex justify-between items-center mb-5">
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Subtotal</span>
                        <span className="text-2xl font-black text-brand-dark">R$ {cartTotal.toFixed(2)}</span>
                      </div>
                      <button 
                        onClick={() => { setIsCartOpen(false); setIsCheckoutModalOpen(true); }} 
                        disabled={cart.length === 0} 
                        className="w-full bg-brand-dark text-white font-black py-4 rounded-2xl shadow-xl active:scale-[0.98] transition-all text-xs uppercase tracking-widest disabled:opacity-30 flex items-center justify-center gap-2"
                      >
                        Checkout Seguro <ArrowRight size={16} />
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Checkout e Sucesso Modals permanecem conforme os arquivos originais mas com melhorias de padding mobile via App.tsx */}
      {isCheckoutModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-fade-in overflow-y-auto p-2">
              <div className="w-full max-w-5xl h-auto md:min-h-0 flex flex-col md:flex-row relative bg-white rounded-[2.5rem] md:rounded-[3rem] shadow-2xl overflow-hidden">
                  <button onClick={() => setIsCheckoutModalOpen(false)} className="absolute top-5 right-5 z-50 p-2.5 text-slate-400 hover:text-slate-800 bg-slate-100 rounded-full transition-colors">
                      <X size={20} />
                  </button>

                  <div className="w-full md:w-1/2 p-6 md:p-16 bg-white flex flex-col justify-center border-r border-slate-50">
                      <div className="max-w-md w-full mx-auto">
                          <div className="flex items-center gap-2 mb-4 text-brand-dark/40 font-bold text-[10px] uppercase tracking-widest">
                              <ShieldCheck size={18}/> <span>Checkout 100% Seguro</span>
                          </div>

                          <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-6 md:mb-8 tracking-tighter">Pagamento</h2>
                          
                          <div className="flex gap-1 mb-6 bg-slate-50 p-1 rounded-xl">
                              {['SAVED_CARD', 'NEW_CARD', 'PIX'].map((mode) => (
                                <button 
                                  key={mode}
                                  onClick={() => setPaymentMode(mode as any)}
                                  className={`flex-1 py-2.5 text-[9px] md:text-[10px] font-black uppercase rounded-lg transition-all ${paymentMode === mode ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400'}`}
                                >
                                    {mode === 'SAVED_CARD' ? 'Cartão' : mode === 'NEW_CARD' ? 'Novo' : 'Pix'}
                                </button>
                              ))}
                          </div>

                          {paymentMode === 'GENERATING_PIX' ? (
                              <div className="text-center py-10 animate-pulse">
                                  <Loader2 className="animate-spin mx-auto text-emerald-500 mb-4" size={40} />
                                  <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Gerando Pix...</p>
                              </div>
                          ) : paymentMode === 'PIX_DISPLAY' ? (
                              <div className="space-y-4 animate-fade-in">
                                  <div className="bg-slate-50 p-6 md:p-8 rounded-[2rem] border-2 border-emerald-100 flex flex-col items-center">
                                      <div className="bg-white p-3 rounded-[1.5rem] shadow-xl mb-4">
                                          <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BARVO_PIX_MOCK" className="w-32 h-32 md:w-40 md:h-40" alt="QR Pix" />
                                      </div>
                                      <div className="flex items-center gap-2 text-emerald-600 font-black">
                                          <Timer size={18} /> <span className="text-lg">{formatTimer(pixTimer)}</span>
                                      </div>
                                  </div>
                                  <button onClick={handleFinalizePurchase} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">Já paguei via Pix</button>
                              </div>
                          ) : (
                              <form className="space-y-5" onSubmit={handleCheckoutSubmit}>
                                  {paymentMode === 'SAVED_CARD' && (
                                      <div className="space-y-2">
                                          {currentUser.paymentMethods?.map(method => (
                                              <button 
                                                key={method.id} 
                                                type="button"
                                                onClick={() => setSelectedCardId(method.id)}
                                                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${selectedCardId === method.id ? 'border-brand-dark bg-slate-50' : 'border-slate-100 bg-white'}`}
                                              >
                                                  <div className="flex items-center gap-3">
                                                      <img src={`https://img.icons8.com/color/48/${method.brand}.png`} className="h-5" />
                                                      <span className="text-xs font-black text-slate-800">•••• {method.last4}</span>
                                                  </div>
                                                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedCardId === method.id ? 'border-brand-dark bg-brand-dark' : 'border-slate-200'}`}>
                                                      {selectedCardId === method.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                                  </div>
                                              </button>
                                          ))}
                                      </div>
                                  )}

                                  {paymentMode === 'NEW_CARD' && (
                                      <div className="space-y-3 animate-fade-in">
                                          <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                                              <div className="p-4 border-b border-slate-200 flex items-center gap-3">
                                                  <CreditCard size={18} className="text-slate-400" />
                                                  <input required placeholder="Número do cartão" className="bg-transparent outline-none text-xs w-full font-bold" value={newCardData.number} onChange={e => setNewCardData({...newCardData, number: e.target.value})} />
                                              </div>
                                              <div className="flex divide-x divide-slate-200">
                                                  <input required placeholder="MM/AA" className="bg-transparent outline-none p-4 text-xs w-1/2 font-bold" value={newCardData.expiry} onChange={e => setNewCardData({...newCardData, expiry: e.target.value})} />
                                                  <input required placeholder="CVC" className="bg-transparent outline-none p-4 text-xs w-1/2 font-bold" value={newCardData.cvc} onChange={e => setNewCardData({...newCardData, cvc: e.target.value})} />
                                              </div>
                                          </div>
                                      </div>
                                  )}

                                  <div className="pt-2">
                                      <button 
                                        type="button" 
                                        onClick={() => setUsePoints(!usePoints)}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${usePoints ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100'}`}
                                      >
                                          <div className="flex items-center gap-3">
                                              <Gift size={18} className={usePoints ? 'text-blue-600' : 'text-slate-400'} />
                                              <div className="text-left">
                                                  <span className="block font-black text-[10px] text-slate-800 uppercase tracking-widest">Usar Fidelidade</span>
                                                  <span className="text-[9px] text-slate-400 font-bold">Saldo: {currentPoints} pts</span>
                                              </div>
                                          </div>
                                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${usePoints ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                                              {usePoints && <Check size={12} className="text-white" strokeWidth={4} />}
                                          </div>
                                      </button>
                                  </div>

                                  <button 
                                    type="submit" 
                                    disabled={isProcessingCheckout || (paymentMode === 'SAVED_CARD' && !selectedCardId && !!currentUser.paymentMethods?.length)} 
                                    className={`w-full ${paymentMode === 'PIX' ? 'bg-emerald-600' : 'bg-brand-dark'} text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-2xl transition-all disabled:opacity-50 active:scale-95`}
                                  >
                                      {isProcessingCheckout ? <Loader2 className="animate-spin mx-auto" size={20} /> : (paymentMode === 'PIX' ? 'Gerar Qr Code Pix' : `Pagar R$ ${finalTotal.toFixed(2)}`)}
                                  </button>
                              </form>
                          )}
                      </div>
                  </div>

                  {/* Lado Direito Resumo - Minimalista Mobile */}
                  <div className="hidden md:flex w-1/2 p-16 bg-slate-50 flex-col justify-center">
                      <div className="max-w-sm w-full mx-auto">
                          <h3 className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-10">Resumo</h3>
                          <div className="space-y-6 max-h-[30vh] overflow-y-auto pr-4 custom-scrollbar mb-10">
                              {cart.map(item => (
                                  <div key={item.cartId} className="flex gap-4 items-center">
                                      <div className="relative">
                                          <img src={item.images[0]} className="w-14 h-14 rounded-xl object-cover shadow-lg border-2 border-white" />
                                          <span className="absolute -top-1.5 -right-1.5 bg-slate-900 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">{item.quantity}</span>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                          <h4 className="font-bold text-slate-800 text-xs truncate">{item.name}</h4>
                                      </div>
                                      <span className="font-black text-slate-900 text-xs">R$ {(item.price * item.quantity).toFixed(2)}</span>
                                  </div>
                              ))}
                          </div>
                          <div className="space-y-2 pt-6 border-t-2 border-slate-200/50">
                              <div className="flex justify-between text-xs text-slate-400 font-black uppercase tracking-widest"><span>Subtotal</span><span>R$ {cartTotal.toFixed(2)}</span></div>
                              {usePoints && (
                                  <div className="flex justify-between text-xs text-emerald-600 font-black uppercase tracking-widest"><span>Desconto</span><span>- R$ {discount.toFixed(2)}</span></div>
                              )}
                              <div className="flex justify-between items-center pt-4 text-slate-900">
                                  <span className="font-black text-sm uppercase tracking-widest">Total</span>
                                  <span className="text-3xl font-black tracking-tighter">R$ {finalTotal.toFixed(2)}</span>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Sucesso Modal Mobile Optimized */}
      {showSuccessModal && lastOrderDetails && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-fade-in">
              <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden text-center p-8 md:p-12 border border-white/20">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
                      <CheckCircle size={32} className="animate-bounce" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tighter">Tudo pronto!</h3>
                  <p className="text-slate-500 text-xs font-medium mb-8">Pedido confirmado. Retire seus itens no balcão da barbearia.</p>
                  
                  <div className="bg-slate-50 rounded-2xl p-4 mb-8 flex items-center justify-between border border-slate-100">
                      <div className="text-left">
                          <span className="text-[9px] text-slate-400 font-black uppercase block">Pago</span>
                          <span className="text-xl font-black text-slate-900">R$ {lastOrderDetails.total.toFixed(2)}</span>
                      </div>
                      {lastOrderDetails.pointsEarned > 0 && (
                          <div className="text-right">
                              <span className="text-[9px] text-amber-600 font-black uppercase block">Ganhou</span>
                              <span className="text-sm font-black text-amber-700">+{lastOrderDetails.pointsEarned} pts</span>
                          </div>
                      )}
                  </div>

                  <button 
                      onClick={() => { setShowSuccessModal(false); }}
                      className="w-full bg-brand-dark text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                  >
                      Continuar Navegando
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};
