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
import { StrategicGrowth } from './components/StrategicGrowth';
import { Financials } from './components/Financials';
import { Team } from './components/Team';
import { Inventory } from './components/Inventory';
import { CustomerCRM } from './components/CustomerCRM';
import { MarketingTools } from './components/MarketingTools';
import { Settings } from './components/Settings';
import { Shop } from './components/Shop';
import { OrderManagement } from './components/OrderManagement';
import { CustomerOrders } from './components/CustomerOrders';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';
import { User, UserRole, Appointment, Service, InventoryItem, Transaction, Order, ShopSettings, OrderStatus, TechnicalNote, BarberAvailabilityException, LoyaltyAutomation, MembershipPlan } from './types';
import { MOCK_STATS, MOCK_SHOP_SETTINGS, MOCK_APPOINTMENTS, SERVICES, MOCK_INVENTORY, MOCK_TRANSACTIONS, MOCK_USERS, MOCK_NOTES, MOCK_AUTOMATIONS, MOCK_MEMBERSHIP_PLANS } from './constants';
import { AlertCircle, Database } from 'lucide-react';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  
  // Database States
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [services, setServices] = useState<Service[]>(SERVICES);
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [automations, setAutomations] = useState<LoyaltyAutomation[]>(MOCK_AUTOMATIONS);
  const [plans, setPlans] = useState<MembershipPlan[]>(MOCK_MEMBERSHIP_PLANS);
  const [notes, setNotes] = useState<TechnicalNote[]>(MOCK_NOTES);
  const [shopSettings, setShopSettings] = useState<ShopSettings>(MOCK_SHOP_SETTINGS);

  // 1. Initial Load & Auth Check
  useEffect(() => {
    const checkUser = async () => {
      if (!isSupabaseConfigured()) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profile) setCurrentUser(profile as User);
          else {
            const newProfile: User = {
              id: session.user.id,
              name: session.user.user_metadata?.full_name || 'Usuário',
              role: (session.user.user_metadata?.role as UserRole) || UserRole.CUSTOMER,
              avatar: session.user.user_metadata?.avatar_url || `https://picsum.photos/seed/${session.user.id}/100/100`,
              email: session.user.email,
              points: 0
            };
            setCurrentUser(newProfile);
          }
        }
      } catch (err) {
        console.warn("Falha silenciosa no check de auth (modo offline ativo).");
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    // Inicia listener apenas se configurado
    if (isSupabaseConfigured()) {
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          setIsGuest(false);
        } else if (event === 'SIGNED_IN' && session) {
          checkUser();
        }
      });
      return () => authListener.subscription.unsubscribe();
    }
  }, []);

  // 2. Load Data and Setup Realtime Subscriptions
  useEffect(() => {
    if (!isSupabaseConfigured() || (!currentUser && !isGuest)) return;

    const fetchData = async () => {
      try {
        const [resServices, resAppts, resInventory, resProfiles] = await Promise.all([
          supabase.from('services').select('*'),
          supabase.from('appointments').select('*'),
          supabase.from('inventory').select('*'),
          supabase.from('profiles').select('*')
        ]);

        if (resServices.data) setServices(resServices.data);
        if (resAppts.data) {
          setAppointments(resAppts.data.map((a: any) => ({
            ...a,
            startTime: new Date(a.start_time),
            barberId: a.barber_id,
            serviceId: a.service_id,
            customerId: a.customer_id,
            customerName: a.customer_name
          })));
        }
        if (resInventory.data) setInventory(resInventory.data);
        if (resProfiles.data) setUsers(resProfiles.data);
      } catch (e) {
        console.warn("Falha ao buscar dados reais do banco.");
      }
    };

    fetchData();

    if (isSupabaseConfigured()) {
      const channel = supabase
        .channel('db-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, (payload) => {
          if (payload.eventType === 'INSERT') {
            const newAppt = {
              ...payload.new,
              startTime: new Date(payload.new.start_time),
              barberId: payload.new.barber_id,
              serviceId: payload.new.service_id,
              customerId: payload.new.customer_id,
              customerName: payload.new.customer_name
            } as Appointment;
            setAppointments(prev => [...prev.filter(a => a.id !== newAppt.id), newAppt]);
          } else if (payload.eventType === 'UPDATE') {
            setAppointments(prev => prev.map(a => a.id === payload.new.id ? {
              ...payload.new,
              startTime: new Date(payload.new.start_time),
              barberId: payload.new.barber_id,
              serviceId: payload.new.service_id,
              customerId: payload.new.customer_id,
              customerName: payload.new.customer_name
            } as Appointment : a));
          } else if (payload.eventType === 'DELETE') {
            setAppointments(prev => prev.filter(a => a.id !== payload.old.id));
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, (payload) => {
          if (payload.eventType === 'INSERT') setInventory(prev => [...prev, payload.new as InventoryItem]);
          if (payload.eventType === 'UPDATE') setInventory(prev => prev.map(i => i.id === payload.new.id ? payload.new as InventoryItem : i));
          if (payload.eventType === 'DELETE') setInventory(prev => prev.filter(i => i.id !== payload.old.id));
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentUser, isGuest]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsGuest(false);
    setCurrentView('dashboard');
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured()) await supabase.auth.signOut();
    setCurrentUser(null);
    setIsGuest(false);
  };

  const handleAddAppointment = async (apptData: Partial<Appointment>) => {
    if (!isSupabaseConfigured()) {
      const localAppt = { ...apptData, id: `local_${Date.now()}`, status: 'CONFIRMED' } as Appointment;
      setAppointments(prev => [...prev, localAppt]);
      return true;
    }

    const { error } = await supabase.from('appointments').insert([{
      barber_id: apptData.barberId,
      customer_id: apptData.customerId || currentUser?.id,
      customer_name: apptData.customerName || currentUser?.name,
      service_id: apptData.serviceId,
      start_time: apptData.startTime?.toISOString(),
      status: 'CONFIRMED',
      payment_method: apptData.paymentMethod,
      payment_status: apptData.paymentStatus
    }]);

    if (error) {
      alert("Erro ao agendar: " + error.message);
      return false;
    }
    return true;
  };

  const updateApptStatus = async (id: string, status: 'COMPLETED' | 'CANCELLED' | 'CONFIRMED') => {
    if (isSupabaseConfigured()) {
      await supabase.from('appointments').update({ status }).eq('id', id);
    } else {
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-brand-dark text-white font-black animate-pulse">BARVO...</div>;

  if (!currentUser && !isGuest) {
    return <AuthScreen onLogin={handleLogin} onGuestContinue={() => { setIsGuest(true); setCurrentView('booking'); }} />;
  }

  const renderContent = () => {
    const role = currentUser?.role || UserRole.CUSTOMER;

    switch (currentView) {
      case 'dashboard':
        if (role === UserRole.OWNER) return <Dashboard stats={MOCK_STATS} onNavigate={setCurrentView} />;
        if (role === UserRole.BARBER) return <BarberDashboard currentUser={currentUser!} appointments={appointments} commissionRate={shopSettings.defaultCommissionRate || 50} onCompleteAppointment={(id) => updateApptStatus(id, 'COMPLETED')} onNoShow={(id) => updateApptStatus(id, 'CANCELLED')} services={services} exceptions={[]} onBlockTime={() => {}} />;
        return <CustomerDashboard currentUser={currentUser!} appointments={appointments} onNavigate={setCurrentView} membershipPlans={plans} />;
      
      case 'calendar':
        return <CalendarView appointments={appointments} barbers={users.filter(u => u.role === UserRole.BARBER)} services={services} onAddAppointment={handleAddAppointment} />;
      
      case 'booking':
        return <BookingFlow currentUser={currentUser} initialData={null} services={services} onBook={handleAddAppointment} shopSettings={shopSettings} allAppointments={appointments} availabilityExceptions={[]} />;
      
      case 'appointments':
        return <CustomerAppointments currentUser={currentUser!} appointments={appointments} services={services} onCancel={(id) => updateApptStatus(id, 'CANCELLED')} onRebook={(a) => { setCurrentView('booking'); }} onNavigate={setCurrentView} />;

      case 'queue':
        return <QueueSystem initialQueue={[]} services={services} />;

      case 'shop':
        return <Shop currentUser={currentUser!} inventory={inventory} onPurchase={() => true} />;

      case 'inventory':
        return <Inventory items={inventory} setItems={setInventory} />;

      case 'financials':
        return <Financials transactions={transactions} />;

      case 'team':
        return <Team barbers={users.filter(u => u.role === UserRole.BARBER)} setUsers={setUsers} />;

      case 'services':
        return <ServicesManagement services={services} onUpdateServices={setServices} />;

      case 'crm':
        return <CustomerCRM services={services} notes={notes} onSaveNote={(n) => setNotes([...notes, n as TechnicalNote])} customers={users.filter(u => u.role === UserRole.CUSTOMER)} appointments={appointments} onScheduleReturn={() => setCurrentView('calendar')} />;

      case 'strategic':
        return <StrategicGrowth services={services} plans={plans} setPlans={setPlans} />;

      case 'marketing':
        return <MarketingTools automations={automations} setAutomations={setAutomations} />;

      case 'order_management':
        return <OrderManagement orders={orders} users={users} onUpdateStatus={() => {}} onNavigate={setCurrentView} />;
      
      case 'orders':
        return <CustomerOrders orders={orders} onNavigate={setCurrentView} onRepeatOrder={() => {}} />;

      case 'settings':
        return <Settings currentUser={currentUser!} settings={shopSettings} onUpdateSettings={setShopSettings} onUpdateUser={setCurrentUser} />;

      default:
        return <Dashboard stats={MOCK_STATS} onNavigate={setCurrentView} />;
    }
  };

  return (
    <Layout currentUser={currentUser} currentView={currentView} onNavigate={setCurrentView} onLogout={handleLogout}>
      {!isSupabaseConfigured() && (
        <div className="mb-6 bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-4">
          <Database className="text-amber-600" />
          <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Modo Offline: Credenciais não detectadas no .env</p>
        </div>
      )}
      {renderContent()}
      <ChatAssistant currentUser={currentUser} />
    </Layout>
  );
}

export default App;
