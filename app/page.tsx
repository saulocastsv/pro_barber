"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/components/Dashboard';
import { CalendarView } from '@/components/CalendarView';
import { QueueSystem } from '@/components/QueueSystem';
import { BookingFlow } from '@/components/BookingFlow';
import { AuthScreen } from '@/components/AuthScreen';
import { ChatAssistant } from '@/components/ChatAssistant';
import { BarberDashboard } from '@/components/BarberDashboard';
import { CustomerDashboard } from '@/components/CustomerDashboard';
import { CustomerAppointments } from '@/components/CustomerAppointments';
import { ServicesManagement } from '@/components/ServicesManagement';
import { Financials } from '@/components/Financials';
import { Team } from '@/components/Team';
import { Inventory } from '@/components/Inventory';
import { CustomerCRM } from '@/components/CustomerCRM';
import { MarketingTools } from '@/components/MarketingTools';
import { Settings } from '@/components/Settings';
import { Shop } from '@/components/Shop';
import { OrderManagement } from '@/components/OrderManagement';
import { CustomerOrders } from '@/components/CustomerOrders';
import { StrategicGrowth } from '@/components/StrategicGrowth';
import { InvestorDashboard } from '@/components/InvestorDashboard';

import { supabase, isSupabaseConfigured } from '@/services/supabaseClient';
import { db } from '@/services/databaseService';
import {
  User, UserRole, Appointment, Service, InventoryItem, Order,
  ShopSettings, Notification, MembershipPlan, LoyaltyAutomation, TechnicalNote
} from '@/types';
import {
  MOCK_STATS, MOCK_SHOP_SETTINGS, MOCK_MEMBERSHIP_PLANS,
  MOCK_NOTIFICATIONS, MOCK_TRANSACTIONS, MOCK_USERS, MOCK_QUEUE,
  MOCK_AUTOMATIONS, MOCK_NOTES, MOCK_APPOINTMENTS, SERVICES, MOCK_INVENTORY
} from '@/constants';
import { Wifi, WifiOff, AlertCircle, Scissors, RefreshCw } from 'lucide-react';

export default function Page() {
  // --- AUTH STATES ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  // --- APP DATA STATES ---
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [services, setServices] = useState<Service[]>(SERVICES);
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);
  const [orders, setOrders] = useState<Order[]>([]);
  const [shopSettings, setShopSettings] = useState<ShopSettings>(MOCK_SHOP_SETTINGS);
  const [membershipPlans, setMembershipPlans] = useState<MembershipPlan[]>(MOCK_MEMBERSHIP_PLANS);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [automations, setAutomations] = useState<LoyaltyAutomation[]>(MOCK_AUTOMATIONS);
  const [notes, setNotes] = useState<TechnicalNote[]>(MOCK_NOTES);

  // --- UI/STATUS STATES ---
  const [dbStatus, setDbStatus] = useState<'connected' | 'offline'>('offline');
  const [globalError, setGlobalError] = useState<string | null>(null);

  const barbers = users.filter(u => u.role === UserRole.BARBER);
  const customers = users.filter(u => u.role === UserRole.CUSTOMER);

  /**
   * Sincroniza todos os dados da barbearia atual do usuario.
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
        if (shop) {
          setShopSettings({
            shopName: shop.name,
            address: shop.address,
            phone: shop.phone,
            openingHours: shop.opening_hours,
            workingDays: shop.working_days,
            defaultCommissionRate: shop.default_commission_rate
          });
        }
        setDbStatus('connected');
      }
    } catch (err: any) {
      console.error("Erro na sincronizacao:", err);
      setGlobalError("Falha ao sincronizar dados com o servidor.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- EFFECTS ---

  useEffect(() => {
    const checkSession = async () => {
      if (isSupabaseConfigured()) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const profile = await db.getProfile(session.user.id);
            if (profile) {
              const user = { ...profile, email: session.user.email };
              setCurrentUser(user as User);
              await syncAppData(user as User);
            }
          }
        } catch (e) {
          console.error("Erro ao checar sessao:", e);
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
      if (isSupabaseConfigured() && currentUser) {
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
      } else {
        // Offline / demo mode - add locally
        const newAppt: Appointment = {
          id: `local-${Date.now()}`,
          barberId: (appt as any).barberId || barbers[0]?.id || 'u2',
          customerId: currentUser?.id || 'guest',
          customerName: currentUser?.name || 'Visitante',
          serviceId: (appt as any).serviceId || services[0]?.id || 's1',
          startTime: appt.startTime || new Date(),
          status: 'CONFIRMED',
        };
        setAppointments(prev => [...prev, newAppt]);
      }
      return true;
    } catch (err) {
      setGlobalError("Nao foi possivel salvar o agendamento.");
      return false;
    }
  };

  const handleSaveNote = (note: TechnicalNote) => {
    setNotes(prev => {
      const existing = prev.findIndex(n => n.id === note.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = note;
        return updated;
      }
      return [...prev, note];
    });
  };

  // --- RENDERING ---

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-brand-dark text-white font-sans animate-pulse">
        <Scissors size={48} className="mb-4 text-brand-light" />
        <span className="tracking-[0.3em] uppercase text-xs font-black">Carregando Barvo...</span>
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
        if (role === UserRole.BARBER) return (
          <BarberDashboard
            currentUser={currentUser!}
            appointments={appointments}
            commissionRate={shopSettings.defaultCommissionRate || 50}
            onCompleteAppointment={(id) => {
              if (isSupabaseConfigured()) db.updateAppointmentStatus(id, 'COMPLETED');
              setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'COMPLETED' } : a));
            }}
            onNoShow={(id) => {
              if (isSupabaseConfigured()) db.updateAppointmentStatus(id, 'CANCELLED');
              setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'CANCELLED' } : a));
            }}
            services={services}
            exceptions={[]}
            onBlockTime={() => {}}
          />
        );
        return <CustomerDashboard currentUser={currentUser!} appointments={appointments} onNavigate={setCurrentView} membershipPlans={membershipPlans} />;

      case 'calendar':
        return <CalendarView appointments={appointments} barbers={barbers} services={services} onAddAppointment={handleAddAppointment} />;

      case 'queue':
        return <QueueSystem initialQueue={MOCK_QUEUE} services={services} />;

      case 'booking':
        return <BookingFlow currentUser={currentUser} initialData={null} services={services} onBook={handleAddAppointment} shopSettings={shopSettings} allAppointments={appointments} availabilityExceptions={[]} />;

      case 'appointments':
        return (
          <CustomerAppointments
            currentUser={currentUser!}
            appointments={appointments.filter(a => a.customerId === currentUser?.id)}
            onRebook={(appt) => {
              setCurrentView('booking');
            }}
            onCancel={(id) => {
              if (isSupabaseConfigured()) db.updateAppointmentStatus(id, 'CANCELLED');
              setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'CANCELLED' } : a));
            }}
            onNavigate={setCurrentView}
            services={services}
          />
        );

      case 'shop':
        return (
          <Shop
            currentUser={currentUser!}
            inventory={inventory}
            onPurchase={async (cartItems, totalPaid, _pointsUsed, _pointsDiscount) => {
              try {
                // Decrementar inventário
                cartItems.forEach(cartItem => {
                  if (cartItem.id.startsWith('inv_')) {
                    const inventoryItemId = cartItem.id.replace('inv_', '');
                    const inventoryItem = inventory.find(i => i.id === inventoryItemId);
                    if (inventoryItem && inventoryItem.quantity >= cartItem.quantity) {
                      setInventory(prev => prev.map(item => 
                        item.id === inventoryItemId 
                          ? { ...item, quantity: item.quantity - cartItem.quantity }
                          : item
                      ));
                    }
                  }
                });

                if (isSupabaseConfigured() && currentUser) {
                  const shopId = currentUser.role === UserRole.OWNER
                    ? (await db.getBarbershopByOwner(currentUser.id))?.id
                    : currentUser.barbershopId;
                  await db.createOrder({
                    customerId: currentUser.id,
                    items: cartItems,
                    totalAmount: totalPaid,
                    barbershop_id: shopId,
                    status: 'PAID'
                  });
                  await syncAppData(currentUser);
                }
                return true;
              } catch {
                setGlobalError("Erro ao processar compra.");
                return false;
              }
            }}
          />
        );

      case 'orders':
        return (
          <CustomerOrders
            orders={orders.filter(o => o.customerId === currentUser?.id)}
            onNavigate={setCurrentView}
            onRepeatOrder={(order) => {
              setCurrentView('shop');
            }}
          />
        );

      case 'inventory':
        return <Inventory items={inventory} onUpdateItem={async (item, action) => {
          if (action === 'UPSERT') {
            if (isSupabaseConfigured() && currentUser) {
              const shopId = currentUser.role === UserRole.OWNER
                ? (await db.getBarbershopByOwner(currentUser.id))?.id
                : currentUser.barbershopId;
              await db.upsertInventoryItem({ ...item, barbershop_id: shopId });
              await syncAppData(currentUser);
            } else {
              setInventory(prev => {
                const idx = prev.findIndex(i => i.id === item.id);
                if (idx >= 0) { const u = [...prev]; u[idx] = item; return u; }
                return [...prev, item];
              });
            }
          } else {
            setInventory(prev => prev.filter(i => i.id !== item.id));
          }
        }} />;

      case 'services':
        return <ServicesManagement services={services} onUpdateServices={setServices} />;

      case 'order_management':
        return <OrderManagement orders={orders} users={users} onNavigate={setCurrentView} onUpdateStatus={async (id, status, track) => {
          if (isSupabaseConfigured()) {
            await db.updateOrderStatus(id, status, track);
            if (currentUser) await syncAppData(currentUser);
          } else {
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
          }
        }} />;

      case 'financials':
        return <Financials transactions={MOCK_TRANSACTIONS} />;

      case 'team':
        return <Team barbers={barbers} setUsers={setUsers} />;

      case 'crm':
        return (
          <CustomerCRM
            services={services}
            notes={notes}
            onSaveNote={handleSaveNote}
            customers={customers}
            appointments={appointments}
            onScheduleReturn={(customerId) => {
              setCurrentView('calendar');
            }}
          />
        );

      case 'marketing':
        return <MarketingTools automations={automations} setAutomations={setAutomations} />;

      case 'strategic':
        return <StrategicGrowth services={services} plans={membershipPlans} setPlans={setMembershipPlans} currentUser={currentUser || undefined} />;

      case 'investor':
        return <InvestorDashboard appointments={appointments} membershipPlans={membershipPlans} services={services} users={users} />;

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
      onMarkAllRead={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
    >
      {globalError && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex justify-between items-center rounded-r-xl shadow-sm animate-slide-in">
          <div className="flex items-center gap-2 font-bold"><AlertCircle size={20} /> {globalError}</div>
          <button onClick={() => setGlobalError(null)} className="text-xs font-black uppercase hover:underline">Fechar</button>
        </div>
      )}

      <div className="mb-6 flex justify-between items-center">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${dbStatus === 'connected' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
          {dbStatus === 'connected' ? <Wifi size={12} /> : <WifiOff size={12} />}
          {dbStatus === 'connected' ? 'Sincronizado' : 'Modo Offline'}
        </div>
        {dbStatus === 'connected' && currentUser && (
          <button onClick={() => syncAppData(currentUser)} className="p-2 text-slate-400 hover:text-brand-dark transition-all">
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
        )}
      </div>

      {renderContent()}

      <ChatAssistant currentUser={currentUser} />
    </Layout>
  );
}
