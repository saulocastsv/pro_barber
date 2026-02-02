
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { LayoutDashboard, Calendar, Scissors, Users, DollarSign, LogOut, Menu, X, Clock, Bell, List, ShoppingBag, Megaphone, ClipboardList, Store, PanelLeftClose, PanelLeftOpen, Settings as SettingsIcon, Star, TrendingUp, Tags } from 'lucide-react';
import { MOCK_NOTIFICATIONS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User | null;
  onNavigate: (view: string) => void;
  currentView: string;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentUser, onNavigate, currentView, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.OWNER, UserRole.BARBER, UserRole.CUSTOMER] }, 
    { id: 'calendar', label: 'Agenda', icon: Calendar, roles: [UserRole.OWNER] }, 
    { id: 'queue', label: 'Fila Digital', icon: Clock, roles: [UserRole.OWNER, UserRole.BARBER] },
    { id: 'services', label: 'Serviços', icon: Tags, roles: [UserRole.OWNER] }, // Adicionado para OWNER
    { id: 'strategic', label: 'Assinaturas', icon: TrendingUp, roles: [UserRole.OWNER] }, 
    { id: 'booking', label: 'Novo Agendamento', icon: Scissors, roles: [UserRole.CUSTOMER] },
    { id: 'appointments', label: 'Meus Cortes', icon: List, roles: [UserRole.CUSTOMER] },
    { id: 'shop', label: 'Loja Barvo', icon: Store, roles: [UserRole.CUSTOMER] }, 
    { id: 'financials', label: 'Financeiro', icon: DollarSign, roles: [UserRole.OWNER] },
    { id: 'team', label: 'Equipe', icon: Users, roles: [UserRole.OWNER] },
    { id: 'inventory', label: 'Estoque', icon: ShoppingBag, roles: [UserRole.OWNER] },
    { id: 'crm', label: 'Clientes', icon: ClipboardList, roles: [UserRole.OWNER, UserRole.BARBER] }, 
    { id: 'marketing', label: 'Marketing', icon: Megaphone, roles: [UserRole.OWNER] },
    { id: 'settings', label: 'Configurações', icon: SettingsIcon, roles: [UserRole.OWNER, UserRole.BARBER, UserRole.CUSTOMER] },
  ];

  const userRole = currentUser?.role || UserRole.CUSTOMER; 
  const filteredMenu = currentUser 
    ? menuItems.filter(item => item.roles.includes(userRole))
    : [{ id: 'booking', label: 'Reservar', icon: Scissors, roles: [UserRole.CUSTOMER] }];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-brand-dark/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-brand-dark text-white transform transition-all duration-300 ease-in-out flex flex-col border-r border-white/5 shadow-2xl
        ${isMobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full w-72'} 
        md:translate-x-0 ${isCollapsed ? 'md:w-20' : 'md:w-72'}
      `}>
        <div className={`h-20 flex items-center ${isCollapsed ? 'justify-center' : 'px-6'} border-b border-white/5`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-light rounded-xl flex items-center justify-center text-brand-dark shadow-inner flex-shrink-0">
               <Scissors size={20} /> 
            </div>
            {!isCollapsed && <span className="text-2xl font-bold tracking-tight">Barvo</span>}
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {filteredMenu.map(item => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`
                  w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-200 group
                  ${isActive ? 'bg-brand-light text-brand-dark font-bold shadow-lg' : 'text-slate-400 hover:bg-white/5 hover:text-white'}
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                title={isCollapsed ? item.label : ''}
              >
                <item.icon size={20} className={isActive ? 'text-brand-dark' : 'text-slate-400 group-hover:text-white'} />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* Perfil Sidebar */}
        <div className="p-4 border-t border-white/5">
          {currentUser && (
            <div className={`flex items-center gap-3 p-2 bg-white/5 rounded-2xl ${isCollapsed ? 'justify-center' : ''} relative`}>
              <img src={currentUser.avatar} className="w-9 h-9 rounded-xl object-cover border border-white/10" alt="Avatar" />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{currentUser.role}</p>
                </div>
              )}
              {(!isCollapsed && currentUser.role === UserRole.CUSTOMER) && (
                <div className="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                   <Star size={8} fill="currentColor" /> {currentUser.points || 0}
                </div>
              )}
            </div>
          )}
          <button 
            onClick={onLogout}
            className={`w-full mt-3 flex items-center gap-2 p-3 text-slate-400 hover:text-red-400 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={20} /> {!isCollapsed && <span className="text-sm font-bold">Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isCollapsed ? 'md:ml-20' : 'md:ml-72'}`}>
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-brand-dark hover:bg-slate-100 rounded-lg">
                <Menu size={24} />
            </button>
            <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden md:p-2 text-slate-400 hover:text-brand-dark rounded-lg transition-colors">
                {isCollapsed ? <PanelLeftOpen size={24} /> : <PanelLeftClose size={24} />}
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-brand-dark capitalize tracking-tight">
                {menuItems.find(i => i.id === currentView)?.label || 'Agendamento'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-100 p-2 rounded-full text-slate-400 hover:text-brand-dark transition-colors cursor-pointer relative">
                <Bell size={22} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
