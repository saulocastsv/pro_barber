import React, { useState } from 'react';
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
import { BarberDashboard } from './components/BarberDashboard'; // New Import
import { MOCK_USERS, MOCK_APPOINTMENTS, MOCK_QUEUE, MOCK_STATS } from './constants';
import { UserRole, User, Appointment } from './types';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [history, setHistory] = useState<string[]>([]); // Simple history stack
  
  // App State
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [bookingInitialData, setBookingInitialData] = useState<{serviceIds: string[], barberId: string} | null>(null);

  const handleNavigate = (view: string) => {
      setHistory(prev => [...prev, currentView]);
      setCurrentView(view);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsGuest(false);
    // Redirect based on role
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
    setCurrentView('dashboard'); // Reset view for next login
  };

  // Rebook: Pre-fill booking flow
  const handleRebook = (appt: Appointment) => {
      setBookingInitialData({
          serviceIds: [appt.serviceId],
          barberId: appt.barberId
      });
      handleNavigate('booking');
  };

  const handleCancelAppointment = (id: string) => {
      // In real app, call API
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'CANCELLED' } : a));
  };

  // If not authenticated and not guest, show Auth Screen
  if (!currentUser && !isGuest) {
    return <AuthScreen onLogin={handleLogin} onGuestContinue={handleGuestContinue} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        if (currentUser?.role === UserRole.BARBER) {
            return <BarberDashboard currentUser={currentUser} appointments={appointments} />;
        }
        return currentUser?.role === UserRole.OWNER 
          ? <Dashboard stats={MOCK_STATS} onNavigate={handleNavigate} /> 
          : <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <p>Acesso restrito a administradores.</p>
              <button onClick={() => handleNavigate('booking')} className="mt-4 text-blue-500 underline">Ir para Agendamento</button>
            </div>;
      case 'calendar':
        return <CalendarView appointments={appointments} barbers={MOCK_USERS.filter(u => u.role === UserRole.BARBER)} />;
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
      case 'financials':
        return currentUser?.role === UserRole.OWNER ? <Financials /> : null;
      case 'team':
        return currentUser?.role === UserRole.OWNER ? <Team /> : null;
      case 'inventory':
        return currentUser?.role === UserRole.OWNER ? <Inventory /> : null;
      case 'marketing':
        return currentUser?.role === UserRole.OWNER ? <MarketingTools /> : null;
      case 'crm':
        return (currentUser?.role === UserRole.OWNER || currentUser?.role === UserRole.BARBER) 
            ? <CustomerCRM /> : null;
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