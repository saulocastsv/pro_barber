/**
 * UIKit: Componentes reutilizáveis para manter consistência de design
 * Implementa boas práticas de UX: espaçamento, hierarquia, acessibilidade
 */

import React from 'react';
import { AlertCircle, Info } from 'lucide-react';

// Card reutilizável com padrão de espaçamento
export const Card: React.FC<{
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'bordered';
  className?: string;
}> = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-white rounded-2xl border border-slate-100 shadow-sm p-6',
    elevated: 'bg-white rounded-2xl shadow-lg border border-slate-100 p-6',
    bordered: 'bg-slate-50 rounded-2xl border-2 border-slate-200 p-6'
  };
  return <div className={`${variants[variant]} ${className}`}>{children}</div>;
};

// Heading com hierarquia clara
export const Heading: React.FC<{
  level: 1 | 2 | 3 | 4;
  children: React.ReactNode;
  subtitle?: string;
  className?: string;
}> = ({ level, children, subtitle, className = '' }) => {
  const sizes = {
    1: 'text-3xl md:text-4xl',
    2: 'text-2xl md:text-3xl',
    3: 'text-xl md:text-2xl',
    4: 'text-lg md:text-xl'
  };
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return (
    <div className={className}>
      <Tag className={`${sizes[level]} font-black text-brand-dark tracking-tight`}>{children}</Tag>
      {subtitle && <p className="text-sm text-slate-500 mt-1 font-medium">{subtitle}</p>}
    </div>
  );
};

// Stat card com espaçamento consistente
export const StatCard: React.FC<{
  label: string;
  value: string | number;
  unit?: string;
  trend?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}> = ({ label, value, unit, trend, icon, onClick }) => (
  <div
    onClick={onClick}
    className={`p-6 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-1' : ''}`}
  >
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-brand-dark">{value}</span>
          {unit && <span className="text-sm text-slate-400 font-medium">{unit}</span>}
        </div>
        {trend && <p className="text-xs font-bold text-emerald-600 mt-2">↑ {trend}</p>}
      </div>
      {icon && <div className="text-slate-400">{icon}</div>}
    </div>
  </div>
);

// Button com variantes
export const Button: React.FC<{
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}> = ({ children, variant = 'primary', size = 'md', disabled, onClick, className = '' }) => {
  const variants = {
    primary: 'bg-brand-dark text-white hover:bg-black',
    secondary: 'bg-brand-light text-white hover:bg-brand-light/90',
    outline: 'border-2 border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white',
    ghost: 'text-brand-dark hover:bg-slate-100'
  };
  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base'
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${variants[variant]} ${sizes[size]} font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 ${className}`}
    >
      {children}
    </button>
  );
};

// Alert com padrão consistente
export const Alert: React.FC<{
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message?: string;
  onClose?: () => void;
}> = ({ type, title, message, onClose }) => {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    error: 'bg-red-50 border-red-200 text-red-900',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900'
  };
  const icons = {
    info: <Info size={18} />,
    warning: <AlertCircle size={18} />,
    error: <AlertCircle size={18} />,
    success: <AlertCircle size={18} />
  };
  return (
    <div className={`p-4 rounded-xl border ${styles[type]} flex items-start gap-3`}>
      <div className="mt-0.5">{icons[type]}</div>
      <div className="flex-1">
        <h4 className="font-bold text-sm">{title}</h4>
        {message && <p className="text-xs mt-1 opacity-90">{message}</p>}
      </div>
      {onClose && (
        <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100">✕</button>
      )}
    </div>
  );
};

// Section wrapper com consistent heading
export const Section: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, subtitle, action, children }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-start">
      <Heading level={2} subtitle={subtitle}>{title}</Heading>
      {action && <div>{action}</div>}
    </div>
    {children}
  </div>
);

// Form input with label
export const FormInput: React.FC<{
  label: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  icon?: React.ReactNode;
  error?: string;
}> = ({ label, type = 'text', placeholder, value, onChange, required, icon, error }) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">{label} {required && <span className="text-red-500">*</span>}</label>
    <div className="relative">
      {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full ${icon ? 'pl-12' : 'pl-4'} pr-4 py-3 bg-slate-50 border rounded-xl outline-none focus:bg-white transition-all ${error ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-brand-dark'}`}
      />
    </div>
    {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
  </div>
);

export * from './UIKit/Loading';
export * from './UIKit/Toast';
export * from './UIKit/Feedback';
export default { Card, Heading, StatCard, Button, Alert, Section, FormInput };
