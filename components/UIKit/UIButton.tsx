// Botão padrão reutilizável
import React from 'react';

interface UIButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const UIButton: React.FC<UIButtonProps> = ({
  children, variant = 'primary', size = 'md', loading, iconLeft, iconRight, ...props
}) => {
  const base = 'inline-flex items-center justify-center font-bold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-brand-accent/30';
  const variants = {
    primary: 'bg-brand-accent text-white hover:bg-blue-700',
    secondary: 'bg-slate-100 text-brand-dark hover:bg-slate-200',
    ghost: 'bg-transparent text-brand-dark hover:bg-slate-100',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2 text-sm',
    lg: 'px-7 py-3 text-base',
  };
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${loading ? 'opacity-60 cursor-wait' : ''}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {iconLeft && <span className="mr-2">{iconLeft}</span>}
      {loading ? 'Aguarde...' : children}
      {iconRight && <span className="ml-2">{iconRight}</span>}
    </button>
  );
};
