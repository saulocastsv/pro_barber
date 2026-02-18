import React from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

export const Feedback: React.FC<{
  type?: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  action?: React.ReactNode;
  className?: string;
}> = ({ type = 'info', title, message, action, className = '' }) => {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    error: 'bg-red-50 border-red-200 text-red-900',
  };
  const icons = {
    info: <Info size={20} />,
    success: <CheckCircle size={20} />,
    warning: <AlertCircle size={20} />,
    error: <AlertCircle size={20} />,
  };
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${styles[type]} ${className}`} role="alert" aria-live="polite">
      <div className="mt-0.5">{icons[type]}</div>
      <div className="flex-1">
        <h4 className="font-bold text-sm">{title}</h4>
        {message && <p className="text-xs mt-1 opacity-90">{message}</p>}
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  );
};

export default Feedback;
