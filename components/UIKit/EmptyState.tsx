// Componente de estado vazio reutilizável
import React from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
    {icon && <div className="mb-4">{icon}</div>}
    <h3 className="text-lg font-black mb-1">{title}</h3>
    {description && <p className="mb-4 text-sm">{description}</p>}
    {action}
  </div>
);
