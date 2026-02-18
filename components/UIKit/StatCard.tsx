// Card de estatística/KPI reutilizável
import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  color?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, trend, color = 'bg-blue-50', onClick }) => (
  <div
    className={`rounded-2xl p-5 flex flex-col gap-2 shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer ${color}`}
    onClick={onClick}
  >
    <div className="flex items-center gap-2">
      {icon && <span>{icon}</span>}
      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
    <span className="text-2xl font-black text-brand-dark">{value}</span>
    {trend && <span className="text-xs text-emerald-600 font-bold">{trend}</span>}
  </div>
);
