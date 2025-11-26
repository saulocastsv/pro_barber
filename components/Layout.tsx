import React from 'react';
import { User, UserRole } from '../types';
import { LayoutDashboard, Calendar, Scissors, Users, DollarSign, LogOut, Menu, X, Clock, Bell, User as UserIcon, List, ShoppingBag, Megaphone, ClipboardList } from 'lucide-react';

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

  // Botão Voltar (History logic would pass prop here in real app, simulating visual only)
  // Assumindo que o pai controla, mas aqui renderizaremos se não for dashboard/booking inicial
  const showBackButton = currentView !== 'dashboard' && currentView !== 'booking' && currentView !== 'appointments';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.OWNER, UserRole.BARBER] }, // Updated
    { id: 'calendar', label: 'Agenda', icon: Calendar, roles: [UserRole.OWNER] }, // Barber uses dashboard for schedule
    { id: 'queue', label: 'Fila (Walk-in)', icon: Clock, roles: [UserRole.OWNER, UserRole.BARBER] },
    { id: 'booking', label: 'Reservar', icon: Scissors, roles: [UserRole.CUSTOMER] },
    { id: 'appointments', label: 'Meus Agendamentos', icon: List, roles: [UserRole.CUSTOMER] },
    { id: 'financials', label: 'Financeiro', icon: DollarSign, roles: [UserRole.OWNER] },
    { id: 'team', label: 'Equipe', icon: Users, roles: [UserRole.OWNER] },
    { id: 'inventory', label: 'Estoque', icon: ShoppingBag, roles: [UserRole.OWNER] },
    { id: 'crm', label: 'Fichas Clientes', icon: ClipboardList, roles: [UserRole.OWNER, UserRole.BARBER] }, // Barbers can see CRM
    { id: 'marketing', label: 'Marketing', icon: Megaphone, roles: [UserRole.OWNER] },
  ];

  // If Guest, only show specific options or empty
  const userRole = currentUser?.role || UserRole.CUSTOMER; 
  const filteredMenu = currentUser 
    ? menuItems.filter(item => item.roles.includes(userRole))
    : [{ id: 'booking', label: 'Reservar', icon: Scissors, roles: [UserRole.CUSTOMER] }];

  return (
    <div className="flex h-screen bg-slate-50 font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 bg-slate-900 text-slate-300 transform transition-all duration-300 ease-in-out border-r border-slate-800 shadow-2xl flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        ${isCollapsed ? 'w-20' : 'w-72'}
      `}>
        {/* Logo Area */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-6'} h-24 border-b border-slate-800/50 bg-slate-900 transition-all`}>
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center text-slate-900 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
               <Scissors size={20} strokeWidth={2.5} /> 
            </div>
            {!isCollapsed && (
                <div className="animate-fade-in">
                    <span className="text-xl font-bold tracking-tight text-white block leading-none">Barber<span className="text-amber-500">Pro</span></span>
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Management</span>
                </div>
            )}
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto mt-2 custom-scrollbar">
          {filteredMenu.map(item => {
            const isActive = currentView === item.id;
            return (
                <button
                key={item.id}
                onClick={() => { onNavigate(item.id); setIsMobileMenuOpen(false); }}
                className={`
                    w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-4'} py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden
                    ${isActive 
                    ? 'bg-slate-800 text-white font-semibold shadow-inner' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}
                `}
                title={isCollapsed ? item.label : ''}
                >
                <div className={`flex items-center gap-3 relative z-10`}>
                    <item.icon size={20} className={isActive ? 'text-amber-500' : 'text-slate-500 group-hover:text-slate-300'} />
                    {!isCollapsed && <span>{item.label}</span>}
                </div>
                {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)] absolute right-2"></div>
                )}
                </button>
            )
          })}
        </nav>

        {/* Toggle Collapse */}
        <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex w-full items-center justify-center p-4 border-t border-slate-800 text-slate-500 hover:text-white transition-colors"
        >
            <Menu size={20} />
        </button>

        {/* User Profile */}
        <div className={`p-4 border-t border-slate-800 bg-slate-900/50 ${isCollapsed ? 'items-center' : ''}`}>
          {currentUser ? (
              <>
                <div className={`bg-slate-800/50 rounded-2xl p-2 flex items-center gap-3 mb-3 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer group ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className="relative flex-shrink-0">
                        <img src={currentUser.avatar} alt="User" className="w-9 h-9 rounded-full border border-slate-600 group-hover:border-amber-500 transition-colors object-cover" />
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-800 rounded-full"></div>
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 overflow-hidden animate-fade-in">
                            <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
                            <p className="text-[10px] text-slate-500 truncate capitalize">{currentUser.role.toLowerCase()}</p>
                        </div>
                    )}
                </div>
                <button 
                    onClick={onLogout}
                    className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-dashed border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-slate-600 transition-all text-xs font-medium uppercase tracking-wider ${isCollapsed ? 'px-0' : ''}`}
                    title="Sair"
                >
                    <LogOut size={16} /> {!isCollapsed && 'Sair'}
                </button>
              </>
          ) : (
             <div className="text-center p-4 bg-slate-800/30 rounded-xl">
                 {!isCollapsed && <p className="text-xs text-slate-400 mb-3">Modo Visitante</p>}
                 <button 
                    onClick={onLogout} 
                    className="w-full bg-amber-500 text-slate-900 font-bold py-2 rounded-lg text-xs hover:bg-amber-400 transition-colors flex items-center justify-center"
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
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Menu size={24} />
            </button>
            
            {showBackButton && (
                <button onClick={() => window.history.back()} className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors bg-slate-100 px-3 py-1.5 rounded-lg">
                     Voltar
                </button>
            )}

            <h1 className="text-2xl font-bold text-slate-800 hidden md:block capitalize tracking-tight">
                {menuItems.find(i => i.id === currentView)?.label || 'Agendamento'}
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="hidden lg:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wide">Aberta</span>
             </div>

             <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <Bell size={22} />
                {currentUser && <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
             </button>
          </div>
        </header>

        {/* Viewport */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};