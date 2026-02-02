
import React, { useState } from 'react';
import { User, ShopSettings, UserRole, UserPaymentMethod } from '../types';
import { Store, User as UserIcon, Clock, MapPin, Phone, Save, Camera, Percent, Globe, CreditCard, Plus, Trash2, CheckCircle2, ShieldCheck, X } from 'lucide-react';

interface SettingsProps {
  currentUser: User;
  settings: ShopSettings;
  onUpdateSettings: (newSettings: ShopSettings) => void;
  // Optional: Add setUsers for updating global user state in demo
  onUpdateUser?: (updatedUser: User) => void;
}

export const Settings: React.FC<SettingsProps> = ({ currentUser, settings, onUpdateSettings, onUpdateUser }) => {
  const [shopSettings, setShopSettings] = useState<ShopSettings>(settings);
  const [userProfile, setUserProfile] = useState({ ...currentUser });
  const [activeTab, setActiveTab] = useState<'profile' | 'shop' | 'payments'>('profile');
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  
  // Local state for adding a new card
  const [newCard, setNewCard] = useState({ number: '', expiry: '', cvc: '', name: '' });

  const handleSaveProfile = (e: React.FormEvent) => {
      e.preventDefault();
      alert('Perfil atualizado com sucesso!');
  };

  const handleSaveShop = (e: React.FormEvent) => {
      e.preventDefault();
      onUpdateSettings(shopSettings);
      alert('Configurações da barbearia salvas com sucesso!');
  };

  const handleAddCard = (e: React.FormEvent) => {
      e.preventDefault();
      const last4 = newCard.number.slice(-4);
      const brand: any = newCard.number.startsWith('4') ? 'visa' : 'mastercard';
      
      const newMethod: UserPaymentMethod = {
          id: `pm_${Date.now()}`,
          type: 'CARD',
          brand,
          last4,
          expiry: newCard.expiry,
          isDefault: !userProfile.paymentMethods?.length
      };

      const updatedUser = {
          ...userProfile,
          paymentMethods: [...(userProfile.paymentMethods || []), newMethod]
      };

      setUserProfile(updatedUser);
      if (onUpdateUser) onUpdateUser(updatedUser);
      
      setIsAddCardModalOpen(false);
      setNewCard({ number: '', expiry: '', cvc: '', name: '' });
      alert('Cartão adicionado com sucesso!');
  };

  const handleDeleteCard = (id: string) => {
      if (confirm('Tem certeza que deseja remover este cartão?')) {
          const updatedMethods = userProfile.paymentMethods?.filter(m => m.id !== id);
          const updatedUser = { ...userProfile, paymentMethods: updatedMethods };
          setUserProfile(updatedUser);
          if (onUpdateUser) onUpdateUser(updatedUser);
      }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10 max-w-4xl mx-auto">
      <div>
          <h2 className="text-3xl font-bold text-brand-dark tracking-tight">Ajustes</h2>
          <p className="text-brand-midGray mt-1">Configure sua conta e as regras do seu negócio.</p>
      </div>

      <div className="flex gap-2 border-b border-slate-200 mb-6">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-4 text-sm font-bold transition-all relative ${activeTab === 'profile' ? 'text-brand-dark' : 'text-slate-400 hover:text-slate-700'}`}
          >
            Meu Perfil
            {activeTab === 'profile' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-dark rounded-t-full"></div>}
          </button>
          
          {currentUser.role === UserRole.CUSTOMER && (
              <button 
                onClick={() => setActiveTab('payments')}
                className={`pb-3 px-4 text-sm font-bold transition-all relative ${activeTab === 'payments' ? 'text-brand-dark' : 'text-slate-400 hover:text-slate-700'}`}
              >
                Pagamentos
                {activeTab === 'payments' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-dark rounded-t-full"></div>}
              </button>
          )}

          {currentUser.role === UserRole.OWNER && (
              <button 
                onClick={() => setActiveTab('shop')}
                className={`pb-3 px-4 text-sm font-bold transition-all relative ${activeTab === 'shop' ? 'text-brand-dark' : 'text-slate-400 hover:text-slate-700'}`}
              >
                Perfil da Barbearia
                {activeTab === 'shop' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-dark rounded-t-full"></div>}
              </button>
          )}
      </div>

      {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
              <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="flex items-center gap-6 mb-8">
                      <div className="relative group cursor-pointer">
                          <img src={userProfile.avatar} alt="Avatar" className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-xl" />
                          <div className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Camera className="text-white" size={24} />
                          </div>
                      </div>
                      <div>
                          <h3 className="text-xl font-bold text-brand-dark">{userProfile.name}</h3>
                          <p className="text-xs text-brand-midGray font-bold uppercase tracking-widest">{userProfile.role}</p>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nome Completo</label>
                          <div className="relative">
                              <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input 
                                type="text" 
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-light outline-none text-brand-dark font-medium"
                                value={userProfile.name}
                                onChange={e => setUserProfile({...userProfile, name: e.target.value})}
                              />
                          </div>
                      </div>
                      <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">E-mail</label>
                          <input 
                            type="email" 
                            disabled
                            className="w-full px-4 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl text-slate-400 cursor-not-allowed font-medium"
                            value={userProfile.email}
                          />
                      </div>
                  </div>

                  <div className="pt-6 flex justify-end">
                      <button type="submit" className="bg-brand-dark text-white px-8 py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-brand-dark/20 flex items-center gap-2 active:scale-95">
                          <Save size={18} /> Salvar Alterações
                      </button>
                  </div>
              </form>
          </div>
      )}

      {activeTab === 'payments' && (
          <div className="space-y-6 animate-fade-in">
              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-center mb-8">
                      <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><CreditCard className="text-blue-500" /> Métodos de Pagamento</h3>
                      <button onClick={() => setIsAddCardModalOpen(true)} className="bg-brand-dark text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-black transition-all flex items-center gap-2">
                          <Plus size={16} /> Adicionar Cartão
                      </button>
                  </div>

                  <div className="space-y-4">
                      {userProfile.paymentMethods?.length ? (
                          userProfile.paymentMethods.map(method => (
                              <div key={method.id} className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:shadow-md transition-all group">
                                  <div className="flex items-center gap-6">
                                      <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                          <img src={`https://img.icons8.com/color/48/${method.brand}.png`} className="h-8" alt={method.brand} />
                                      </div>
                                      <div>
                                          <p className="font-bold text-slate-800">•••• •••• •••• {method.last4}</p>
                                          <div className="flex items-center gap-3 mt-1">
                                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expira em {method.expiry}</span>
                                              {method.isDefault && (
                                                  <span className="bg-emerald-100 text-emerald-700 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Padrão</span>
                                              )}
                                          </div>
                                      </div>
                                  </div>
                                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      {!method.isDefault && (
                                          <button className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest px-3">Tornar Padrão</button>
                                      )}
                                      <button onClick={() => handleDeleteCard(method.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                          <Trash2 size={18} />
                                      </button>
                                  </div>
                              </div>
                          ))
                      ) : (
                          <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-3xl">
                              <CreditCard size={48} className="mx-auto text-slate-200 mb-4" />
                              <p className="text-slate-400 font-bold">Nenhum cartão cadastrado.</p>
                              <button onClick={() => setIsAddCardModalOpen(true)} className="mt-4 text-blue-600 font-bold text-sm hover:underline">Clique para adicionar o primeiro</button>
                          </div>
                      )}
                  </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 flex gap-4">
                  <ShieldCheck size={32} className="text-blue-600 flex-shrink-0" />
                  <div>
                      <h4 className="font-bold text-blue-900 mb-1">Pagamentos Seguros</h4>
                      <p className="text-sm text-blue-700/80 leading-relaxed">
                          A Barvo utiliza tecnologia de criptografia de ponta para garantir que seus dados de pagamento nunca sejam armazenados em nossos servidores de forma legível. Tudo é processado via Checkout Seguro.
                      </p>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'shop' && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
              <form onSubmit={handleSaveShop} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="col-span-2 space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nome da Unidade</label>
                          <div className="relative">
                              <Store size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input 
                                type="text" 
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-light outline-none text-brand-dark font-bold text-lg"
                                value={shopSettings.shopName}
                                onChange={e => setShopSettings({...shopSettings, shopName: e.target.value})}
                              />
                          </div>
                      </div>
                      
                      <div className="col-span-2 space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Endereço de Localização</label>
                          <div className="relative">
                              <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input 
                                type="text" 
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-light outline-none text-brand-dark font-medium"
                                value={shopSettings.address}
                                onChange={e => setShopSettings({...shopSettings, address: e.target.value})}
                              />
                          </div>
                      </div>

                      <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Comissão Padrão (%)</label>
                          <div className="relative">
                              <Percent size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input 
                                type="number" 
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-light outline-none text-brand-dark font-bold"
                                value={shopSettings.defaultCommissionRate}
                                onChange={e => setShopSettings({...shopSettings, defaultCommissionRate: Number(e.target.value)})}
                              />
                          </div>
                      </div>
                  </div>

                  <div className="pt-6 flex justify-between items-center border-t border-slate-100">
                      <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                         <Globe size={16} /> Suas alterações são aplicadas em tempo real.
                      </div>
                      <button type="submit" className="bg-brand-dark text-white px-8 py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-brand-dark/20 flex items-center gap-2 active:scale-95">
                          <Save size={18} /> Atualizar Barbearia
                      </button>
                  </div>
              </form>
          </div>
      )}

      {/* Modal Adicionar Cartão - Minimalista Stripe Style */}
      {isAddCardModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden relative border border-slate-100">
                  <button onClick={() => setIsAddCardModalOpen(false)} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-800 transition-colors"><X/></button>
                  
                  <div className="p-10">
                      <div className="flex items-center gap-2 mb-8 text-brand-dark/40 font-bold text-xs uppercase tracking-widest">
                          <ShieldCheck size={18} /> <span>Checkout Seguro</span>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-slate-800 mb-8 tracking-tight">Adicionar Novo Cartão</h3>
                      
                      <form onSubmit={handleAddCard} className="space-y-6">
                          <div className="space-y-4">
                              <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                                  <div className="p-4 border-b border-slate-200 flex items-center gap-3">
                                      <CreditCard className="text-slate-400" size={20} />
                                      <input 
                                        required
                                        type="text" 
                                        placeholder="Número do cartão" 
                                        className="w-full bg-transparent outline-none text-slate-800 font-medium"
                                        value={newCard.number}
                                        onChange={e => setNewCard({...newCard, number: e.target.value})}
                                      />
                                      <div className="flex gap-1">
                                          <img src="https://img.icons8.com/color/48/visa.png" className="h-5" />
                                          <img src="https://img.icons8.com/color/48/mastercard.png" className="h-5" />
                                      </div>
                                  </div>
                                  <div className="flex divide-x divide-slate-200">
                                      <input 
                                        required
                                        type="text" 
                                        placeholder="MM / AA" 
                                        className="w-1/2 p-4 bg-transparent outline-none text-slate-800 text-sm"
                                        value={newCard.expiry}
                                        onChange={e => setNewCard({...newCard, expiry: e.target.value})}
                                      />
                                      <input 
                                        required
                                        type="text" 
                                        placeholder="CVC" 
                                        className="w-1/2 p-4 bg-transparent outline-none text-slate-800 text-sm"
                                        value={newCard.cvc}
                                        onChange={e => setNewCard({...newCard, cvc: e.target.value})}
                                      />
                                  </div>
                              </div>
                              
                              <div className="space-y-1">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome no Cartão</label>
                                  <input 
                                    required
                                    type="text" 
                                    placeholder="Ex: JOÃO A SILVA" 
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold uppercase text-slate-800"
                                    value={newCard.name}
                                    onChange={e => setNewCard({...newCard, name: e.target.value})}
                                  />
                              </div>
                          </div>

                          <button type="submit" className="w-full bg-brand-dark text-white py-5 rounded-[1.5rem] font-black text-lg shadow-xl hover:bg-black transition-all active:scale-95">Salvar Cartão</button>
                      </form>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
