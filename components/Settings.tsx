
import React, { useState } from 'react';
import { User, ShopSettings, UserRole } from '../types';
import { MOCK_SHOP_SETTINGS } from '../constants';
import { Store, User as UserIcon, Clock, MapPin, Phone, Save, Camera } from 'lucide-react';

interface SettingsProps {
  currentUser: User;
}

export const Settings: React.FC<SettingsProps> = ({ currentUser }) => {
  const [shopSettings, setShopSettings] = useState<ShopSettings>(MOCK_SHOP_SETTINGS);
  const [userProfile, setUserProfile] = useState({ ...currentUser });
  const [activeTab, setActiveTab] = useState<'profile' | 'shop'>('profile');

  const handleSaveProfile = (e: React.FormEvent) => {
      e.preventDefault();
      alert('Perfil atualizado com sucesso!');
  };

  const handleSaveShop = (e: React.FormEvent) => {
      e.preventDefault();
      alert('Configurações da barbearia salvas!');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10 max-w-4xl mx-auto">
      <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Configurações</h2>
          <p className="text-slate-500 mt-1">Gerencie seu perfil e dados do negócio.</p>
      </div>

      <div className="flex gap-2 border-b border-slate-200 mb-6">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-4 text-sm font-bold transition-all relative ${activeTab === 'profile' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Meu Perfil
            {activeTab === 'profile' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
          </button>
          {currentUser.role === UserRole.OWNER && (
              <button 
                onClick={() => setActiveTab('shop')}
                className={`pb-3 px-4 text-sm font-bold transition-all relative ${activeTab === 'shop' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Dados da Barbearia
                {activeTab === 'shop' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
              </button>
          )}
      </div>

      {activeTab === 'profile' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
              <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="flex items-center gap-6 mb-8">
                      <div className="relative group cursor-pointer">
                          <img src={userProfile.avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-slate-50 shadow-md" />
                          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Camera className="text-white" size={24} />
                          </div>
                      </div>
                      <div>
                          <h3 className="text-xl font-bold text-slate-800">{userProfile.name}</h3>
                          <p className="text-sm text-slate-500 capitalize">{userProfile.role.toLowerCase()}</p>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                          <div className="relative">
                              <UserIcon size={18} className="absolute left-3 top-3 text-slate-400" />
                              <input 
                                type="text" 
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                                value={userProfile.name}
                                onChange={e => setUserProfile({...userProfile, name: e.target.value})}
                              />
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                          <input 
                            type="email" 
                            disabled
                            className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                            value={userProfile.email}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Telefone / WhatsApp</label>
                          <div className="relative">
                              <Phone size={18} className="absolute left-3 top-3 text-slate-400" />
                              <input 
                                type="tel" 
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                                value={userProfile.phone}
                                onChange={e => setUserProfile({...userProfile, phone: e.target.value})}
                              />
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
                          <input 
                            type="password" 
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                            placeholder="Alterar senha..."
                          />
                      </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                      <button type="submit" className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg flex items-center gap-2">
                          <Save size={18} /> Salvar Alterações
                      </button>
                  </div>
              </form>
          </div>
      ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
              <form onSubmit={handleSaveShop} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Barbearia</label>
                          <div className="relative">
                              <Store size={18} className="absolute left-3 top-3 text-slate-400" />
                              <input 
                                type="text" 
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                                value={shopSettings.shopName}
                                onChange={e => setShopSettings({...shopSettings, shopName: e.target.value})}
                              />
                          </div>
                      </div>
                      <div className="col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Endereço Completo</label>
                          <div className="relative">
                              <MapPin size={18} className="absolute left-3 top-3 text-slate-400" />
                              <input 
                                type="text" 
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                                value={shopSettings.address}
                                onChange={e => setShopSettings({...shopSettings, address: e.target.value})}
                              />
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Horário de Abertura</label>
                          <div className="relative">
                              <Clock size={18} className="absolute left-3 top-3 text-slate-400" />
                              <input 
                                type="time" 
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                                value={shopSettings.openingHours.start}
                                onChange={e => setShopSettings({...shopSettings, openingHours: { ...shopSettings.openingHours, start: e.target.value }})}
                              />
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Horário de Fechamento</label>
                          <div className="relative">
                              <Clock size={18} className="absolute left-3 top-3 text-slate-400" />
                              <input 
                                type="time" 
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                                value={shopSettings.openingHours.end}
                                onChange={e => setShopSettings({...shopSettings, openingHours: { ...shopSettings.openingHours, end: e.target.value }})}
                              />
                          </div>
                      </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                      <button type="submit" className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg flex items-center gap-2">
                          <Save size={18} /> Atualizar Barbearia
                      </button>
                  </div>
              </form>
          </div>
      )}
    </div>
  );
};
