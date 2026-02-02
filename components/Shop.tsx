import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_STORE_PRODUCTS, LOYALTY_RULES } from '../constants';
import { StoreProduct, CartItem, User, InventoryItem } from '../types';
import { ShoppingBag, Star, Plus, Minus, ShoppingCart, X, ChevronLeft, ChevronRight, Gift, Trash2, Package, Check, CreditCard, Loader2, ArrowRight, MessageSquare, Send, User as UserIcon, CheckCircle, ShieldCheck, Landmark } from 'lucide-react';

interface ShopProps {
  currentUser: User;
  inventory: InventoryItem[];
  onPurchase: (cartItems: CartItem[], totalPaid: number, pointsUsed: boolean, pointsDiscount: number) => boolean;
}

interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
}

export const Shop: React.FC<ShopProps> = ({ currentUser, inventory, onPurchase }) => {
  const [view, setView] = useState<'grid' | 'details'>('grid');
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
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
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariation, setSelectedVariation] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [productReviews, setProductReviews] = useState<Review[]>([]);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [usePoints, setUsePoints] = useState(false);

  // --- MOCK CHECKOUT STATE ---
  const [paymentStep, setPaymentStep] = useState<'details' | 'success'>('details');

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
  const canRedeemPoints = currentPoints >= LOYALTY_RULES.MIN_POINTS_TO_REDEEM;
  const maxDiscount = currentPoints / LOYALTY_RULES.DISCOUNT_CONVERSION_RATE;
  const discount = usePoints ? Math.min(maxDiscount, cartTotal * 0.5) : 0; 
  const finalTotal = cartTotal - discount;

  const addToCart = (product: StoreProduct, variation?: string, qty: number = 1, finalPrice?: number) => {
    const newItem: CartItem = {
      ...product,
      price: finalPrice || product.price, 
      cartId: `${product.id}-${variation || 'default'}-${Date.now()}`,
      selectedVariation: variation || (product.variations ? product.variations[0] : 'Padrão'),
      quantity: qty
    };
    setCart([...cart, newItem]);
    setIsCartOpen(true);
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
      }, 2500);
  };

  return (
    <div className="relative h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 animate-fade-in">
        <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <ShoppingBag className="text-amber-500" /> Loja Barvo
            </h2>
            <p className="text-slate-500 mt-1 text-sm md:text-base">Equipamentos e cosméticos profissionais.</p>
        </div>
        
        <button onClick={() => setIsCartOpen(true)} className="hidden md:flex bg-brand-dark text-white px-5 py-3 rounded-2xl hover:bg-black transition-all shadow-lg hover:scale-105 items-center gap-2 relative">
            <ShoppingCart size={20} />
            <span className="font-bold">Meu Carrinho</span>
            {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">{cart.reduce((acc, i) => acc + i.quantity, 0)}</span>}
        </button>
      </div>

      {view === 'grid' ? (
        <div className="animate-fade-in pb-24">
            <div className="flex gap-2 overflow-x-auto pb-4 mb-6 custom-scrollbar">
                {categories.map(cat => (
                    <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${categoryFilter === cat ? 'bg-brand-dark text-white border-brand-dark shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{cat}</button>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                    <div key={product.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col">
                        <div className="relative h-56 overflow-hidden bg-slate-100 cursor-pointer" onClick={() => { setSelectedProduct(product); setView('details'); }}>
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            {product.id.startsWith('inv_') && <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm border border-slate-100 uppercase tracking-widest">Estoque Físico</div>}
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                            <h3 className="font-bold text-slate-800 text-lg mb-1 leading-tight group-hover:text-blue-600 transition-colors">{product.name}</h3>
                            <p className="text-slate-400 text-xs line-clamp-2 mb-4">{product.description}</p>
                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                                <span className="text-xl font-bold text-slate-900">R$ {product.price.toFixed(2)}</span>
                                <button onClick={() => addToCart(product)} disabled={!product.inStock} className="bg-slate-100 hover:bg-brand-light text-brand-dark p-2.5 rounded-xl transition-all active:scale-95"><Plus size={20} /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      ) : (
          /* DETAILS VIEW (Simplified for context) */
          selectedProduct && (
              <div className="max-w-4xl mx-auto bg-white p-8 rounded-3xl border border-slate-100 shadow-lg animate-fade-in">
                  <button onClick={() => setView('grid')} className="mb-6 flex items-center gap-2 text-slate-400 font-bold text-sm"><ChevronLeft size={16}/> Voltar</button>
                  <div className="flex flex-col md:flex-row gap-10">
                      <img src={selectedProduct.images[0]} className="md:w-1/2 h-80 object-cover rounded-2xl" />
                      <div className="flex-1">
                          <h2 className="text-3xl font-bold text-slate-800 mb-2">{selectedProduct.name}</h2>
                          <p className="text-slate-500 mb-6">{selectedProduct.description}</p>
                          <div className="text-4xl font-bold text-brand-dark mb-8">R$ {selectedProduct.price.toFixed(2)}</div>
                          <button onClick={() => addToCart(selectedProduct)} className="w-full bg-brand-dark text-white py-4 rounded-2xl font-bold shadow-lg shadow-brand-dark/20 flex items-center justify-center gap-2">Adicionar ao Carrinho <ArrowRight size={20}/></button>
                      </div>
                  </div>
              </div>
          )
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
              <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
              <div className="relative w-full md:max-w-md bg-white h-full shadow-2xl flex flex-col animate-fade-in overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white z-10">
                      <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><ShoppingCart className="text-blue-600" /> Carrinho</h3>
                      <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={24} /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                      {cart.length === 0 ? <p className="text-center py-20 text-slate-400">Vazio...</p> : cart.map(item => (
                          <div key={item.cartId} className="flex gap-4 items-center">
                              <img src={item.images[0]} className="w-16 h-16 rounded-xl object-cover" />
                              <div className="flex-1">
                                  <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                                  <p className="text-xs text-slate-500">R$ {item.price.toFixed(2)} x {item.quantity}</p>
                              </div>
                              <button onClick={() => setCart(cart.filter(c => c.cartId !== item.cartId))} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                          </div>
                      ))}
                  </div>
                  <div className="p-6 bg-slate-50 border-t border-slate-200">
                      <div className="flex justify-between text-xl font-bold mb-6"><span>Total</span><span>R$ {cartTotal.toFixed(2)}</span></div>
                      <button onClick={() => { setIsCartOpen(false); setIsCheckoutModalOpen(true); }} disabled={cart.length === 0} className="w-full bg-brand-dark text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-black transition-all">Ir para o Checkout</button>
                  </div>
              </div>
          </div>
      )}

      {/* --- CHECKOUT PREMIUM (ESTILO STRIPE) --- */}
      {isCheckoutModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white animate-fade-in overflow-y-auto">
              <div className="w-full max-w-6xl h-full md:h-auto min-h-screen md:min-h-0 flex flex-col md:flex-row relative">
                  
                  {/* Botão de Fechar */}
                  <button onClick={() => setIsCheckoutModalOpen(false)} className="absolute top-6 left-6 md:left-auto md:right-10 z-50 p-2 text-slate-400 hover:text-slate-800 bg-slate-100 rounded-full transition-all">
                      <X size={24} />
                  </button>

                  {/* Lado Esquerdo: Dados de Pagamento */}
                  <div className="w-full md:w-1/2 p-8 md:p-16 lg:p-24 bg-white flex flex-col justify-center">
                      <div className="max-w-md w-full mx-auto">
                          <div className="flex items-center gap-2 mb-10 text-brand-dark opacity-50 font-bold">
                              <Landmark size={20}/> <span>Checkout Barvo</span>
                          </div>

                          <h2 className="text-2xl font-bold text-slate-800 mb-8">Informações de Pagamento</h2>
                          
                          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleFinalizePurchase(); }}>
                              {/* E-mail */}
                              <div className="space-y-2">
                                  <label className="text-sm font-semibold text-slate-600">E-mail</label>
                                  <input type="email" defaultValue={currentUser.email} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm" required />
                              </div>

                              {/* Mock Card Section */}
                              <div className="space-y-2">
                                  <label className="text-sm font-semibold text-slate-600">Informações do Cartão</label>
                                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                      <div className="flex items-center px-4 py-3 bg-white border-b border-slate-100">
                                          <input type="text" placeholder="1234 5678 1234 5678" className="w-full bg-transparent outline-none text-slate-800" required />
                                          <div className="flex gap-1">
                                              <img src="https://img.icons8.com/color/48/visa.png" className="h-6" />
                                              <img src="https://img.icons8.com/color/48/mastercard.png" className="h-6" />
                                          </div>
                                      </div>
                                      <div className="flex">
                                          <input type="text" placeholder="MM / AA" className="w-1/2 px-4 py-3 bg-white border-r border-slate-100 outline-none text-slate-800" required />
                                          <input type="text" placeholder="CVC" className="w-1/2 px-4 py-3 bg-white outline-none text-slate-800" required />
                                      </div>
                                  </div>
                              </div>

                              {/* Nome no Cartão */}
                              <div className="space-y-2">
                                  <label className="text-sm font-semibold text-slate-600">Nome no Cartão</label>
                                  <input type="text" placeholder="Como no cartão" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm uppercase" required />
                              </div>

                              {/* Endereço */}
                              <div className="space-y-2">
                                  <label className="text-sm font-semibold text-slate-600">País ou Região</label>
                                  <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm">
                                      <option>Brasil</option>
                                      <option>Portugal</option>
                                      <option>Estados Unidos</option>
                                  </select>
                              </div>

                              {/* Pontos de Fidelidade */}
                              <div className="pt-4">
                                  <button 
                                    type="button" 
                                    onClick={() => setUsePoints(!usePoints)}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${usePoints ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100'}`}
                                  >
                                      <div className="flex items-center gap-3">
                                          <div className={`p-2 rounded-lg ${usePoints ? 'bg-blue-600 text-white' : 'bg-white text-slate-400'}`}>
                                              <Gift size={20} />
                                          </div>
                                          <div className="text-left">
                                              <span className="block font-bold text-sm text-slate-800">Usar Pontos ({currentPoints} pts)</span>
                                              <span className="text-[10px] text-slate-400 uppercase tracking-widest">Economize até R$ {maxDiscount.toFixed(2)}</span>
                                          </div>
                                      </div>
                                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${usePoints ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                                          {usePoints && <Check size={14} className="text-white" />}
                                      </div>
                                  </button>
                              </div>

                              <button 
                                type="submit" 
                                disabled={isProcessingCheckout} 
                                className="w-full bg-brand-dark hover:bg-black text-white py-4 rounded-xl font-bold shadow-xl shadow-brand-dark/20 transition-all flex items-center justify-center gap-3 mt-4 disabled:opacity-70 active:scale-95"
                              >
                                  {isProcessingCheckout ? <Loader2 className="animate-spin" size={24} /> : <>Pagar R$ {finalTotal.toFixed(2)}</>}
                              </button>

                              <p className="text-[10px] text-center text-slate-400 font-medium pt-4 flex items-center justify-center gap-1">
                                  <ShieldCheck size={14} /> Pagamento processado de forma segura e criptografada.
                              </p>
                          </form>
                      </div>
                  </div>

                  {/* Lado Direito: Resumo (Sticky em telas grandes) */}
                  <div className="w-full md:w-1/2 p-8 md:p-16 lg:p-24 bg-slate-50 flex flex-col justify-center border-l border-slate-100">
                      <div className="max-w-sm w-full mx-auto">
                          <h3 className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-8">Resumo do Pedido</h3>
                          
                          <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar mb-10">
                              {cart.map(item => (
                                  <div key={item.cartId} className="flex gap-4 items-center animate-fade-in">
                                      <div className="relative">
                                          <img src={item.images[0]} className="w-16 h-16 rounded-2xl object-cover shadow-sm border border-white" />
                                          <span className="absolute -top-2 -right-2 bg-slate-900 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-slate-50">{item.quantity}</span>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                          <h4 className="font-bold text-slate-800 text-sm truncate">{item.name}</h4>
                                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">{item.category}</p>
                                      </div>
                                      <span className="font-bold text-slate-700 text-sm">R$ {(item.price * item.quantity).toFixed(2)}</span>
                                  </div>
                              ))}
                          </div>

                          <div className="space-y-3 pt-6 border-t border-slate-200">
                              <div className="flex justify-between text-sm text-slate-500 font-medium">
                                  <span>Subtotal</span>
                                  <span>R$ {cartTotal.toFixed(2)}</span>
                              </div>
                              {usePoints && (
                                  <div className="flex justify-between text-sm text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-lg">
                                      <span className="flex items-center gap-1"><Gift size={12}/> Desconto Fidelidade</span>
                                      <span>- R$ {discount.toFixed(2)}</span>
                                  </div>
                              )}
                              <div className="flex justify-between items-center pt-6 text-slate-800">
                                  <span className="font-bold text-lg">Total hoje</span>
                                  <div className="text-right">
                                      <div className="text-3xl font-black">R$ {finalTotal.toFixed(2)}</div>
                                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Inclui impostos simulados</div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && lastOrderDetails && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden text-center p-12 relative border border-white/20">
                  <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-500 shadow-inner">
                      <CheckCircle size={56} strokeWidth={2.5} className="animate-bounce" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-3">Pagamento Aprovado!</h3>
                  <p className="text-slate-500 text-sm mb-10 leading-relaxed">Sua transação foi concluída com sucesso. <br/> Já notificamos a equipe da Barvo sobre o seu pedido.</p>
                  
                  <div className="bg-slate-50 rounded-3xl p-6 mb-10 border border-slate-100 flex items-center justify-between">
                      <div className="text-left">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Total Pago</span>
                          <span className="text-2xl font-black text-slate-900">R$ {lastOrderDetails.total.toFixed(2)}</span>
                      </div>
                      {lastOrderDetails.pointsEarned > 0 && (
                          <div className="text-right bg-amber-100 px-4 py-2 rounded-2xl border border-amber-200">
                              <span className="text-[10px] text-amber-700 font-bold uppercase block">Ganhou</span>
                              <span className="text-lg font-black text-amber-700">+{lastOrderDetails.pointsEarned} pts</span>
                          </div>
                      )}
                  </div>

                  <button 
                      onClick={() => { setShowSuccessModal(false); setIsCheckoutModalOpen(false); setView('grid'); }}
                      className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-xl transition-all hover:bg-black"
                  >
                      Voltar para a Loja
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};