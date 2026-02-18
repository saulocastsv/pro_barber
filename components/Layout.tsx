
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { User, UserRole, Notification } from '../types';
import { AvatarComponent } from './AvatarComponent';
import { UIButton, Section } from './UIKit';
import { 
  LayoutDashboard, Calendar, Scissors, Users, DollarSign, LogOut, 
  Menu, X, Clock, Bell, List, ShoppingBag, Megaphone, ClipboardList, 
  Store, PanelLeftClose, PanelLeftOpen, Settings as SettingsIcon, 
  TrendingUp, Tags, MoreHorizontal, PackageSearch, Package, Check, BarChart3
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User | null;
  onNavigate: (view: string) => void;
  currentView: string;
  onLogout: () => void;
  notifications: Notification[];
  onMarkAllRead: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentUser, 
  onNavigate, 
  currentView, 
  onLogout,
  notifications,
  onMarkAllRead
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsNotifOpen(false);
  }, [currentView]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard, roles: [UserRole.OWNER, UserRole.BARBER, UserRole.CUSTOMER] }, 
    { id: 'calendar', label: 'Agenda', icon: Calendar, roles: [UserRole.OWNER] }, 
    { id: 'queue', label: 'Fila', icon: Clock, roles: [UserRole.OWNER, UserRole.BARBER] },
    { id: 'services', label: 'Serviços', icon: Tags, roles: [UserRole.OWNER] }, 
    { id: 'strategic', label: 'Assinaturas', icon: TrendingUp, roles: [UserRole.OWNER] }, 
    { id: 'investor', label: 'Visão Investidor', icon: BarChart3, roles: [UserRole.OWNER] },
    { id: 'booking', label: 'Reservar', icon: Scissors, roles: [UserRole.CUSTOMER] },
    { id: 'appointments', label: 'Cortes', icon: List, roles: [UserRole.CUSTOMER] },
    { id: 'shop', label: 'Loja', icon: Store, roles: [UserRole.CUSTOMER] }, 
    { id: 'orders', label: 'Pedidos', icon: Package, roles: [UserRole.CUSTOMER] },
    { id: 'order_management', label: 'Pedidos Loja', icon: PackageSearch, roles: [UserRole.OWNER] },
    { id: 'financials', label: 'Financeiro', icon: DollarSign, roles: [UserRole.OWNER] },
    { id: 'team', label: 'Equipe', icon: Users, roles: [UserRole.OWNER] },
    { id: 'inventory', label: 'Estoque', icon: ShoppingBag, roles: [UserRole.OWNER] },
    { id: 'crm', label: 'Clientes', icon: ClipboardList, roles: [UserRole.OWNER, UserRole.BARBER] }, 
    { id: 'marketing', label: 'Marketing', icon: Megaphone, roles: [UserRole.OWNER] },
    { id: 'settings', label: 'Ajustes', icon: SettingsIcon, roles: [UserRole.OWNER, UserRole.BARBER, UserRole.CUSTOMER] },
  ];

  const userRole = currentUser?.role || UserRole.CUSTOMER; 
  const filteredMenu = currentUser 
    ? menuItems.filter(item => item.roles.includes(userRole))
    : [{ id: 'booking', label: 'Reservar', icon: Scissors, roles: [UserRole.CUSTOMER] }];

  const getBottomNavItems = () => {
    if (userRole === UserRole.OWNER) return filteredMenu.filter(i => ['dashboard', 'calendar', 'order_management'].includes(i.id));
    if (userRole === UserRole.BARBER) return filteredMenu.filter(i => ['dashboard', 'queue', 'crm'].includes(i.id));
    return filteredMenu.filter(i => ['dashboard', 'booking', 'orders'].includes(i.id));
  };

  const bottomNavItems = getBottomNavItems();

  return (
    <div className="flex h-screen bg-brand-gray font-sans overflow-hidden select-none">
      {/* Sidebar - Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-[60] glass-sidebar text-white transition-all duration-300 ease-in-out flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'} 
        md:translate-x-0 ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}
      >
        <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center' : 'px-6'} border-b border-white/5`}>
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <Image
              src="/logo-branco.png"
              alt="Barvo"
              width={32}
              height={32}
              className="object-contain"
            />
            {!isCollapsed && <span className="text-lg font-extrabold tracking-tighter italic text-white">BARVO</span>}
          </div>
          {isMobileMenuOpen && (
            <UIButton onClick={() => setIsMobileMenuOpen(false)} variant="ghost" size="sm" className="ml-auto md:hidden text-white/50">
              <X size={20} />
            </UIButton>
          )}
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto custom-scrollbar">
          {filteredMenu.map(item => {
            const isActive = currentView === item.id;
            return (
              <UIButton
                key={item.id}
                onClick={() => onNavigate(item.id)}
                variant={isActive ? 'primary' : 'ghost'}
                size="md"
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group relative ${isCollapsed ? 'justify-center' : ''} ${isActive ? 'font-semibold' : 'font-normal'}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <item.icon size={18} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'} />
                {!isCollapsed && <span className="text-xs tracking-wide">{item.label}</span>}
                {isActive && !isCollapsed && <div className="ml-auto w-1 h-1 bg-brand-light rounded-full" />}
              </UIButton>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/5">
          <UIButton 
            onClick={onLogout}
            variant="ghost"
            size="md"
            className={`w-full flex items-center gap-3 p-3 text-slate-500 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all ${isCollapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={18} /> {!isCollapsed && <span className="text-xs font-semibold">Sair</span>}
          </UIButton>
        </div>
      </aside>
      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isCollapsed ? 'md:ml-20' : 'md:ml-64'} pb-16 md:pb-0`}>
        <header className="h-14 bg-white/70 backdrop-blur-md border-b border-slate-200/50 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <UIButton onClick={() => setIsMobileMenuOpen(true)} variant="ghost" size="sm" className="md:hidden p-1.5 text-brand-dark bg-slate-100 rounded-lg">
              <Menu size={18} />
            </UIButton>
            <UIButton onClick={() => setIsCollapsed(!isCollapsed)} variant="ghost" size="sm" className="hidden md:flex p-2 text-slate-400 hover:text-brand-dark hover:bg-white rounded-lg transition-all border border-slate-100">
              {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </UIButton>
            <h1 className="text-base md:text-lg font-bold text-brand-black tracking-tight">
              {menuItems.find(i => i.id === currentView)?.label || 'Barvo'}
            </h1>
          </div>
          <div className="flex items-center gap-3 relative" ref={notifRef}>
            {/* Notification Button */}
            <UIButton 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              variant="ghost"
              size="sm"
              className={`bg-white p-2 rounded-lg border border-slate-100 cursor-pointer relative transition-all active:scale-95 ${isNotifOpen ? 'text-brand-dark border-brand-light' : 'text-slate-400 hover:text-brand-dark'}`}
              aria-label="Notificações"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full border-2 border-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </UIButton>
            {/* Notification Dropdown */}
            {isNotifOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 md:w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-fade-in origin-top-right">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <span className="text-xs font-black text-brand-dark uppercase tracking-widest">Notificações</span>
                  <UIButton onClick={onMarkAllRead} variant="ghost" size="sm" className="text-[10px] font-bold text-blue-600 hover:underline">Marcar todas como lidas</UIButton>
                </div>
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  {notifications.length > 0 ? notifications.map(n => (
                    <div key={n.id} className={`p-4 border-b border-slate-50 flex gap-3 hover:bg-slate-50 transition-colors ${!n.read ? 'bg-blue-50/30' : ''}`}>
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.read ? 'bg-slate-200' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'}`} />
                      <div>
                        <p className={`text-xs font-bold ${!n.read ? 'text-slate-900' : 'text-slate-600'}`}>{n.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                        <p className="text-[9px] text-slate-400 mt-2 font-medium uppercase">{n.time}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="p-10 text-center text-slate-400">
                      <Bell size={24} className="mx-auto mb-2 opacity-20" />
                      <p className="text-xs font-medium">Nenhuma notificação por enquanto.</p>
                    </div>
                  )}
                </div>
                <div className="p-3 text-center bg-slate-50 border-t border-slate-100">
                  <UIButton onClick={() => setIsNotifOpen(false)} variant="ghost" size="sm" className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-brand-dark">Fechar Painel</UIButton>
                </div>
              </div>
            )}
            {currentUser && (
              <UIButton
                onClick={() => onNavigate('settings')}
                variant="ghost"
                size="sm"
                className="hover:opacity-80 transition-all"
                aria-label="Configurações"
              >
                <AvatarComponent url={currentUser.avatar} name={currentUser.name} size="sm" className="cursor-pointer" />
              </UIButton>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-brand-gray/30 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <div className="animate-fade-in">
              {children}
            </div>
          </div>
        </main>
        {/* Bottom Nav - Mobile Only */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white/90 backdrop-blur-md border-t border-slate-200 flex items-center justify-around px-2 z-50">
          {bottomNavItems.map(item => {
            const isActive = currentView === item.id;
            return (
              <UIButton
                key={item.id}
                onClick={() => onNavigate(item.id)}
                variant={isActive ? 'primary' : 'ghost'}
                size="sm"
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 transition-all ${isActive ? 'text-brand-dark' : 'text-slate-400'}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <item.icon size={18} className={isActive ? 'text-brand-dark' : ''} />
                <span className={`text-[9px] font-bold uppercase tracking-tighter ${isActive ? 'opacity-100' : 'opacity-60'}`}>{item.label}</span>
              </UIButton>
            );
          })}
          <UIButton onClick={() => setIsMobileMenuOpen(true)} variant="ghost" size="sm" className="flex flex-col items-center justify-center gap-0.5 flex-1 text-slate-400">
            <MoreHorizontal size={18} />
            <span className="text-[9px] font-bold uppercase tracking-tighter opacity-60">Mais</span>
          </UIButton>
        </div>
      </div>
    </div>
  );
};
