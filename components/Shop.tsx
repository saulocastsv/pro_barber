import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_STORE_PRODUCTS, MOCK_INVENTORY, LOYALTY_RULES } from '../constants';
import { StoreProduct, CartItem, User } from '../types';
import { ShoppingBag, Star, Plus, Minus, ShoppingCart, X, ChevronLeft, ChevronRight, Gift, Trash2, Package, Check, CreditCard, Loader2, ArrowRight } from 'lucide-react';

interface ShopProps {
  currentUser: User;
}

export const Shop: React.FC<ShopProps> = ({ currentUser }) => {
  const [view, setView] = useState<'grid' | 'details'>('grid');
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  
  // --- PERSISTÊNCIA DO CARRINHO ---
  const CART_STORAGE_KEY = `barberpro_cart_${currentUser.id}`;

  // Inicializa o carrinho lendo do localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Erro ao carregar carrinho:", error);
      return [];
    }
  });

  // Salva no localStorage sempre que o carrinho mudar
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart, CART_STORAGE_KEY]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  
  // Detalhes do produto state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariation, setSelectedVariation] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('Todos');

  // Pontos
  const [usePoints, setUsePoints] = useState(false);
  
  // --- INTEGRAÇÃO DE ESTOQUE ---
  const allProducts = useMemo(() => {
    const internalCategories = ['Lavatório', 'Bar']; 
    
    const inventoryAsStoreProducts: StoreProduct[] = MOCK_INVENTORY
        .filter(item => !internalCategories.includes(item.category))
        .map(item => ({
            id: `inv_${item.id}`,
            name: item.name,
            description: `Produto disponível para retirada imediata no salão. ${item.name} original.`,
            price: item.price,
            category: item.category,
            images: ['https://images.unsplash.com/photo-1585232561307-3f8d407c95b4?auto=format&fit=crop&q=80&w=600'], 
            rating: 5.0,
            reviewsCount: 0,
            inStock: item.quantity > 0,
            variations: ['Padrão'] 
        }));

    return [...MOCK_STORE_PRODUCTS, ...inventoryAsStoreProducts];
  }, []);

  const categories = ['Todos', ...Array.from(new Set(allProducts.map(p => p.category)))];
  const filteredProducts = categoryFilter === 'Todos' 
    ? allProducts 
    : allProducts.filter(p => p.category === categoryFilter);

  // --- Helper de Preço Dinâmico (Mock) ---
  const getVariationPrice = (product: StoreProduct, variation: string) => {
      // Lógica simulada para alterar preço conforme a variação escolhida nos mocks
      if (product.id === 'sp1' && variation === '50g') return 28.00; // Pomada menor
      if (product.id === 'sp2' && variation === '60ml') return 59.90; // Óleo maior
      return product.price; // Preço base
  };

  // Preço atual calculado com base na variação selecionada
  const currentDisplayPrice = useMemo(() => {
      if (!selectedProduct) return 0;
      if (!selectedVariation) return selectedProduct.price;
      return getVariationPrice(selectedProduct, selectedVariation);
  }, [selectedProduct, selectedVariation]);

  // Cart Logic
  const addToCart = (product: StoreProduct, variation?: string, qty: number = 1, finalPrice?: number) => {
    const priceToUse = finalPrice || product.price;
    
    const newItem: CartItem = {
      ...product,
      price: priceToUse, // Sobrescreve o preço base com o preço da variação
      cartId: `${product.id}-${variation || 'default'}-${Date.now()}`,
      selectedVariation: variation || (product.variations ? product.variations[0] : 'Padrão'),
      quantity: qty
    };
    setCart([...cart, newItem]);
    setIsCartOpen(true);
    
    if (view === 'details') {
        setView('grid');
        setQuantity(1);
        setSelectedVariation('');
    }
  };

  const removeFromCart = (cartId: string) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const updateQuantity = (cartId: string, delta: number) => {
    setCart(cart.map(item => {
        if (item.cartId === cartId) {
            const newQty = Math.max(1, item.quantity + delta);
            return { ...item, quantity: newQty };
        }
        return item;
    }));
  };

  const openDetails = (product: StoreProduct) => {
      setSelectedProduct(product);
      setActiveImageIndex(0);
      setQuantity(1);
      // Seleciona a primeira variação por padrão
      setSelectedVariation(product.variations && product.variations.length > 0 ? product.variations[0] : 'Padrão');
      setView('details');
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  // Loyalty Logic
  const currentPoints = currentUser.points || 0;
  const canRedeemPoints = currentPoints >= LOYALTY_RULES.MIN_POINTS_TO_REDEEM;
  
  const maxDiscount = currentPoints / LOYALTY_RULES.DISCOUNT_CONVERSION_RATE;
  const discount = usePoints ? Math.min(maxDiscount, cartTotal * 0.5) : 0; // Max 50% discount
  const finalTotal = cartTotal - discount;

  const initiateCheckout = () => {
      setIsCartOpen(false);
      setIsCheckoutModalOpen(true);
  };

  const handleFinalizePurchase = () => {
      setIsProcessingCheckout(true);
      
      // Simula processamento
      setTimeout(() => {
          setIsProcessingCheckout(false);
          setIsCheckoutModalOpen(false);
          setCart([]); 
          setUsePoints(false);
          alert(`Compra realizada com sucesso! Total pago: R$ ${finalTotal.toFixed(2)}. ${!usePoints ? `Você ganhou ${Math.floor(finalTotal * LOYALTY_RULES.POINTS_PER_CURRENCY)} pontos!` : 'Desconto aplicado.'}`);
      }, 2000);
  };

  return (
    <div className="relative h-full">
      {/* Header da Loja */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 animate-fade-in">
        <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <ShoppingBag className="text-amber-500" /> Loja BarberPro
            </h2>
            <p className="text-slate-500 mt-1">Produtos premium e estoque do salão.</p>
        </div>
        
        {/* Botão Carrinho Desktop */}
        <button 
            onClick={() => setIsCartOpen(true)}
            className="hidden md:flex bg-slate-900 text-white p-3 rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:scale-105 active:scale-95 items-center gap-2 relative"
        >
            <ShoppingCart size={20} />
            <span className="font-bold">Carrinho</span>
            {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                    {cart.reduce((acc, i) => acc + i.quantity, 0)}
                </span>
            )}
        </button>
      </div>

      {/* Botão Flutuante Carrinho Mobile */}
      <button 
        onClick={() => setIsCartOpen(true)}
        className="md:hidden fixed bottom-6 right-6 z-40 bg-slate-900 text-white p-4 rounded-full shadow-xl hover:bg-slate-800 transition-transform active:scale-90 flex items-center justify-center"
      >
        <ShoppingCart size={24} />
        {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-slate-900">
                {cart.reduce((acc, i) => acc + i.quantity, 0)}
            </span>
        )}
      </button>

      {view === 'grid' ? (
        <div className="animate-fade-in pb-24 md:pb-20">
            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-4 custom-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                            categoryFilter === cat 
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => {
                    const isInventoryItem = product.id.startsWith('inv_');
                    
                    return (
                        <div 
                            key={product.id} 
                            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full"
                        >
                            <div className="relative h-48 overflow-hidden bg-slate-100 cursor-pointer" onClick={() => openDetails(product)}>
                                <img 
                                    src={product.images[0]} 
                                    alt={product.name} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                {isInventoryItem && (
                                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm border border-slate-100">
                                        <Package size={10} /> Estoque Físico
                                    </div>
                                )}
                                {!product.inStock && (
                                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-sm">
                                        <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">Esgotado</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-4 flex flex-col flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">{product.category}</span>
                                    {!isInventoryItem && (
                                        <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                                            <Star size={12} fill="currentColor" /> {product.rating}
                                        </div>
                                    )}
                                </div>
                                <h3 
                                    className="font-bold text-slate-800 text-lg mb-1 leading-tight cursor-pointer hover:text-blue-600 transition-colors"
                                    onClick={() => openDetails(product)}
                                >
                                    {product.name}
                                </h3>
                                <p className="text-slate-500 text-xs line-clamp-2 mb-4 flex-1">{product.description}</p>
                                
                                <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50">
                                    <span className="text-xl font-bold text-slate-900">R$ {product.price.toFixed(2)}</span>
                                    <button 
                                        onClick={() => addToCart(product, product.variations?.[0])}
                                        disabled={!product.inStock}
                                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white p-2.5 rounded-xl transition-colors shadow-sm hover:shadow-md hover:-translate-y-0.5"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      ) : (
          /* DETAILS VIEW */
          selectedProduct && (
            <div className="animate-fade-in max-w-5xl mx-auto pb-20">
                <button onClick={() => setView('grid')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold mb-6 group">
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Voltar para Loja
                </button>

                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col md:flex-row">
                    {/* Image Gallery */}
                    <div className="md:w-1/2 bg-slate-50 relative h-72 md:h-auto">
                            <img 
                                src={selectedProduct.images[activeImageIndex]} 
                                className="w-full h-full object-cover" 
                                alt="Product" 
                            />
                            {selectedProduct.images.length > 1 && (
                                <>
                                    <button 
                                        onClick={() => setActiveImageIndex(i => (i === 0 ? selectedProduct.images.length - 1 : i - 1))}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white transition-colors"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button 
                                        onClick={() => setActiveImageIndex(i => (i === selectedProduct.images.length - 1 ? 0 : i + 1))}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white transition-colors"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                                        {selectedProduct.images.map((_, idx) => (
                                            <div 
                                                key={idx}
                                                className={`w-2 h-2 rounded-full transition-all ${idx === activeImageIndex ? 'bg-slate-800 w-4' : 'bg-slate-300'}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                    </div>

                    {/* Info */}
                    <div className="md:w-1/2 p-6 md:p-12 flex flex-col">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-xs font-bold uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded mb-2 inline-block">
                                    {selectedProduct.category}
                                </span>
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{selectedProduct.name}</h1>
                                {!selectedProduct.id.startsWith('inv_') && (
                                    <div className="flex items-center gap-2 mb-4 md:mb-6">
                                        <div className="flex text-amber-400">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={16} fill={i < Math.floor(selectedProduct.rating) ? "currentColor" : "none"} />
                                            ))}
                                        </div>
                                        <span className="text-sm text-slate-400">({selectedProduct.reviewsCount} avaliações)</span>
                                    </div>
                                )}
                            </div>
                            <div className="text-right">
                                <span className="text-2xl md:text-3xl font-bold text-slate-900">R$ {currentDisplayPrice.toFixed(2)}</span>
                                {currentDisplayPrice !== selectedProduct.price && (
                                    <span className="block text-sm text-slate-400 line-through">R$ {selectedProduct.price.toFixed(2)}</span>
                                )}
                            </div>
                        </div>

                        <p className="text-slate-600 leading-relaxed mb-6 md:mb-8 text-sm md:text-base">{selectedProduct.description}</p>

                        {selectedProduct.variations && selectedProduct.variations.length > 0 && selectedProduct.variations[0] !== 'Padrão' && (
                            <div className="mb-6">
                                <p className="text-sm font-bold text-slate-700 mb-2">Variação</p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedProduct.variations.map(v => {
                                        const isActive = selectedVariation === v;
                                        return (
                                            <button
                                                key={v}
                                                onClick={() => setSelectedVariation(v)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all flex items-center gap-2 ${
                                                    isActive 
                                                    ? 'border-slate-900 bg-slate-900 text-white shadow-md transform scale-105' 
                                                    : 'border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50'
                                                }`}
                                            >
                                                {v}
                                                {isActive && <Check size={14} />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="mb-8">
                            <p className="text-sm font-bold text-slate-700 mb-2">Quantidade</p>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center border border-slate-200 rounded-lg">
                                    <button 
                                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                      className="p-3 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
                                    >
                                        <Minus size={18} />
                                    </button>
                                    <span className="w-12 text-center font-bold text-slate-900">{quantity}</span>
                                    <button 
                                      onClick={() => setQuantity(quantity + 1)}
                                      className="p-3 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                                {selectedProduct.inStock ? (
                                    <div className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded-full border border-green-100 flex items-center gap-1">
                                        <Check size={12} /> Em estoque
                                    </div>
                                ) : (
                                    <div className="text-xs text-red-600 font-bold bg-red-50 px-2 py-1 rounded-full border border-red-100">
                                        Esgotado
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-auto pt-6 border-t border-slate-100 flex gap-4">
                            <button 
                                onClick={() => addToCart(selectedProduct, selectedVariation, quantity, currentDisplayPrice)}
                                disabled={!selectedProduct.inStock}
                                className="flex-1 bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <ShoppingBag size={20} /> 
                                {selectedProduct.inStock ? `Adicionar - R$ ${(currentDisplayPrice * quantity).toFixed(2)}` : 'Indisponível'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
              <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
              <div className="relative w-full md:max-w-md bg-white h-full shadow-2xl flex flex-col animate-fade-in">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white z-10">
                      <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                          <ShoppingCart className="text-blue-600" /> Seu Carrinho
                      </h3>
                      <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600">
                          <X size={24} />
                      </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                      {cart.length === 0 ? (
                          <div className="text-center py-20 text-slate-400">
                              <ShoppingBag size={64} className="mx-auto mb-4 opacity-20" />
                              <p>Seu carrinho está vazio.</p>
                              <button onClick={() => setIsCartOpen(false)} className="mt-4 text-blue-600 font-bold hover:underline">Continuar comprando</button>
                          </div>
                      ) : (
                          cart.map(item => (
                              <div key={item.cartId} className="flex gap-4">
                                  <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                                      <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="flex-1">
                                      <h4 className="font-bold text-slate-800 line-clamp-1">{item.name}</h4>
                                      <p className="text-xs text-slate-500 mb-2">{item.selectedVariation}</p>
                                      <div className="flex justify-between items-center">
                                          <div className="flex items-center border border-slate-200 rounded-lg h-10">
                                              <button onClick={() => updateQuantity(item.cartId, -1)} className="px-3 hover:bg-slate-50 h-full flex items-center justify-center"><Minus size={14} /></button>
                                              <span className="px-2 text-sm font-bold min-w-[1.5rem] text-center">{item.quantity}</span>
                                              <button onClick={() => updateQuantity(item.cartId, 1)} className="px-3 hover:bg-slate-50 h-full flex items-center justify-center"><Plus size={14} /></button>
                                          </div>
                                          <span className="font-bold text-slate-900">R$ {(item.price * item.quantity).toFixed(2)}</span>
                                      </div>
                                  </div>
                                  <button onClick={() => removeFromCart(item.cartId)} className="text-slate-300 hover:text-red-500 self-start p-1">
                                      <Trash2 size={16} />
                                  </button>
                              </div>
                          ))
                      )}
                  </div>

                  {cart.length > 0 && (
                      <div className="p-6 bg-slate-50 border-t border-slate-200">
                          <div className="flex justify-between text-xl font-bold pt-2 mb-6 text-slate-800">
                              <span>Subtotal</span>
                              <span>R$ {cartTotal.toFixed(2)}</span>
                          </div>

                          <button 
                            onClick={initiateCheckout}
                            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                          >
                              Ir para Pagamento <ArrowRight size={20} />
                          </button>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                      <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                          <CreditCard className="text-blue-600" /> Checkout
                      </h3>
                      <button onClick={() => setIsCheckoutModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                          <X size={24} />
                      </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                      {/* Items Summary */}
                      <div className="space-y-4">
                          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Resumo do Pedido</h4>
                          {cart.map(item => (
                              <div key={item.cartId} className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl">
                                  <div className="w-12 h-12 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                                      <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="flex-1">
                                      <p className="font-bold text-slate-800 text-sm line-clamp-1">{item.name}</p>
                                      <p className="text-xs text-slate-500">{item.selectedVariation} • Qtd: {item.quantity}</p>
                                  </div>
                                  <span className="font-bold text-slate-800 text-sm">R$ {(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                          ))}
                      </div>

                      {/* Loyalty Points Section */}
                      <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                          <div className="flex justify-between items-center mb-3">
                              <div className="flex items-center gap-2">
                                  <div className="p-1.5 bg-amber-100 rounded-lg text-amber-600">
                                      <Gift size={18} />
                                  </div>
                                  <div>
                                      <p className="font-bold text-sm text-slate-800">Fidelidade</p>
                                      <p className="text-[10px] text-slate-500 uppercase tracking-wide">Saldo: {currentPoints} pts</p>
                                  </div>
                              </div>
                              {canRedeemPoints ? (
                                  <label className="relative inline-flex items-center cursor-pointer">
                                      <input type="checkbox" className="sr-only peer" checked={usePoints} onChange={(e) => setUsePoints(e.target.checked)} />
                                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                  </label>
                              ) : (
                                  <span className="text-[10px] text-red-400 font-medium">Mínimo {LOYALTY_RULES.MIN_POINTS_TO_REDEEM} pts</span>
                              )}
                          </div>
                          <p className="text-xs text-blue-800 leading-relaxed">
                              {canRedeemPoints
                                  ? "Ative para usar seus pontos como desconto nesta compra (máx 50%)." 
                                  : `Você precisa de mais ${LOYALTY_RULES.MIN_POINTS_TO_REDEEM - currentPoints} pontos para resgatar descontos.`}
                          </p>
                      </div>

                      {/* Totals */}
                      <div className="space-y-3 pt-2">
                          <div className="flex justify-between text-sm text-slate-500">
                              <span>Subtotal</span>
                              <span>R$ {cartTotal.toFixed(2)}</span>
                          </div>
                          {usePoints && (
                              <div className="flex justify-between text-sm text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-lg">
                                  <span className="flex items-center gap-1"><Gift size={12} /> Desconto Pontos</span>
                                  <span>- R$ {discount.toFixed(2)}</span>
                              </div>
                          )}
                          <div className="flex justify-between items-end pt-4 border-t border-slate-100">
                              <span className="text-slate-500 font-medium">Total Final</span>
                              <span className="text-3xl font-bold text-slate-900">R$ {finalTotal.toFixed(2)}</span>
                          </div>
                      </div>
                  </div>

                  <div className="p-6 bg-slate-50 border-t border-slate-200">
                      <button 
                        onClick={handleFinalizePurchase}
                        disabled={isProcessingCheckout}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg transition-all disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2"
                      >
                          {isProcessingCheckout ? (
                              <>
                                  <Loader2 size={20} className="animate-spin" /> Processando...
                              </>
                          ) : (
                              <>
                                  Confirmar Pagamento <Check size={20} />
                              </>
                          )}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};