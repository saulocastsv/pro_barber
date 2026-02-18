// Componente para personalização visual e UX por perfil
import React from 'react';
import { UserRole, User } from '../types';

interface RoleExperienceProps {
  user: User;
  children: React.ReactNode;
}

export const RoleExperience: React.FC<RoleExperienceProps> = ({ user, children }) => {
  if (user.role === UserRole.OWNER) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h2 className="text-2xl font-black text-brand-dark mb-2">Bem-vindo, {user.name} (Dono)</h2>
          <p className="text-brand-midGray mb-6">Acompanhe o desempenho da sua barbearia, equipe e finanças em tempo real.</p>
          {children}
        </div>
      </div>
    );
  }
  if (user.role === UserRole.BARBER) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 to-white min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <h2 className="text-2xl font-black text-emerald-900 mb-2">Olá, {user.name} (Barbeiro)</h2>
          <p className="text-emerald-700 mb-6">Veja sua agenda, fila e desempenho de atendimentos.</p>
          {children}
        </div>
      </div>
    );
  }
  // CUSTOMER
  return (
    <div className="bg-gradient-to-br from-pink-50 to-white min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-black text-pink-900 mb-2">Bem-vindo, {user.name || 'Cliente'}</h2>
        <p className="text-pink-700 mb-6">Gerencie seus agendamentos, planos e benefícios.</p>
        {children}
      </div>
    </div>
  );
};
