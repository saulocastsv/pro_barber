// Seção visual reutilizável para agrupamento de conteúdo
import React from 'react';

interface SectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({ title, children, className }) => (
  <section className={`bg-white rounded-2xl shadow-sm p-6 mb-6 ${className || ''}`}>
    {title && <h2 className="text-lg font-black text-brand-dark mb-4">{title}</h2>}
    {children}
  </section>
);
