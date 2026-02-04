
import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { CalendarView } from './components/CalendarView';
import { QueueSystem } from './components/QueueSystem';
import { BookingFlow } from './components/BookingFlow';
import { AuthScreen } from './components/AuthScreen';
import { ChatAssistant } from './components/ChatAssistant';
import { BarberDashboard } from './components/BarberDashboard';
import { CustomerDashboard } from './components/CustomerDashboard';
import { CustomerAppointments } from './components/CustomerAppointments';
import { ServicesManagement } from './components/ServicesManagement';
import { Financials } from './components/Financials';
import { Team } from './components/Team';
import { Inventory } from './components/Inventory';
import { CustomerCRM } from './components/CustomerCRM';
import { MarketingTools } from './components/MarketingTools';
import { Settings } from './components/Settings';
import { Shop } from './components/Shop';
import { OrderManagement } from './components/OrderManagement';
import { CustomerOrders } from './components/CustomerOrders';
import { StrategicGrowth } from './components/StrategicGrowth';

import { supabase, isSupabaseConfigured } from './services/supabaseClient';
import { db } from './services/databaseService';
import { User, UserRole, Appointment, Service, InventoryItem, Order, ShopSettings, Notification, MembershipPlan } from './types';
import { MOCK_STATS, MOCK_SHOP_SETTINGS, MOCK_MEMBERSHIP_PLANS, MOCK_NOTIFICATIONS, MOCK_TRANSACTIONS } from './constants';
// Added RefreshCw to imports
import { Wifi, WifiOff, AlertCircle, Scissors, Loader2, RefreshCw } from 'lucide-react';

function App() {
  // --- AUTH STATES ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  
  // --- APP DATA STATES ---
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [shopSettings, setShopSettings] = useState<ShopSettings>(MOCK_SHOP_SETTINGS);
  const [membershipPlans, setMembershipPlans] = useState<MembershipPlan[]>(MOCK_MEMBERSHIP_PLANS);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  // --- UI/STATUS STATES ---
  const [dbStatus, setDbStatus] = useState<'connected' | 'offline'>('offline');
  const [globalError, setGlobalError] = useState<string | null>(null);

  /**
   * Sincroniza todos os dados da barbearia atual do usuário.
   * Utilizado no login e em ações de atualização (Refresh).
   */
  const syncAppData = useCallback(async (user: User) => {
    if (!isSupabaseConfigured()) {
        setDbStatus('offline');
        return;
    }
    
    try {
      setIsLoading(true);
      const barbershopId = user.role === UserRole.OWNER 
        ? (await db.getBarbershopByOwner(user.id))?.id 
        : user.barbershopId;

      if (barbershopId) {
        const [svc, appts, inv, ord, shop] = await Promise.all([
          db.getServices(barbershopId),
          db.getAppointments(barbershopId),
          db.getInventory(barbershopId),
          db.getOrders(barbershopId),
          db.getBarbershopById(barbershopId)
        ]);

        setServices(svc);
        setAppointments(appts);
        setInventory(inv);
        setOrders(ord);
        setShopSettings({
          shopName: shop.name,
          address: shop.address,
          phone: shop.phone,
          openingHours: shop.opening_hours,
          workingDays: shop.working_days,
          defaultCommissionRate: shop.default_commission_rate
        });
        setDbStatus('connected');
      }
    } catch (err: any) {
      console.error("Erro na sincronização:", err);
      setGlobalError("Falha ao sincronizar dados com o servidor.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- EFECTS ---

  // 1. Checa sessão persistente ao iniciar
  useEffect(() => {
    const checkSession = async () => {
      if (isSupabaseConfigured()) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const profile = await db.getProfile(session.user.id);
          if (profile) {
            const user = { ...profile, email: session.user.email };
            setCurrentUser(user);
            await syncAppData(user);
          }
        }
      }
      setIsLoading(false);
    };
    checkSession();
  }, [syncAppData]);

  // --- HANDLERS ---

  const handleLogin = async (user: User) => {
    setCurrentUser(user);
    setIsGuest(false);
    await syncAppData(user);
    setCurrentView('dashboard');
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured()) await supabase.auth.signOut();
    setCurrentUser(null);
    setIsGuest(false);
    setCurrentView('dashboard');
  };

  const handleAddAppointment = async (appt: Partial<Appointment>) => {
    try {
        if (!currentUser?.barbershopId && currentUser?.role !== UserRole.OWNER) {
            throw new Error("Usuário sem barbearia vinculada.");
        }
        
        const shopId = currentUser.role === UserRole.OWNER 
          ? (await db.getBarbershopByOwner(currentUser.id))?.id 
          : currentUser.barbershopId;

        const newAppt = await db.createAppointment({
            ...appt,
            barbershop_id: shopId,
            status: 'CONFIRMED',
            startTime: appt.startTime?.toISOString()
        });
        
        setAppointments(prev => [...prev, { ...newAppt, startTime: new Date(newAppt.startTime) }]);
        return true;
    } catch (err) {
        setGlobalError("Não foi possível salvar o agendamento.");
        return false;
    }
  };

  // --- RENDERING ---

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-brand-dark text-white font-black animate-pulse">
        <Scissors size={48} className="mb-4 text-brand-light" />
        <span className="tracking-[0.3em] uppercase text-xs">Carregando Barvo...</span>
      </div>
    );
  }

  if (!currentUser && !isGuest) {
    return <AuthScreen onLogin={handleLogin} onGuestContinue={() => { setIsGuest(true); setCurrentView('booking'); }} />;
  }

  const renderContent = () => {
    const role = currentUser?.role || UserRole.CUSTOMER;
    
    switch (currentView) {
      case 'dashboard':
        if (role === UserRole.OWNER) return <Dashboard stats={MOCK_STATS} onNavigate={setCurrentView} />;
        if (role === UserRole.BARBER) return <BarberDashboard currentUser={currentUser!} appointments={appointments} commissionRate={shopSettings.defaultCommissionRate || 50} onCompleteAppointment={(id) => db.updateAppointmentStatus(id, 'COMPLETED')} onNoShow={(id) => db.updateAppointmentStatus(id, 'CANCELLED')} services={services} exceptions={[]} onBlockTime={() => {}} />;
        return <CustomerDashboard currentUser={currentUser!} appointments={appointments} onNavigate={setCurrentView} membershipPlans={membershipPlans} />;
      
      case 'calendar': 
        return <CalendarView appointments={appointments} barbers={[]} services={services} onAddAppointment={handleAddAppointment} />;
      
      case 'booking': 
        return <BookingFlow currentUser={currentUser} initialData={null} services={services} onBook={handleAddAppointment} shopSettings={shopSettings} allAppointments={appointments} availabilityExceptions={[]} />;
      
      case 'shop': 
        return <Shop currentUser={currentUser!} inventory={inventory} onPurchase={async (items, total) => {
            const shopId = currentUser?.role === UserRole.OWNER ? (await db.getBarbershopByOwner(currentUser.id))?.id : currentUser?.barbershopId;
            await db.createOrder({ customerId: currentUser?.id, items, totalAmount: total, barbershop_id: shopId, status: 'PAID' });
            await syncAppData(currentUser!);
            return true;
        }} />;
      
      case 'inventory': 
        return <Inventory items={inventory} onUpdateItem={async (item, action) => {
            if (action === 'UPSERT') {
                const shopId = currentUser?.role === UserRole.OWNER ? (await db.getBarbershopByOwner(currentUser!.id))?.id : currentUser?.barbershopId;
                await db.upsertInventoryItem({ ...item, barbershop_id: shopId });
            }
            await syncAppData(currentUser!);
        }} />;
      
      case 'services': 
        return <ServicesManagement services={services} onUpdateServices={async (newServices) => {
            // Em uma implementação real, o componente ServicesManagement chamaria db.saveService/deleteService individualmente
            setServices(newServices);
        }} />;

      case 'order_management':
        return <OrderManagement orders={orders} users={[]} onNavigate={setCurrentView} onUpdateStatus={async (id, status, track) => {
            await db.updateOrderStatus(id, status, track);
            await syncAppData(currentUser!);
        }} />;

      case 'financials':
        return <Financials transactions={MOCK_TRANSACTIONS} />;

      case 'settings': 
        return <Settings currentUser={currentUser!} settings={shopSettings} onUpdateSettings={setShopSettings} onUpdateUser={setCurrentUser} />;
      
      default: 
        return <Dashboard stats={MOCK_STATS} onNavigate={setCurrentView} />;
    }
  };

  return (
    <Layout 
      currentUser={currentUser} 
      currentView={currentView} 
      onNavigate={setCurrentView} 
      onLogout={handleLogout}
      notifications={notifications}
      onMarkAllRead={() => setNotifications(prev => prev.map(n => ({...n, read: true})))}
    >
      {globalError && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex justify-between items-center rounded-r-xl shadow-sm animate-slide-in">
              <div className="flex items-center gap-2 font-bold"><AlertCircle size={20}/> {globalError}</div>
              <button onClick={() => setGlobalError(null)} className="text-xs font-black uppercase hover:underline">Fechar</button>
          </div>
      )}
      
      <div className="mb-6 flex justify-between items-center">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${dbStatus === 'connected' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
          {dbStatus === 'connected' ? <Wifi size={12}/> : <WifiOff size={12}/>}
          {dbStatus === 'connected' ? 'Sincronizado' : 'Modo Offline'}
        </div>
        {dbStatus === 'connected' && (
            <button onClick={() => syncAppData(currentUser!)} className="p-2 text-slate-400 hover:text-brand-dark transition-all">
                <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            </button>
        )}
      </div>

      {renderContent()}
      
      <ChatAssistant currentUser={currentUser} />
    </Layout>
  );
}

export default App;
