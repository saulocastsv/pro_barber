
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
import { Inventory } from './components/Inventory';
import { MarketingTools } from './components/MarketingTools';
import { CustomerCRM } from './components/CustomerCRM';
import { BarberDashboard } from './components/BarberDashboard';
import { Shop } from './components/Shop'; 
import { Settings } from './components/Settings';
import { MOCK_USERS, MOCK_APPOINTMENTS, MOCK_QUEUE, MOCK_STATS, SERVICES, LOYALTY_RULES, MOCK_INVENTORY, MOCK_TRANSACTIONS, MOCK_SHOP_SETTINGS, MOCK_AUTOMATIONS } from './constants';
import { UserRole, User, Appointment, InventoryItem, Transaction, ShopSettings, CartItem, LoyaltyAutomation } from './types';

function App() {
  // --- GLOBAL STATE (Single Source of Truth) ---
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  
  // Data States
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [shopSettings, setShopSettings] = useState<ShopSettings>(MOCK_SHOP_SETTINGS);
  
  // Marketing & Automation State
  const [automations, setAutomations] = useState<LoyaltyAutomation[]>(MOCK_AUTOMATIONS);

  // Booking Flow State
  const [bookingInitialData, setBookingInitialData] = useState<{serviceIds: string[], barberId: string} | null>(null);

  // --- ACTIONS & HANDLERS ---

  const handleNavigate = (view: string) => {
      setCurrentView(view);
  };

  const handleLogin = (user: User) => {
    const existingUser = users.find(u => u.id === user.id);
    setCurrentUser(existingUser || user);
    setIsGuest(false);
    if (user.role === UserRole.CUSTOMER) {
      setCurrentView('appointments');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleGuestContinue = () => {
    setIsGuest(true);
    setCurrentUser(null);
    setCurrentView('booking');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsGuest(false);
    setCurrentView('dashboard');
  };

  const handleRebook = (appt: Appointment) => {
      setBookingInitialData({
          serviceIds: [appt.serviceId],
          barberId: appt.barberId
      });
      handleNavigate('booking');
  };

  const handleCancelAppointment = (id: string) => {
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'CANCELLED' } : a));
  };

  // 1. BUSINESS RULE: Complete Appointment -> Update Points -> Generate Transaction -> Check Automations
  const handleCompleteAppointment = (appointmentId: string) => {
      const appt = appointments.find(a => a.id === appointmentId);
      if (!appt || appt.status === 'COMPLETED') return;

      const service = SERVICES.find(s => s.id === appt.serviceId);
      if (!service) return;

      // A. Update Points
      const pointsToAward = Math.floor(service.price * LOYALTY_RULES.POINTS_PER_CURRENCY);
      setUsers(prevUsers => prevUsers.map(user => {
          if (user.id === appt.customerId) {
              const updatedUser = { ...user, points: (user.points || 0) + pointsToAward };
              if (currentUser?.id === user.id) setCurrentUser(updatedUser);
              return updatedUser;
          }
          return user;
      }));

      // B. Update Appointment Status
      setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, status: 'COMPLETED' } : a));

      // C. Generate Financial Transaction (Revenue)
      const newTransaction: Transaction = {
          id: `t_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          amount: service.price,
          type: 'SERVICE',
          description: `Serviço: ${service.name} - ${appt.customerName}`,
          barberId: appt.barberId
      };
      setTransactions(prev => [newTransaction, ...prev]);

      // D. Check Loyalty Automations (Simulated Trigger)
      const customerCompletedAppointments = appointments.filter(a => a.customerId === appt.customerId && a.status === 'COMPLETED').length + 1; // +1 includes current
      
      automations.forEach(auto => {
          if (auto.active && auto.triggerType === 'APPOINTMENT_COUNT' && customerCompletedAppointments === auto.triggerValue) {
              // Simulate Message Sending
              setTimeout(() => {
                  alert(`🤖 AUTOMAÇÃO DE MARKETING DISPARADA:\n\nPara: ${appt.customerName}\nMsg: "${auto.message}"\n\n(Enviado via ${auto.channel})`);
              }, 1500);
          }
      });

      alert(`Atendimento finalizado! +${pointsToAward} pontos para o cliente. Receita de R$ ${service.price} registrada.`);
  };

  // 2. BUSINESS RULE: Mark as No-Show
  const handleNoShowAppointment = (appointmentId: string) => {
      setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, status: 'CANCELLED' } : a)); // Using CANCELLED for simplicity, could be NO_SHOW enum
      alert('Agendamento marcado como Não Compareceu.');
  };

  // 3. BUSINESS RULE: Shop Purchase -> Deduct Inventory -> Generate Transaction -> Update Points
  const handleShopPurchase = (cartItems: CartItem[], totalPaid: number, pointsUsed: boolean, pointsDiscount: number) => {
      // A. Deduct Inventory
      let outOfStockError = false;
      const updatedInventory = inventory.map(item => {
          const cartItem = cartItems.find(c => c.id.replace('inv_', '') === item.id); // Handle ID prefix logic from Shop
          if (cartItem) {
              if (item.quantity < cartItem.quantity) outOfStockError = true;
              return { ...item, quantity: item.quantity - cartItem.quantity };
          }
          return item;
      });

      if (outOfStockError) {
          alert("Erro: Um ou mais itens acabaram no estoque antes de finalizar.");
          return false; // Fail transaction
      }
      setInventory(updatedInventory);

      // B. Generate Transaction
      const newTransaction: Transaction = {
          id: `tr_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          amount: totalPaid,
          type: 'PRODUCT',
          description: `Venda Loja: ${cartItems.length} itens`,
          barberId: undefined // Shop sale goes to house
      };
      setTransactions(prev => [newTransaction, ...prev]);

      // C. Update Points (Deduct if used, Add if earned)
      if (currentUser) {
          let newPoints = currentUser.points || 0;
          if (pointsUsed) {
              // Deduct points (Reverse calculation of discount)
              const pointsCost = pointsDiscount * LOYALTY_RULES.DISCOUNT_CONVERSION_RATE;
              newPoints -= pointsCost;
          } else {
              // Award points
              newPoints += Math.floor(totalPaid * LOYALTY_RULES.POINTS_PER_CURRENCY);
          }
          
          setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, points: newPoints } : u));
          setCurrentUser(prev => prev ? { ...prev, points: newPoints } : null);
      }

      return true; // Success
  };

  // 4. Update Settings
  const handleUpdateSettings = (newSettings: ShopSettings) => {
      setShopSettings(newSettings);
  };

  // Sync currentUser with users state changes
  React.useEffect(() => {
      if (currentUser) {
          const updatedUser = users.find(u => u.id === currentUser.id);
          if (updatedUser && updatedUser.points !== currentUser.points) {
              setCurrentUser(updatedUser);
          }
      }
  }, [users, currentUser]);

  // Routing Logic
  if (!currentUser && !isGuest) {
    return <AuthScreen onLogin={handleLogin} onGuestContinue={handleGuestContinue} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        if (currentUser?.role === UserRole.BARBER) {
            return (
                <BarberDashboard 
                    currentUser={currentUser} 
                    appointments={appointments} 
                    commissionRate={shopSettings.defaultCommissionRate || 50} // Pass configured commission
                    onCompleteAppointment={handleCompleteAppointment}
                    onNoShow={handleNoShowAppointment}
                />
            );
        }
        return currentUser?.role === UserRole.OWNER 
          ? <Dashboard stats={{...MOCK_STATS, monthlyRevenue: transactions.reduce((acc, t) => acc + t.amount, 0)}} onNavigate={handleNavigate} /> 
          : <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <p>Acesso restrito a administradores.</p>
              <button onClick={() => handleNavigate('booking')} className="mt-4 text-blue-500 underline">Ir para Agendamento</button>
            </div>;
      case 'calendar':
        return <CalendarView appointments={appointments} barbers={users.filter(u => u.role === UserRole.BARBER)} />;
      case 'queue':
        return <QueueSystem initialQueue={MOCK_QUEUE} />;
      case 'booking':
        return <BookingFlow currentUser={currentUser} initialData={bookingInitialData} />;
      case 'appointments':
        return currentUser 
            ? <CustomerAppointments 
                currentUser={currentUser} 
                appointments={appointments} 
                onRebook={handleRebook}
                onCancel={handleCancelAppointment}
                onNavigate={handleNavigate}
              /> 
            : null;
      case 'shop': 
        return currentUser 
            ? <Shop 
                currentUser={currentUser} 
                inventory={inventory} // Pass real inventory
                onPurchase={handleShopPurchase} // Pass purchase handler
              /> 
            : null;
      case 'financials':
        return currentUser?.role === UserRole.OWNER 
            ? <Financials transactions={transactions} /> // Pass real transactions
            : null;
      case 'team':
        return currentUser?.role === UserRole.OWNER ? <Team /> : null;
      case 'inventory':
        return currentUser?.role === UserRole.OWNER 
            ? <Inventory items={inventory} setItems={setInventory} /> // Pass real inventory state
            : null;
      case 'marketing':
        return currentUser?.role === UserRole.OWNER 
            ? <MarketingTools automations={automations} setAutomations={setAutomations} /> 
            : null;
      case 'crm':
        return (currentUser?.role === UserRole.OWNER || currentUser?.role === UserRole.BARBER) 
            ? <CustomerCRM /> : null;
      case 'settings':
        return currentUser 
            ? <Settings 
                currentUser={currentUser} 
                settings={shopSettings} 
                onUpdateSettings={handleUpdateSettings} 
              /> 
            : null;
      default:
        return <div className="p-10 text-center text-slate-500">Página não encontrada.</div>;
    }
  };

  return (
    <Layout 
      currentUser={currentUser} 
      currentView={currentView} 
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      {renderContent()}
      <ChatAssistant />
    </Layout>
  );
}

export default App;
