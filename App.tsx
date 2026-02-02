
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { CalendarView } from './components/CalendarView';
import { QueueSystem } from './components/QueueSystem';
import { BookingFlow } from './components/BookingFlow';
import { Financials } from './components/Financials';
import { Team } from './components/Team';
import { ChatAssistant } from './components/ChatAssistant';
import { AuthScreen } from './components/AuthScreen';
import { CustomerAppointments } from './components/CustomerAppointments';
import { CustomerDashboard } from './components/CustomerDashboard';
import { Inventory } from './components/Inventory';
import { MarketingTools } from './components/MarketingTools';
import { CustomerCRM } from './components/CustomerCRM';
import { BarberDashboard } from './components/BarberDashboard';
import { Shop } from './components/Shop'; 
import { Settings } from './components/Settings';
import { StrategicGrowth } from './components/StrategicGrowth';
import { ServicesManagement } from './components/ServicesManagement';
import { MOCK_USERS, MOCK_APPOINTMENTS, MOCK_QUEUE, MOCK_STATS, SERVICES, LOYALTY_RULES, MOCK_INVENTORY, MOCK_TRANSACTIONS, MOCK_SHOP_SETTINGS, MOCK_AUTOMATIONS, MOCK_MEMBERSHIP_PLANS, MOCK_NOTES } from './constants';
import { UserRole, User, Appointment, InventoryItem, Transaction, ShopSettings, CartItem, LoyaltyAutomation, Service, MembershipPlan, TechnicalNote, BarberAvailabilityException } from './types';

function App() {
  // --- GLOBAL STATE ---
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  
  // Data States
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [shopSettings, setShopSettings] = useState<ShopSettings>(MOCK_SHOP_SETTINGS);
  const [services, setServices] = useState<Service[]>(SERVICES);
  const [membershipPlans, setMembershipPlans] = useState<MembershipPlan[]>(MOCK_MEMBERSHIP_PLANS);
  const [technicalNotes, setTechnicalNotes] = useState<TechnicalNote[]>(MOCK_NOTES);
  const [availabilityExceptions, setAvailabilityExceptions] = useState<BarberAvailabilityException[]>([]);
  
  // Marketing & Automation State
  const [automations, setAutomations] = useState<LoyaltyAutomation[]>(MOCK_AUTOMATIONS);

  // Booking Flow State
  const [bookingInitialData, setBookingInitialData] = useState<{serviceIds: string[], barberId: string} | null>(null);

  // --- HANDLERS ---

  const handleNavigate = (view: string) => {
      setCurrentView(view);
      window.scrollTo(0, 0);
  };

  const handleLogin = (user: User) => {
    const existingUser = users.find(u => u.id === user.id);
    setCurrentUser(existingUser || user);
    setIsGuest(false);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsGuest(false);
    setCurrentView('dashboard');
  };

  const handleUpdateUser = (updatedUser: User) => {
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      setCurrentUser(updatedUser);
  };

  const handleAddAppointment = (apptData: Partial<Appointment>) => {
    const newAppt: Appointment = {
      id: `a_${Date.now()}`,
      barberId: apptData.barberId || '',
      customerId: apptData.customerId || (isGuest ? 'guest' : currentUser?.id || 'unknown'),
      customerName: apptData.customerName || currentUser?.name || 'Cliente Visitante',
      serviceId: apptData.serviceId || '',
      startTime: apptData.startTime || new Date(),
      status: 'CONFIRMED',
      paymentMethod: apptData.paymentMethod,
      paymentStatus: apptData.paymentStatus
    };
    setAppointments(prev => [...prev, newAppt]);
    return true;
  };

  const handleSaveTechnicalNote = (note: Partial<TechnicalNote>) => {
      const fullNote: TechnicalNote = {
          id: `note_${Date.now()}`,
          customerId: note.customerId || '',
          barberId: currentUser?.id || 'admin',
          note: note.note || '',
          tags: note.tags || [],
          date: new Date().toISOString()
      };
      setTechnicalNotes(prev => [fullNote, ...prev]);
  };

  const handleBlockTime = (barberId: string, date: string, time: string) => {
      const newEx: BarberAvailabilityException = {
          id: `ex_${Date.now()}`,
          barberId,
          date,
          startTime: time
      };
      setAvailabilityExceptions(prev => [...prev, newEx]);
  };

  const handleCompleteAppointment = (appointmentId: string) => {
      const appt = appointments.find(a => a.id === appointmentId);
      if (!appt || appt.status === 'COMPLETED') return;

      const service = services.find(s => s.id === appt.serviceId);
      if (!service) return;

      const pointsToAward = Math.floor(service.price * LOYALTY_RULES.POINTS_PER_CURRENCY);
      
      // Update User Points
      setUsers(prevUsers => prevUsers.map(user => {
          if (user.id === appt.customerId) {
              return { ...user, points: (user.points || 0) + pointsToAward };
          }
          return user;
      }));

      // Update Appointment
      setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, status: 'COMPLETED' } : a));

      // Financial Transaction
      const newTransaction: Transaction = {
          id: `t_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          amount: Number(service.price),
          type: 'SERVICE',
          description: `Atendimento: ${service.name} (${appt.customerName})`,
          barberId: appt.barberId
      };
      setTransactions(prev => [newTransaction, ...prev]);
  };

  if (!currentUser && !isGuest) {
    return <AuthScreen onLogin={handleLogin} onGuestContinue={() => { setIsGuest(true); setCurrentView('booking'); }} />;
  }

  const barbers = users.filter(u => u.role === UserRole.BARBER);

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        if (currentUser?.role === UserRole.BARBER) {
            return <BarberDashboard 
                currentUser={currentUser} 
                appointments={appointments} 
                commissionRate={shopSettings.defaultCommissionRate || 50} 
                onCompleteAppointment={handleCompleteAppointment}
                onNoShow={(id) => setAppointments(prev => prev.map(a => a.id === id ? {...a, status: 'CANCELLED'} : a))}
                services={services}
                exceptions={availabilityExceptions}
                onBlockTime={handleBlockTime}
            />;
        }
        if (currentUser?.role === UserRole.CUSTOMER) {
            return <CustomerDashboard currentUser={currentUser} appointments={appointments} onNavigate={handleNavigate} membershipPlans={membershipPlans} />;
        }
        return <Dashboard stats={{...MOCK_STATS, monthlyRevenue: transactions.reduce((acc, t) => acc + t.amount, 0)}} onNavigate={handleNavigate} />;
      
      case 'calendar':
        return <CalendarView appointments={appointments} barbers={barbers} services={services} onAddAppointment={handleAddAppointment} />;
      
      case 'queue':
        return <QueueSystem initialQueue={MOCK_QUEUE} services={services} />;
      
      case 'team':
        return <Team barbers={barbers} setUsers={setUsers} />;
      
      case 'crm':
        return <CustomerCRM services={services} notes={technicalNotes} onSaveNote={handleSaveTechnicalNote} customers={users.filter(u => u.role === UserRole.CUSTOMER)} appointments={appointments} />;

      case 'booking':
        return <BookingFlow currentUser={currentUser} initialData={bookingInitialData} services={services} onBook={handleAddAppointment} shopSettings={shopSettings} />;

      case 'appointments':
        return currentUser ? <CustomerAppointments currentUser={currentUser} appointments={appointments} onRebook={(a) => { setBookingInitialData({serviceIds: [a.serviceId], barberId: a.barberId}); setCurrentView('booking'); }} onCancel={(id) => setAppointments(prev => prev.map(a => a.id === id ? {...a, status: 'CANCELLED'} : a))} onNavigate={handleNavigate} services={services} /> : null;

      case 'shop':
        return currentUser ? <Shop currentUser={currentUser} inventory={inventory} onPurchase={(cart, total, used, disc) => {
            const newT: Transaction = { id: `tr_${Date.now()}`, date: new Date().toISOString().split('T')[0], amount: total, type: 'PRODUCT', description: `Venda Loja (${cart.length} itens)` };
            setTransactions(prev => [newT, ...prev]);
            return true;
        }} /> : null;

      case 'inventory':
        return <Inventory items={inventory} setItems={setInventory} />;

      case 'financials':
        return <Financials transactions={transactions} />;

      case 'services':
        return <ServicesManagement services={services} onUpdateServices={setServices} />;

      case 'strategic':
        return <StrategicGrowth services={services} plans={membershipPlans} setPlans={setMembershipPlans} />;

      case 'settings':
        return currentUser ? <Settings currentUser={currentUser} settings={shopSettings} onUpdateSettings={setShopSettings} onUpdateUser={handleUpdateUser} /> : null;

      case 'marketing':
        return <MarketingTools automations={automations} setAutomations={setAutomations} />;

      default:
        return <div className="p-10 text-center">Página em construção.</div>;
    }
  };

  return (
    <Layout currentUser={currentUser} currentView={currentView} onNavigate={handleNavigate} onLogout={handleLogout}>
      {renderContent()}
      <ChatAssistant />
    </Layout>
  );
}

export default App;
