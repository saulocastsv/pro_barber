
import React, { useState } from 'react';
import { User, ShopSettings, UserRole, UserPaymentMethod } from '../types';
import { AvatarComponent } from './AvatarComponent';
import { Store, User as UserIcon, Clock, MapPin, Phone, Save, Camera, Percent, Globe, CreditCard, Plus, Trash2, CheckCircle2, ShieldCheck, X } from 'lucide-react';

interface SettingsProps {
  currentUser: User;
  settings: ShopSettings;
  onUpdateSettings: (newSettings: ShopSettings) => void;
  // Optional: Add setUsers for updating global user state in demo
  onUpdateUser?: (updatedUser: User) => void;
}

export const Settings: React.FC<SettingsProps> = ({ currentUser, settings, onUpdateSettings, onUpdateUser }) => {
    // UIKit
    import { Section, Card, Button, FormInput } from './UIKit';
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
            <Section
                title="Ajustes"
                subtitle="Configure sua conta e as regras do seu negócio."
                action={
                    <div className="flex gap-2">
                        <Button variant={activeTab === 'profile' ? 'primary' : 'ghost'} size="sm" onClick={() => setActiveTab('profile')}>Meu Perfil</Button>
                        {currentUser.role === UserRole.CUSTOMER && (
                            <Button variant={activeTab === 'payments' ? 'primary' : 'ghost'} size="sm" onClick={() => setActiveTab('payments')}>Pagamentos</Button>
                        )}
                        {currentUser.role === UserRole.OWNER && (
                            <Button variant={activeTab === 'shop' ? 'primary' : 'ghost'} size="sm" onClick={() => setActiveTab('shop')}>Perfil da Barbearia</Button>
                        )}
                    </div>
                }
            >

      {activeTab === 'profile' && (
                <Card variant="default">
                    <form onSubmit={handleSaveProfile} className="space-y-6">
                        <div className="flex items-center gap-6 mb-8">
                            <div className="relative group cursor-pointer w-24 h-24">
                                <AvatarComponent url={userProfile.avatar} name={userProfile.name} size="lg" className="!w-full !h-full rounded-3xl border-4 border-white shadow-xl" />
                                <div className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="text-white" size={24} />
                                </div>
                            </div>
                            <div>
                                <span className="text-xl font-bold text-brand-dark block">{userProfile.name}</span>
                                <span className="text-xs text-brand-midGray font-bold uppercase tracking-widest block">{userProfile.role}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Nome Completo"
                                value={userProfile.name}
                                onChange={e => setUserProfile({ ...userProfile, name: e.target.value })}
                                icon={<UserIcon size={18} className="text-slate-400" />}
                            />
                            <FormInput
                                label="E-mail"
                                value={userProfile.email}
                                type="email"
                                disabled
                            />
                        </div>
                        <div className="pt-6 flex justify-end">
                            <Button type="submit" variant="primary" size="lg" className="flex items-center gap-2"><Save size={18} /> Salvar Alterações</Button>
                        </div>
                    </form>
                </Card>
      )}

      {activeTab === 'payments' && (
                <div className="space-y-6 animate-fade-in">
                    <Card variant="default">
                        <div className="flex justify-between items-center mb-8">
                            <span className="text-xl font-bold text-slate-800 flex items-center gap-2"><CreditCard className="text-blue-500" /> Métodos de Pagamento</span>
                            <Button variant="primary" size="sm" onClick={() => setIsAddCardModalOpen(true)}><Plus size={16} /> Adicionar Cartão</Button>
                        </div>
                        <div className="space-y-4">
                            {userProfile.paymentMethods?.length ? (
                                userProfile.paymentMethods.map(method => (
                                    <Card key={method.id} variant="bordered" className="flex items-center justify-between hover:bg-white hover:shadow-md transition-all group">
                                        <div className="flex items-center gap-6">
                                            <Card variant="default" className="p-3 border border-slate-100 shadow-sm"><img src={`https://img.icons8.com/color/48/${method.brand}.png`} className="h-8" alt={method.brand} /></Card>
                                            <div>
                                                <span className="font-bold text-slate-800 block">•••• •••• •••• {method.last4}</span>
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
                                                <Button variant="ghost" size="sm" className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest px-3">Tornar Padrão</Button>
                                            )}
                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteCard(method.id)}><Trash2 size={18} /></Button>
                                        </div>
                                    </Card>
                                ))
                            ) : (
                                <Card variant="bordered" className="text-center py-16">
                                    <CreditCard size={48} className="mx-auto text-slate-200 mb-4" />
                                    <span className="text-slate-400 font-bold block">Nenhum cartão cadastrado.</span>
                                    <Button variant="outline" size="sm" className="mt-4" onClick={() => setIsAddCardModalOpen(true)}>Clique para adicionar o primeiro</Button>
                                </Card>
                            )}
                        </div>
                    </Card>
                    <Card variant="bordered" className="bg-blue-50 border-blue-100 flex gap-4 items-center">
                        <ShieldCheck size={32} className="text-blue-600 flex-shrink-0" />
                        <div>
                            <span className="font-bold text-blue-900 mb-1 block">Pagamentos Seguros</span>
                            <span className="text-sm text-blue-700/80 leading-relaxed block">A Barvo utiliza tecnologia de criptografia de ponta para garantir que seus dados de pagamento nunca sejam armazenados em nossos servidores de forma legível. Tudo é processado via Checkout Seguro.</span>
                        </div>
                    </Card>
                </div>
      )}

      {activeTab === 'shop' && (
                <Card variant="default">
                    <form onSubmit={handleSaveShop} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormInput
                                label="Nome da Unidade"
                                value={shopSettings.shopName}
                                onChange={e => setShopSettings({ ...shopSettings, shopName: e.target.value })}
                                icon={<Store size={18} className="text-slate-400" />}
                            />
                            <FormInput
                                label="Endereço de Localização"
                                value={shopSettings.address}
                                onChange={e => setShopSettings({ ...shopSettings, address: e.target.value })}
                                icon={<MapPin size={18} className="text-slate-400" />}
                            />
                            <FormInput
                                label="Comissão Padrão (%)"
                                type="number"
                                value={shopSettings.defaultCommissionRate.toString()}
                                onChange={e => setShopSettings({ ...shopSettings, defaultCommissionRate: Number(e.target.value) })}
                                icon={<Percent size={18} className="text-slate-400" />}
                            />
                        </div>
                        <div className="pt-6 flex justify-between items-center border-t border-slate-100">
                            <span className="flex items-center gap-2 text-slate-400 text-sm font-medium"><Globe size={16} /> Suas alterações são aplicadas em tempo real.</span>
                            <Button type="submit" variant="primary" size="lg" className="flex items-center gap-2"><Save size={18} /> Atualizar Barbearia</Button>
                        </div>
                    </form>
                </Card>
      )}

      {/* Modal Adicionar Cartão - Minimalista Stripe Style */}
      {isAddCardModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
                    <Card variant="elevated" className="w-full max-w-md overflow-hidden relative">
                        <Button variant="ghost" size="sm" className="absolute top-6 right-6 z-20" onClick={() => setIsAddCardModalOpen(false)}><X /></Button>
                        <div className="p-10">
                            <span className="flex items-center gap-2 mb-8 text-brand-dark/40 font-bold text-xs uppercase tracking-widest"><ShieldCheck size={18} /> <span>Checkout Seguro</span></span>
                            <span className="text-2xl font-bold text-slate-800 mb-8 tracking-tight block">Adicionar Novo Cartão</span>
                            <form onSubmit={handleAddCard} className="space-y-6">
                                <Card variant="bordered" className="overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                                    <div className="p-4 border-b border-slate-200 flex items-center gap-3">
                                        <CreditCard className="text-slate-400" size={20} />
                                        <input
                                            required
                                            type="text"
                                            placeholder="Número do cartão"
                                            className="w-full bg-transparent outline-none text-slate-800 font-medium"
                                            value={newCard.number}
                                            onChange={e => setNewCard({ ...newCard, number: e.target.value })}
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
                                            onChange={e => setNewCard({ ...newCard, expiry: e.target.value })}
                                        />
                                        <input
                                            required
                                            type="text"
                                            placeholder="CVC"
                                            className="w-1/2 p-4 bg-transparent outline-none text-slate-800 text-sm"
                                            value={newCard.cvc}
                                            onChange={e => setNewCard({ ...newCard, cvc: e.target.value })}
                                        />
                                    </div>
                                </Card>
                                <FormInput
                                    label="Nome no Cartão"
                                    required
                                    value={newCard.name}
                                    onChange={e => setNewCard({ ...newCard, name: e.target.value })}
                                    placeholder="Ex: JOÃO A SILVA"
                                    className="font-bold uppercase"
                                />
                                <Button type="submit" variant="primary" size="lg" className="w-full mt-2">Salvar Cartão</Button>
                            </form>
                        </div>
                    </Card>
                </div>
      )}
            </Section>
        </div>
  );
};
