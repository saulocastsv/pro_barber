import React from 'react';
import { Check, AlertCircle } from 'lucide-react';

export const Toast: React.FC<{
  message: string;
  type?: 'success' | 'error';
  onClose?: () => void;
  className?: string;
}> = ({ message, type = 'success', onClose, className = '' }) => (
  <div
    className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl animate-fade-in border font-semibold text-xs ${
      type === 'success'
        ? 'bg-emerald-600 border-emerald-500 text-white'
        : 'bg-white border-red-100 text-red-600'
    } ${className}`}
    role="status"
    aria-live="polite"
  >
    {type === 'success' ? <Check size={16} className="text-white" /> : <AlertCircle size={16} />}
    <span>{message}</span>
    {onClose && (
      <button onClick={onClose} className="ml-2 text-sm opacity-70">×</button>
    )}
  </div>
);

export default Toast;
