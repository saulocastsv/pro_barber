
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { LayoutDashboard, Calendar, Scissors, Users, DollarSign, LogOut, Menu, X, Clock, Bell, List, ShoppingBag, Megaphone, ClipboardList, Store, PanelLeftClose, PanelLeftOpen, Settings as SettingsIcon } from 'lucide-react';
import { MOCK_NOTIFICATIONS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User | null; // Can be null (Guest)
  onNavigate: (view: string) => void;
  currentView: string;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentUser, onNavigate, currentView, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Botão Voltar (History logic would pass prop here in real app, simulating visual only)
  const showBackButton = currentView !== 'dashboard' && currentView !== 'booking' && currentView !== 'appointments' && currentView !== 'shop';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.OWNER, UserRole.BARBER] }, 
    { id: 'calendar', label: 'Agenda', icon: Calendar, roles: [UserRole.OWNER] }, 
    { id: 'queue', label: 'Fila (Walk-in)', icon: Clock, roles: [UserRole.OWNER, UserRole.BARBER] },
    { id: 'booking', label: 'Reservar', icon: Scissors, roles: [UserRole.CUSTOMER] },
    { id: 'appointments', label: 'Meus Agendamentos', icon: List, roles: [UserRole.CUSTOMER] },
    { id: 'shop', label: 'Loja', icon: Store, roles: [UserRole.CUSTOMER] }, 
    { id: 'financials', label: 'Financeiro', icon: DollarSign, roles: [UserRole.OWNER] },
    { id: 'team', label: 'Equipe', icon: Users, roles: [UserRole.OWNER] },
    { id: 'inventory', label: 'Estoque', icon: ShoppingBag, roles: [UserRole.OWNER] },
    { id: 'crm', label: 'Fichas Clientes', icon: ClipboardList, roles: [UserRole.OWNER, UserRole.BARBER] }, 
    { id: 'marketing', label: 'Marketing', icon: Megaphone, roles: [UserRole.OWNER] },
    { id: 'settings', label: 'Configurações', icon: SettingsIcon, roles: [UserRole.OWNER, UserRole.BARBER, UserRole.CUSTOMER] },
  ];

  // If Guest, only show specific options or empty
  const userRole = currentUser?.role || UserRole.CUSTOMER; 
  const filteredMenu = currentUser 
    ? menuItems.filter(item => item.roles.includes(userRole))
    : [{ id: 'booking', label: 'Reservar', icon: Scissors, roles: [UserRole.CUSTOMER] }];

  const handleMobileLinkClick = (viewId: string) => {
      onNavigate(viewId);
      setIsMobileMenuOpen(false);
  };

  const handleMobileLogout = () => {
      onLogout();
      setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out border-r border-slate-800 shadow-2xl flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        w-[85%] sm:w-80 ${isCollapsed ? 'md:w-20' : 'md:w-72'}
      `}>
        {/* Logo Area */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-6'} h-20 border-b border-slate-800/50 bg-slate-900 transition-all shrink-0`}>
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => handleMobileLinkClick('dashboard')}>
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center text-slate-900 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
               <Scissors size={20} strokeWidth={2.5} /> 
            </div>
            {!isCollapsed && (
                <div className="animate-fade-in whitespace-nowrap">
                    <span className="text-xl font-bold tracking-tight text-white block leading-none">Barber<span className="text-amber-500">Pro</span></span>
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Management</span>
                </div>
            )}
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto mt-2 custom-scrollbar overflow-x-hidden">
          {filteredMenu.map(item => {
            const isActive = currentView === item.id;
            return (
                <button
                key={item.id}
                onClick={() => handleMobileLinkClick(item.id)}
                className={`
                    w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-4'} py-3.5 rounded-xl transition-all duration-200 group relative touch-manipulation
                    ${isActive 
                    ? 'bg-slate-800 text-white font-semibold shadow-inner' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}
                `}
                title={isCollapsed ? item.label : ''}
                >
                <div className={`flex items-center gap-3 relative z-10`}>
                    <item.icon size={20} className={`flex-shrink-0 ${isActive ? 'text-amber-500' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                </div>
                {isActive && (
                    <div className={`w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)] absolute ${isCollapsed ? 'top-2 right-2' : 'right-2'}`}></div>
                )}
                </button>
            )
          })}
        </nav>

        {/* User Profile */}
        <div className={`p-4 border-t border-slate-800 bg-slate-900/50 shrink-0 pb-safe ${isCollapsed ? 'items-center' : ''}`}>
          {currentUser ? (
              <>
                <div className={`bg-slate-800/50 rounded-2xl p-2 flex items-center gap-3 mb-3 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer group ${isCollapsed ? 'justify-center' : ''}`} onClick={() => handleMobileLinkClick('settings')}>
                    <div className="relative flex-shrink-0">
                        <img src={currentUser.avatar} alt="User" className="w-9 h-9 rounded-full border border-slate-600 group-hover:border-amber-500 transition-colors object-cover" />
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-800 rounded-full"></div>
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 overflow-hidden animate-fade-in">
                            <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
                            <p className="text-[10px] text-slate-500 truncate capitalize">{currentUser.role.toLowerCase()}</p>
                            {currentUser.points !== undefined && (
                                <p className="text-[10px] text-amber-500 font-bold mt-0.5">{currentUser.points} pts</p>
                            )}
                        </div>
                    )}
                </div>
                <button 
                    onClick={handleMobileLogout}
                    className={`w-full flex items-center justify-center gap-2 px-3 py-3 md:py-2 rounded-xl border border-dashed border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-slate-600 transition-all text-xs font-medium uppercase tracking-wider touch-manipulation ${isCollapsed ? 'px-0' : ''}`}
                    title="Sair"
                >
                    <LogOut size={16} /> {!isCollapsed && 'Sair'}
                </button>
              </>
          ) : (
             <div className="text-center p-4 bg-slate-800/30 rounded-xl">
                 {!isCollapsed && <p className="text-xs text-slate-400 mb-3">Modo Visitante</p>}
                 <button 
                    onClick={handleMobileLogout} 
                    className="w-full bg-amber-500 text-slate-900 font-bold py-3 md:py-2 rounded-lg text-xs hover:bg-amber-400 transition-colors flex items-center justify-center touch-manipulation"
                 >
                    {!isCollapsed ? 'Fazer Login' : <LogOut size={16} className="rotate-180"/>}
                 </button>
             </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 relative transition-all duration-300 ${isCollapsed ? 'md:ml-20' : 'md:ml-72'}`}>
        {/* Header */}
        <header className="h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 md:px-10 sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-3 md:gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-slate-600 p-2 -ml-2 hover:bg-slate-100 rounded-lg transition-colors active:scale-95">
                <Menu size={24} />
            </button>

            <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden md:flex text-slate-400 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                title={isCollapsed ? "Expandir Menu" : "Recolher Menu"}
            >
                {isCollapsed ? <PanelLeftOpen size={24} /> : <PanelLeftClose size={24} />}
            </button>
            
            {showBackButton && (
                <button onClick={() => window.history.back()} className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors bg-slate-100 px-3 py-1.5 rounded-lg active:scale-95">
                     Voltar
                </button>
            )}

            <h1 className="text-lg md:text-2xl font-bold text-slate-800 capitalize tracking-tight ml-1 md:ml-2 truncate max-w-[150px] md:max-w-none">
                {menuItems.find(i => i.id === currentView)?.label || 'Agendamento'}
            </h1>
          </div>
          
          <div className="flex items-center gap-3 md:gap-6">
             <div className="hidden lg:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wide">Aberta</span>
             </div>

             {/* Notification Dropdown */}
             <div className="relative">
                 <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors active:scale-95"
                 >
                    <Bell size={22} />
                    {currentUser && <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
                 </button>

                 {showNotifications && (
                     <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-fade-in origin-top-right">
                            <div className="p-4 border-b border-slate-100 bg-slate-50">
                                <h4 className="font-bold text-slate-800 text-sm">Notificações</h4>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {MOCK_NOTIFICATIONS.map(note => (
                                    <div key={note.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!note.read ? 'bg-blue-50/30' : ''}`}>
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="font-bold text-sm text-slate-800">{note.title}</p>
                                            <span className="text-[10px] text-slate-400">{note.time}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 leading-relaxed">{note.message}</p>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full py-3 text-xs font-bold text-blue-600 hover:bg-slate-50 transition-colors">
                                Marcar todas como lidas
                            </button>
                        </div>
                     </>
                 )}
             </div>
          </div>
        </header>

        {/* Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 scroll-smooth pb-24 md:pb-6">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
