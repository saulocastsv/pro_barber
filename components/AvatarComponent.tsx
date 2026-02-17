import React from 'react';
import { User } from 'lucide-react';

interface AvatarComponentProps {
  url?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AvatarComponent: React.FC<AvatarComponentProps> = ({
  url,
  name = 'Usuario',
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 32
  };

  // Se houver URL, usar imagem
  if (url) {
    return (
      <div className={`${sizeClasses[size]} rounded-lg overflow-hidden bg-brand-light flex items-center justify-center ${className}`}>
        <img src={url} alt={name} className="w-full h-full object-cover" />
      </div>
    );
  }

  // Caso contrário, usar ícone Lucide
  return (
    <div className={`${sizeClasses[size]} rounded-lg bg-gradient-to-br from-brand-accent to-blue-600 flex items-center justify-center shadow-md ${className}`}>
      <User size={iconSizes[size]} className="text-white" />
    </div>
  );
};
