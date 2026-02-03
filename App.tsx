
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
import { User, UserRole, Appointment, Service, InventoryItem, Transaction, Order, ShopSettings, OrderStatus, TechnicalNote, BarberAvailabilityException, LoyaltyAutomation, MembershipPlan, Barbershop, CartItem } from './types';
import { MOCK_STATS, MOCK_SHOP_SETTINGS, MOCK_APPOINTMENTS, SERVICES, MOCK_INVENTORY, MOCK_TRANSACTIONS, MOCK_USERS, MOCK_NOTES, MOCK_AUTOMATIONS, MOCK_MEMBERSHIP_PLANS } from './constants';
import { Database, Wifi, WifiOff } from 'lucide-react';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<'connected' | 'offline' | 'error'>('offline');
  
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
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null);

  const loadUserProfile = useCallback(async (userId: string, email: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;

      if (profile) {
        setCurrentUser({
          ...profile,
          name: profile.name || profile.full_name || 'Usuário',
          barbershopId: profile.barbershop_id,
          email: email
        });
      } else {
        setCurrentUser({
          id: userId,
          name: 'Usuário',
          role: UserRole.CUSTOMER,
          avatar: `https://picsum.photos/seed/${userId}/100/100`,
          email: email,
          points: 0
        });
      }
      setDbStatus('connected');
    } catch (err) {
      console.warn("Erro ao carregar perfil:", err);
      setDbStatus('error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setIsLoading(false);
      setDbStatus('offline');
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        loadUserProfile(session.user.id, session.user.email || '');
      } else {
        setIsLoading(false);
        setDbStatus('connected');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        loadUserProfile(session.user.id, session.user.email || '');
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setIsGuest(false);
        setBarbershop(null);
        setCurrentView('dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserProfile]);

  useEffect(() => {
    if (!isSupabaseConfigured() || (!currentUser && !isGuest)) return;

    const fetchData = async () => {
      try {
        let shopQuery = null;
        if (currentUser?.barbershopId) {
            shopQuery = supabase.from('barbershops').select('*').eq('id', currentUser.barbershopId).single();
        } else if (currentUser?.role === UserRole.OWNER) {
            shopQuery = supabase.from('barbershops').select('*').eq('owner_id', currentUser.id).single();
        }

        const [resServices, resAppts, resInventory, resProfiles, resShop, resOrders] = await Promise.all([
          supabase.from('services').select('*'),
          supabase.from('appointments').select('*'),
          supabase.from('inventory').select('*'),
          supabase.from('profiles').select('*'),
          shopQuery || Promise.resolve({ data: null }),
          supabase.from('orders').select('*')
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
        if (resInventory.data) {
            // Map DB columns (snake_case) to App types (camelCase)
            setInventory(resInventory.data.map((i: any) => ({
                id: i.id,
                name: i.name,
                quantity: i.quantity,
                price: i.price,
                minLevel: i.min_level || i.minLevel || 0, // Fallback support
                category: i.category
            })));
        }
        if (resProfiles.data) setUsers(resProfiles.data.map((p: any) => ({
            ...p,
            name: p.name || p.full_name || 'Usuário',
            barbershopId: p.barbershop_id
        })));
        
        if (resOrders.data) {
             setOrders(resOrders.data.map((o: any) => ({
                ...o,
                items: o.items || [], // Ensure items is array
                createdAt: o.created_at,
                totalAmount: o.total_amount,
                customerName: o.customer_name,
                customerId: o.customer_id,
                deliveryMethod: o.delivery_method,
                paymentMethod: o.payment_method
             })));
        }
        
        if (resShop?.data) {
            const shop = resShop.data as Barbershop;
            setBarbershop(shop);
            setShopSettings({
                shopName: shop.name,
                address: shop.address || 'Endereço não configurado',
                phone: shop.phone || '(00) 00000-0000',
                openingHours: shop.openingHours || { start: '09:00', end: '19:00' },
                workingDays: shop.workingDays || ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
                defaultCommissionRate: shop.defaultCommissionRate
            });
        }
      } catch (e) {
        console.warn("Erro ao buscar dados do negócio.");
      }
    };

    fetchData();

    // Canais de Realtime
    const apptChannel = supabase
      .channel('appointments-changes')
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
        }
      })
      .subscribe();

    const invChannel = supabase
      .channel('inventory-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const newItem = {
                  id: payload.new.id,
                  name: payload.new.name,
                  quantity: payload.new.quantity,
                  price: payload.new.price,
                  minLevel: payload.new.min_level || 0,
                  category: payload.new.category
              } as InventoryItem;
              
              setInventory(prev => {
                  const exists = prev.find(i => i.id === newItem.id);
                  if (exists) return prev.map(i => i.id === newItem.id ? newItem : i);
                  return [...prev, newItem];
              });
          } else if (payload.eventType === 'DELETE') {
              setInventory(prev => prev.filter(i => i.id !== payload.old.id));
          }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(apptChannel);
      supabase.removeChannel(invChannel);
    };
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
    setBarbershop(null);
    setCurrentView('dashboard');
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
      payment_status: apptData.paymentStatus,
      barbershop_id: barbershop?.id
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

  /**
   * Lógica de Compra: Salva Pedido, Baixa Estoque, Pontua Cliente
   */
  const handlePurchase = async (cartItems: CartItem[], totalPaid: number, pointsUsed: boolean, pointsDiscount: number) => {
      const orderData = {
          customer_id: currentUser?.id,
          customer_name: currentUser?.name || 'Cliente',
          items: cartItems,
          total_amount: totalPaid,
          status: 'PAID' as OrderStatus,
          payment_method: 'CREDIT_CARD', // Simplification
          delivery_method: 'PICKUP',
          barbershop_id: barbershop?.id,
          created_at: new Date().toISOString()
      };

      if (!isSupabaseConfigured()) {
          const mockOrder: Order = { ...orderData, id: `ord_${Date.now()}`, createdAt: orderData.created_at } as any;
          setOrders(prev => [mockOrder, ...prev]);
          // Mock Inventory Update
          const newInv = [...inventory];
          cartItems.forEach(cartItem => {
              const invItem = newInv.find(i => i.id === cartItem.id.replace('inv_', ''));
              if (invItem) invItem.quantity = Math.max(0, invItem.quantity - cartItem.quantity);
          });
          setInventory(newInv);
          return true;
      }

      try {
          // 1. Salvar Pedido
          const { data: order, error: orderError } = await supabase
              .from('orders')
              .insert([orderData])
              .select()
              .single();

          if (orderError) throw orderError;

          // 2. Atualizar Estoque (Iterativo para simplicidade, idealmente uma RPC transaction)
          for (const item of cartItems) {
              if (item.id.startsWith('inv_')) {
                  const invId = item.id.replace('inv_', '');
                  const currentInv = inventory.find(i => i.id === invId);
                  if (currentInv) {
                      await supabase.from('inventory')
                          .update({ quantity: Math.max(0, currentInv.quantity - item.quantity) })
                          .eq('id', invId);
                  }
              }
          }

          // 3. Atualizar Pontos
          if (currentUser) {
              const pointsEarned = Math.floor(totalPaid); // 1 ponto por real
              const pointsSpent = pointsUsed ? (pointsDiscount * 10) : 0; // Ex: 10 pts = 1 real
              const newPoints = (currentUser.points || 0) + pointsEarned - pointsSpent;
              
              await supabase.from('profiles').update({ points: newPoints }).eq('id', currentUser.id);
              setCurrentUser({ ...currentUser, points: newPoints });
          }

          // Atualizar estado local
          setOrders(prev => [{...order, items: cartItems} as any, ...prev]);
          
          return true;
      } catch (error: any) {
          console.error("Erro na compra:", error);
          alert("Erro ao processar compra: " + error.message);
          return false;
      }
  };

  /**
   * Lógica de Atualização de Estoque (Adicionar/Editar/Excluir)
   */
  const handleUpdateInventory = async (item: InventoryItem, action: 'UPSERT' | 'DELETE') => {
      if (!isSupabaseConfigured()) {
          if (action === 'DELETE') {
              setInventory(prev => prev.filter(i => i.id !== item.id));
          } else {
              setInventory(prev => {
                  const exists = prev.find(i => i.id === item.id);
                  if (exists) return prev.map(i => i.id === item.id ? item : i);
                  return [...prev, item];
              });
          }
          return;
      }

      try {
          if (action === 'DELETE') {
              await supabase.from('inventory').delete().eq('id', item.id);
              // Optimistic update handled by realtime or fetch, but safe to keep locally too
              setInventory(prev => prev.filter(i => i.id !== item.id));
          } else {
              // Prepare payload mapping types to DB columns
              const payload: any = { 
                  name: item.name,
                  quantity: item.quantity,
                  price: item.price,
                  min_level: item.minLevel,
                  category: item.category,
                  barbershop_id: barbershop?.id 
              };
              
              // Only add ID if it's not a new temporary one
              if (!item.id.startsWith('new_')) {
                  payload.id = item.id;
              }

              const { data, error } = await supabase.from('inventory').upsert([payload]).select().single();
              if (error) throw error;
              
              // Ensure we update local state properly, especially for new items getting a real ID
              if (data) {
                  const mappedData: InventoryItem = {
                      id: data.id,
                      name: data.name,
                      quantity: data.quantity,
                      price: data.price,
                      minLevel: data.min_level,
                      category: data.category
                  };

                  setInventory(prev => {
                      const exists = prev.find(i => i.id === item.id || i.id === mappedData.id);
                      if (exists) return prev.map(i => i.id === exists.id ? mappedData : i);
                      return [...prev, mappedData];
                  });
              }
          }
      } catch (error: any) {
          console.error("Erro estoque:", error);
          alert("Erro ao atualizar estoque.");
      }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-brand-dark text-white font-black animate-pulse">CARREGANDO BARVO...</div>;

  if (!currentUser && !isGuest) {
    return <AuthScreen onLogin={handleLogin} onGuestContinue={() => { setIsGuest(true); setCurrentView('booking'); }} />;
  }

  // Proteção para Guest Mode
  if (isGuest && currentView !== 'booking' && currentView !== 'shop') {
      setCurrentView('booking');
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
        return <Shop currentUser={currentUser!} inventory={inventory} onPurchase={handlePurchase} />;

      case 'inventory':
        return <Inventory items={inventory} onUpdateItem={handleUpdateInventory} />;

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
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        {!isSupabaseConfigured() ? (
            <div className="flex-1 bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-4">
                <Database className="text-amber-600" />
                <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Modo Demo: Verifique seu arquivo .env</p>
            </div>
        ) : (
            <div className={`flex-1 p-4 rounded-2xl flex items-center gap-4 border ${dbStatus === 'connected' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                {dbStatus === 'connected' ? <Wifi className="text-emerald-600" /> : <WifiOff className="text-red-600" />}
                <p className={`text-[10px] font-black uppercase tracking-widest ${dbStatus === 'connected' ? 'text-emerald-700' : 'text-red-700'}`}>
                    Cloud: {dbStatus === 'connected' ? 'Supabase Conectado' : 'Erro de Conexão'}
                </p>
            </div>
        )}
        {barbershop && (
            <div className="bg-brand-dark text-brand-light p-4 rounded-2xl flex items-center gap-4 shadow-lg">
                <Database size={18} />
                <p className="text-[10px] font-black uppercase tracking-widest">Barbearia Ativa: {barbershop.name}</p>
            </div>
        )}
      </div>
      {renderContent()}
      <ChatAssistant currentUser={currentUser} />
    </Layout>
  );
}

export default App;
